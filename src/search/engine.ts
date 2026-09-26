import MiniSearch, { SearchResult } from 'minisearch';
import { Post } from '../types';

export interface IndexedPostDocument {
  id: string;
  text: string;
  authorName: string;
  authorScreenName: string;
  articleTitle: string;
  articleText: string;
}

// Regex covering CJK Ideographs, Hiragana, Katakana, and Korean Hangul
const CJK_HANGUL_REGEX = /[\u4e00-\u9fa5\u3040-\u30ff\u3400-\u4dbf\uac00-\ud7af]/;

function multiLanguageTokenizer(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(
        ['en', 'zh', 'ja', 'es', 'pt', 'id', 'de', 'fr', 'tr', 'ar', 'ko'],
        { granularity: 'word' }
      );
      const tokens: string[] = [];
      for (const segment of segmenter.segment(text)) {
        const seg = segment.segment;
        if (segment.isWordLike) {
          tokens.push(seg);
          // For CJK and Hangul characters, also index unigrams and bigrams
          // so character-level and sub-word queries match accurately
          if (CJK_HANGUL_REGEX.test(seg) && seg.length > 1) {
            for (let i = 0; i < seg.length; i++) {
              tokens.push(seg[i]);
              if (i < seg.length - 1) {
                tokens.push(seg.slice(i, i + 2));
              }
            }
          }
        } else {
          const trimmed = seg.trim();
          if (trimmed.length > 0 && !/^[\s,.:;!?'"()\[\]{}]+$/.test(trimmed)) {
            tokens.push(trimmed);
          }
        }
      }
      return tokens;
    } catch {
      // Fallback below
    }
  }
  return text.split(/[\s,.:;!?'"()\[\]{}+/\\-]+/).filter(Boolean);
}

// Normalize accents/diacritics (e.g. café -> cafe, búsqueda -> busqueda) and lowercase
export function normalizeTerm(term: string): string {
  return term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export class SearchEngine {
  private miniSearch: MiniSearch<IndexedPostDocument>;
  private indexedIds: Set<string> = new Set();

  constructor() {
    this.miniSearch = new MiniSearch<IndexedPostDocument>({
      fields: ['text', 'authorName', 'authorScreenName', 'articleTitle', 'articleText'],
      storeFields: ['id'],
      tokenize: multiLanguageTokenizer,
      processTerm: normalizeTerm,
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          articleTitle: 3,
          authorName: 2,
          authorScreenName: 2,
          text: 1.5,
          articleText: 1,
        },
      },
    });
  }

  private mapPostToDoc(post: Post): IndexedPostDocument {
    return {
      id: post.id,
      text: post.text || '',
      authorName: post.author?.name || '',
      authorScreenName: post.author?.screenName || '',
      articleTitle: post.richContent?.title || '',
      articleText: post.richContent?.paragraphs?.join(' ') || '',
    };
  }

  public indexPosts(posts: Post[]): void {
    const docsToAdd: IndexedPostDocument[] = [];
    for (const post of posts) {
      if (this.indexedIds.has(post.id)) {
        // Discard old doc if re-indexing
        this.miniSearch.discard(post.id);
      }
      docsToAdd.push(this.mapPostToDoc(post));
      this.indexedIds.add(post.id);
    }
    if (docsToAdd.length > 0) {
      this.miniSearch.addAll(docsToAdd);
    }
  }

  public upsertPost(post: Post): void {
    if (this.indexedIds.has(post.id)) {
      this.miniSearch.discard(post.id);
    }
    this.miniSearch.add(this.mapPostToDoc(post));
    this.indexedIds.add(post.id);
  }

  public removePost(id: string): void {
    if (this.indexedIds.has(id)) {
      this.miniSearch.discard(id);
      this.indexedIds.delete(id);
    }
  }

  public clear(): void {
    this.miniSearch.removeAll();
    this.indexedIds.clear();
  }

  public search(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
      const results: SearchResult[] = this.miniSearch.search(trimmed);
      return results.map(r => r.id);
    } catch (e) {
      console.warn('[SeenX] Search error:', e);
      return [];
    }
  }
}

let globalSearchEngine: SearchEngine | null = null;

export function getSearchEngine(): SearchEngine {
  if (!globalSearchEngine) {
    globalSearchEngine = new SearchEngine();
  }
  return globalSearchEngine;
}
