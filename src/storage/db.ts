import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Post } from '../types';

interface SeenXSchema extends DBSchema {
  posts: {
    key: string;
    value: Post;
    indexes: {
      'by_last_seen': number;
      'by_post_type': string;
      'by_starred': number;
      'by_author': string;
      'by_conversation': string;
    };
  };
}

const DB_NAME = 'seenx_db';
const DB_VERSION = 1;
const CHANNEL_NAME = 'seenx_db_sync';

let dbPromise: Promise<IDBPDatabase<SeenXSchema>> | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel !== 'undefined' && !broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

function notifyChange(type: 'upsert' | 'delete' | 'clear', data?: any) {
  try {
    const ch = getChannel();
    if (ch) {
      ch.postMessage({ type, data, timestamp: Date.now() });
    }
  } catch (e) {
    // Ignore channel errors
  }
}

export function subscribeToDBChanges(callback: (event: { type: 'upsert' | 'delete' | 'clear'; data?: any }) => void): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (e: MessageEvent) => {
    callback(e.data);
  };

  ch.addEventListener('message', handler);
  return () => {
    ch.removeEventListener('message', handler);
  };
}

export function getDB(): Promise<IDBPDatabase<SeenXSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<SeenXSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('posts')) {
          const store = db.createObjectStore('posts', { keyPath: 'id' });
          store.createIndex('by_last_seen', 'lastSeenAt');
          store.createIndex('by_post_type', 'postType');
          store.createIndex('by_starred', 'starred');
          store.createIndex('by_author', 'author.screenName');
          store.createIndex('by_conversation', 'threadInfo.conversationId');
        }
      },
    });
  }
  return dbPromise;
}

export async function savePost(postInput: Partial<Post> & { id: string }): Promise<Post> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');

  const existing = await store.get(postInput.id);
  const now = Date.now();

  let finalPost: Post;
  if (existing) {
    finalPost = {
      ...existing,
      ...postInput,
      author: {
        ...existing.author,
        ...(postInput.author || {}),
      },
      media: (postInput.media && postInput.media.length > 0) ? postInput.media : existing.media,
      richContent: postInput.richContent || existing.richContent,
      threadInfo: postInput.threadInfo || existing.threadInfo,
      metrics: postInput.metrics || existing.metrics,
      firstSeenAt: existing.firstSeenAt,
      lastSeenAt: now,
      seenCount: (existing.seenCount || 1) + 1,
      engaged: existing.engaged || !!postInput.engaged,
      starred: existing.starred, // Preserve user's star setting
    };
  } else {
    finalPost = {
      id: postInput.id,
      url: postInput.url || `https://x.com/i/web/status/${postInput.id}`,
      author: postInput.author || {
        id: '',
        name: 'Unknown',
        screenName: 'unknown',
        avatarUrl: '',
      },
      text: postInput.text || '',
      postType: postInput.postType || 'standard',
      media: postInput.media || [],
      quotedPost: postInput.quotedPost,
      richContent: postInput.richContent,
      threadInfo: postInput.threadInfo,
      metrics: postInput.metrics,
      firstSeenAt: now,
      lastSeenAt: now,
      seenCount: 1,
      engaged: !!postInput.engaged,
      starred: false,
      isPromoted: !!postInput.isPromoted,
    };
  }

  await store.put(finalPost);
  await tx.done;

  notifyChange('upsert', finalPost);
  return finalPost;
}

export async function getPost(id: string): Promise<Post | undefined> {
  const db = await getDB();
  return db.get('posts', id);
}

export async function getAllPosts(): Promise<Post[]> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readonly');
  const index = tx.objectStore('posts').index('by_last_seen');
  // Return sorted descending by lastSeenAt
  const posts = await index.getAll();
  return posts.reverse();
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('posts', id);
  notifyChange('delete', { id });
}

export async function toggleStar(id: string): Promise<boolean> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');
  const post = await store.get(id);
  if (!post) {
    await tx.done;
    return false;
  }
  post.starred = !post.starred;
  await store.put(post);
  await tx.done;
  notifyChange('upsert', post);
  return post.starred;
}

export async function clearAllPosts(): Promise<void> {
  const db = await getDB();
  await db.clear('posts');
  notifyChange('clear');
}

export async function cleanupRetention(days: number): Promise<number> {
  if (days <= 0) return 0;
  const db = await getDB();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');
  const index = store.index('by_last_seen');

  const range = IDBKeyRange.upperBound(cutoff);
  let cursor = await index.openCursor(range);
  let deletedCount = 0;

  while (cursor) {
    await cursor.delete();
    deletedCount++;
    cursor = await cursor.continue();
  }

  await tx.done;
  if (deletedCount > 0) {
    notifyChange('clear');
  }
  return deletedCount;
}

export async function getThreadPosts(conversationId: string): Promise<Post[]> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readonly');
  const index = tx.objectStore('posts').index('by_conversation');
  const posts = await index.getAll(conversationId);
  return posts.sort((a, b) => a.firstSeenAt - b.firstSeenAt);
}

export async function batchImportPosts(posts: Post[]): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');

  let count = 0;
  for (const post of posts) {
    if (post && post.id) {
      await store.put(post);
      count++;
    }
  }

  await tx.done;
  notifyChange('clear'); // Signal full refresh
  return count;
}
