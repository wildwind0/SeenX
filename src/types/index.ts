export type PostType = 'standard' | 'article' | 'video' | 'quote' | 'thread';

export interface Author {
  id: string;
  name: string;
  screenName: string;
  avatarUrl: string;
  verified?: boolean;
}

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
  previewUrl?: string;
  videoUrl?: string;
  durationMs?: number;
  width?: number;
  height?: number;
}

export interface QuotedPost {
  id: string;
  author: Author;
  text: string;
  media?: MediaItem[];
}

export interface ArticleRichContent {
  title?: string;
  previewText?: string;
  coverImageUrl?: string;
  paragraphs: string[];
  wordCount?: number;
}

export interface ThreadInfo {
  conversationId: string;
  inReplyToStatusId?: string;
  threadPostCount?: number;
}

export interface PostMetrics {
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  viewCount?: number;
}

export interface Post {
  id: string;
  url: string;
  author: Author;
  text: string;
  postType: PostType;
  media: MediaItem[];
  quotedPost?: QuotedPost;
  richContent?: ArticleRichContent;
  threadInfo?: ThreadInfo;
  metrics?: PostMetrics;
  firstSeenAt: number;
  lastSeenAt: number;
  seenCount: number;
  engaged: boolean;
  starred: boolean;
  isPromoted?: boolean;
}

export type CaptureMode = 'all_qualifying' | 'engaged_only';

export interface CaptureRules {
  captureMode: CaptureMode;
  dwellTimeMs: number;
  filterPromoted: boolean;
  retentionDays: number; // 0 = keep forever, 30, 90, 180
}

export const DEFAULT_CAPTURE_RULES: CaptureRules = {
  captureMode: 'all_qualifying',
  dwellTimeMs: 1500,
  filterPromoted: true,
  retentionDays: 0,
};

export type FilterCategory = 'all' | 'starred' | 'standard' | 'article' | 'video' | 'quote' | 'thread';
export type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface SearchFilterState {
  query: string;
  category: FilterCategory;
  author?: string;
  dateRange: DateFilter;
}
