import { Post } from '../types';
import { formatDateTime } from './formatters';

export function postToMarkdown(post: Post): string {
  const parts: string[] = [];

  // Title / Header
  const title = post.richContent?.title || `Post by ${post.author.name} (@${post.author.screenName})`;
  parts.push(`## [${title}](${post.url})\n`);

  // Metadata block
  parts.push(`- **作者**: ${post.author.name} ([@${post.author.screenName}](https://x.com/${post.author.screenName}))`);
  parts.push(`- **类型**: ${post.postType}`);
  parts.push(`- **首见时间**: ${formatDateTime(post.firstSeenAt)}`);
  parts.push(`- **最近浏览**: ${formatDateTime(post.lastSeenAt)}`);
  parts.push(`- **原帖链接**: [${post.url}](${post.url})\n`);

  // Content
  if (post.postType === 'article' && post.richContent) {
    if (post.richContent.title) {
      parts.push(`### ${post.richContent.title}\n`);
    }
    if (post.richContent.coverImageUrl) {
      parts.push(`![Cover Image](${post.richContent.coverImageUrl})\n`);
    }
    for (const p of post.richContent.paragraphs) {
      parts.push(`${p}\n`);
    }
  } else {
    parts.push(`> ${post.text.replace(/\n/g, '\n> ')}\n`);
  }

  // Quoted post
  if (post.quotedPost) {
    parts.push(`#### 引用推文 (@${post.quotedPost.author.screenName})`);
    parts.push(`> ${post.quotedPost.text.replace(/\n/g, '\n> ')}\n`);
  }

  // Media
  if (post.media && post.media.length > 0) {
    parts.push('**媒体附件**:');
    for (const m of post.media) {
      if (m.type === 'video' && m.videoUrl) {
        parts.push(`- [观看视频](${m.videoUrl}) (时长: ${m.durationMs ? Math.round(m.durationMs / 1000) + 's' : '未知'})`);
      } else if (m.url) {
        parts.push(`![Image](${m.url})`);
      }
    }
    parts.push('');
  }

  parts.push('---\n');
  return parts.join('\n');
}

export function exportToMarkdown(posts: Post[]): void {
  const header = `# SeenX 浏览历史导出\n\n> 导出时间: ${formatDateTime(Date.now())} | 共 ${posts.length} 条记录\n\n---\n\n`;
  const body = posts.map(postToMarkdown).join('\n');
  const fullContent = header + body;

  const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `seenx-history-${new Date().toISOString().slice(0, 10)}.md`);
}

export function exportToJson(posts: Post[]): void {
  const data = {
    version: '1.0.0',
    exportTimestamp: Date.now(),
    exportDate: new Date().toISOString(),
    totalCount: posts.length,
    posts,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `seenx-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file: File): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else if (parsed && Array.isArray(parsed.posts)) {
          resolve(parsed.posts);
        } else {
          reject(new Error('Invalid backup file format: missing posts array'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
