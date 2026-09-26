import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Type, Minus, Plus } from 'lucide-react';
import { Post } from '../types';
import { postToMarkdown } from '../utils/export';
import { formatDateTime } from '../utils/formatters';
import { useI18n } from '../i18n';

interface ReaderModalProps {
  post: Post | null;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ post, onClose }) => {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post || !post.richContent) return null;

  const handleCopyMarkdown = async () => {
    try {
      const md = postToMarkdown(post);
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#0f1115] border border-[#2f3336] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f3336] bg-[#16181c]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              {t('reader.tag')}
            </span>
            <span className="text-xs text-[#71767b]">
              {t('reader.wordCount', { count: post.richContent.wordCount || 0 })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#202327] rounded-lg p-1 text-[#71767b]">
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="p-1 hover:text-white rounded"
                title={t('reader.zoomOut')}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <Type className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <button
                onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                className="p-1 hover:text-white rounded"
                title={t('reader.zoomIn')}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#202327] hover:bg-[#2c313a] text-[#e7e9ea] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('reader.copiedMarkdown') : t('reader.copyMarkdown')}
            </button>

            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-[#71767b] hover:text-[#1d9bf0] transition-colors"
              title={t('reader.openOriginal')}
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-[#71767b] hover:text-white transition-colors ml-1"
              title={t('reader.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          {post.richContent.coverImageUrl && (
            <div className="rounded-xl overflow-hidden max-h-[360px] bg-black">
              <img
                src={post.richContent.coverImageUrl}
                alt="Article cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#e7e9ea] tracking-tight leading-tight">
            {post.richContent.title || t('reader.untitled')}
          </h1>

          <div className="flex items-center gap-3 py-3 border-y border-[#2f3336]">
            {post.author.avatarUrl && !avatarError ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover bg-[#2f3336]"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1d9bf0]/25 to-purple-500/25 border border-[#2f3336] flex items-center justify-center font-bold text-sm text-[#e7e9ea] shrink-0">
                {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'X'}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-[#e7e9ea]">{post.author.name}</div>
              <div className="text-xs text-[#71767b]">
                @{post.author.screenName} · {t('reader.viewedAt', { date: formatDateTime(post.lastSeenAt) })}
              </div>
            </div>
          </div>

          <div
            className="text-[#d6d9db] leading-relaxed space-y-5"
            style={{ fontSize: `${fontSize}px` }}
          >
            {post.richContent.paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
