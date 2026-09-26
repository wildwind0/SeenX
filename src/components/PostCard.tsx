import React, { useState } from 'react';
import { 
  Star, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  BookOpen, 
  BadgeCheck, 
  MessageSquare, 
  Repeat2, 
  Heart, 
  Eye, 
  Layers 
} from 'lucide-react';
import { Post } from '../types';
import { formatRelativeTime, formatMetricNumber, formatDuration } from '../utils/formatters';
import { toggleStar, deletePost, getThreadPosts } from '../storage/db';
import { useI18n } from '../i18n';

interface PostCardProps {
  post: Post;
  threadCount?: number;
  onPostDeleted?: (id: string) => void;
  onAuthorClick?: (screenName: string) => void;
  onOpenArticleReader?: (post: Post) => void;
  compact?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  threadCount = 1,
  onPostDeleted,
  onAuthorClick,
  onOpenArticleReader,
  compact = false,
}) => {
  const { t, lang } = useI18n();
  const [starred, setStarred] = useState(post.starred);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [threadPosts, setThreadPosts] = useState<Post[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = await toggleStar(post.id);
    setStarred(newStatus);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePost(post.id);
    onPostDeleted?.(post.id);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(post.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleExpandThread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showThread && post.threadInfo?.conversationId) {
      setLoadingThread(true);
      const posts = await getThreadPosts(post.threadInfo.conversationId);
      // Exclude current post from the list
      setThreadPosts(posts.filter(p => p.id !== post.id));
      setLoadingThread(false);
    }
    setShowThread(!showThread);
  };

  const videoMedia = post.media.find(m => m.type === 'video' || m.type === 'gif');
  const imageMedia = post.media.filter(m => m.type === 'image');

  return (
    <div className="group relative bg-[#16181c] border border-[#2f3336] hover:border-[#536471] rounded-2xl p-4 transition-all duration-200">
      {/* Header: Author + Meta + Actions */}
      <div className="flex items-start justify-between gap-3">
        {/* Author info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {post.author.avatarUrl && !avatarError ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover bg-[#2f3336] shrink-0"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1d9bf0]/25 to-purple-500/25 border border-[#2f3336] flex items-center justify-center font-bold text-sm text-[#e7e9ea] shrink-0">
              {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'X'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-[#e7e9ea] truncate">{post.author.name}</span>
              {post.author.verified && (
                <BadgeCheck className="w-4 h-4 text-[#1d9bf0] shrink-0 fill-[#1d9bf0]" />
              )}
            </div>
            <button
              onClick={() => onAuthorClick?.(post.author.screenName)}
              className="text-xs text-[#71767b] hover:text-[#1d9bf0] hover:underline truncate block text-left"
            >
              @{post.author.screenName} · {formatRelativeTime(post.lastSeenAt, lang)}
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 text-[#71767b]">
          <button
            onClick={handleToggleStar}
            className={`p-1.5 rounded-full hover:bg-[#1d9bf0]/10 transition-colors ${
              starred ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-400'
            }`}
            title={starred ? t('postCard.unstar') : t('postCard.star')}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title={t('postCard.copyLink')}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full hover:bg-white/10 hover:text-[#1d9bf0] transition-colors"
            title={t('common.openInX')}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-full hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            title={t('postCard.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta tags (Seen count, Article / Thread badges) */}
      <div className="flex items-center gap-2 mt-2">
        {post.postType === 'article' && (
          <button
            onClick={() => onOpenArticleReader?.(post)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {t('postCard.readArticle')}
          </button>
        )}
        {post.postType === 'thread' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Layers className="w-3 h-3" />
            {t('postCard.threadReply')}
          </span>
        )}
        {post.seenCount > 1 && (
          <span className="text-[11px] font-mono text-[#71767b] bg-[#202327] px-2 py-0.5 rounded-full">
            {t('postCard.revisitedTimes', { count: post.seenCount })}
          </span>
        )}
      </div>

      {/* Tweet Body Text */}
      {post.text && (
        <p className={`mt-2.5 text-sm text-[#e7e9ea] whitespace-pre-wrap leading-relaxed ${
          compact ? 'line-clamp-4' : 'line-clamp-6'
        }`}>
          {post.text}
        </p>
      )}

      {/* Media: Video Player */}
      {videoMedia && (
        <div className="mt-3 rounded-xl overflow-hidden border border-[#2f3336] bg-black">
          {isPlayingVideo && videoMedia.videoUrl ? (
            <video
              src={videoMedia.videoUrl}
              controls
              autoPlay
              className="w-full max-h-[360px] object-contain bg-black"
            />
          ) : (
            <div
              onClick={() => setIsPlayingVideo(true)}
              className="relative cursor-pointer group/vid aspect-video max-h-[300px] flex items-center justify-center bg-black overflow-hidden"
            >
              <img
                src={videoMedia.previewUrl || videoMedia.url}
                alt="Video thumbnail"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/vid:bg-black/30 transition-all">
                <div className="w-12 h-12 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white shadow-lg group-hover/vid:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </div>
              </div>
              {videoMedia.durationMs && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-mono text-white">
                  {formatDuration(videoMedia.durationMs)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Media: Images */}
      {imageMedia.length > 0 && !videoMedia && (
        <div className={`mt-3 rounded-xl overflow-hidden border border-[#2f3336] grid gap-1 ${
          imageMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {imageMedia.slice(0, 4).map((img, i) => (
            <a
              key={i}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-black max-h-[260px] overflow-hidden"
            >
              <img
                src={img.url}
                alt="Post attachment"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </a>
          ))}
        </div>
      )}

      {/* Quoted Post Sub-card */}
      {post.quotedPost && (
        <div className="mt-3 p-3 rounded-xl bg-[#000000]/40 border border-[#2f3336] text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#71767b]">
            <span className="text-[#e7e9ea]">{post.quotedPost.author.name}</span>
            <span>@{post.quotedPost.author.screenName}</span>
          </div>
          <div className="mt-1 text-[#d6d9db] line-clamp-3">
            {post.quotedPost.text}
          </div>
        </div>
      )}

      {/* Metrics Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-[#2f3336]/60 flex items-center justify-between text-xs text-[#71767b]">
        <div className="flex items-center gap-4">
          {post.metrics?.replyCount !== undefined && (
            <span className="flex items-center gap-1 hover:text-[#1d9bf0]">
              <MessageSquare className="w-3.5 h-3.5" />
              {formatMetricNumber(post.metrics.replyCount)}
            </span>
          )}
          {post.metrics?.retweetCount !== undefined && (
            <span className="flex items-center gap-1 hover:text-emerald-400">
              <Repeat2 className="w-3.5 h-3.5" />
              {formatMetricNumber(post.metrics.retweetCount)}
            </span>
          )}
          {post.metrics?.likeCount !== undefined && (
            <span className="flex items-center gap-1 hover:text-rose-500">
              <Heart className="w-3.5 h-3.5" />
              {formatMetricNumber(post.metrics.likeCount)}
            </span>
          )}
          {post.metrics?.viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatMetricNumber(post.metrics.viewCount)}
            </span>
          )}
        </div>

        {/* Thread Link / Expand: ONLY show if there are actually multiple posts from this conversation in DB */}
        {threadCount > 1 && post.threadInfo?.conversationId && (
          <button
            onClick={handleExpandThread}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showThread ? t('postCard.collapseThread') : t('postCard.threadSeries', { count: threadCount })}</span>
          </button>
        )}
      </div>

      {/* Expanded Thread Sub-posts */}
      {showThread && (
        <div className="mt-3 pt-3 border-t border-[#2f3336] space-y-2">
          {loadingThread ? (
            <div className="text-xs text-[#71767b] py-2 text-center">{t('postCard.loadingThread')}</div>
          ) : threadPosts.length === 0 ? (
            <div className="text-xs text-[#71767b] py-2 text-center">{t('postCard.noOtherPosts')}</div>
          ) : (
            <>
              <div className="text-[11px] font-semibold text-[#71767b] px-1 flex items-center justify-between">
                <span>{t('postCard.recordedThreadPosts')}</span>
                <span className="text-[#1d9bf0] font-mono">{t('postCard.itemsCount', { count: threadPosts.length })}</span>
              </div>
              {threadPosts.map(tp => (
                <a
                  key={tp.id}
                  href={tp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block p-2.5 rounded-lg bg-[#000000]/60 border border-[#2f3336] hover:border-[#1d9bf0]/50 text-xs transition-colors group/item"
                >
                  <div className="flex items-center justify-between text-[#71767b]">
                    <span className="font-semibold text-[#e7e9ea] group-hover/item:text-[#1d9bf0] transition-colors">{tp.author.name}</span>
                    <span>{formatRelativeTime(tp.lastSeenAt, lang)}</span>
                  </div>
                  <p className="mt-1 text-[#d6d9db] line-clamp-3">{tp.text}</p>
                </a>
              ))}
              <div className="pt-1 flex items-center justify-between text-[11px] text-[#71767b] px-1">
                <span>{t('postCard.onlyBrowsedFootnote')}</span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1d9bf0] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('postCard.viewFullDiscussion')}
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
