import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  CheckCircle2, 
  Palette, 
  TrendingUp, 
  CalendarDays, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Post } from '../types';
import { 
  buildHeatmapCalendar, 
  buildIntradayTimeline, 
  getHeatmapWeeksForSpan, 
  HEATMAP_THEMES, 
  HeatmapTheme, 
  HeatmapTimeSpan 
} from '../utils/activity';
import { 
  renderActivityCard, 
  renderDailyRecapCard, 
  exportCanvasToBlob 
} from '../utils/canvasCard';
import { useI18n } from '../i18n';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  initialTemplate?: 'recap' | 'heatmap';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  posts,
  initialTemplate = 'recap',
}) => {
  const { t, lang } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Template: 'recap' (Today's recap) vs 'heatmap' (Calendar Heatmap)
  const [template, setTemplate] = useState<'recap' | 'heatmap'>(initialTemplate);
  const [heatmapSpan, setHeatmapSpan] = useState<HeatmapTimeSpan>('1_month');
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>('seenx');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync initial template when opened
  useEffect(() => {
    if (isOpen) {
      setTemplate(initialTemplate);
      setSelectedThemeKey(initialTemplate === 'recap' ? 'seenx' : 'github');
    }
  }, [isOpen, initialTemplate]);

  // Compute Today's Intraday Data
  const intradayData = useMemo(() => {
    return buildIntradayTimeline(posts);
  }, [posts]);

  // Compute Heatmap Calendar Data with dynamic span weeks
  const calendarWeeks = useMemo(() => {
    return getHeatmapWeeksForSpan(posts, heatmapSpan);
  }, [posts, heatmapSpan]);

  const calendarData = useMemo(() => {
    return buildHeatmapCalendar(posts, calendarWeeks, lang);
  }, [posts, calendarWeeks, lang]);

  const activeTheme: HeatmapTheme = HEATMAP_THEMES[selectedThemeKey] || HEATMAP_THEMES.seenx;

  // Render canvas whenever modal opens, template changes, theme changes, or posts update
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    if (template === 'recap') {
      renderDailyRecapCard(canvasRef.current, intradayData, posts, {
        theme: activeTheme,
        lang,
        labels: {
          appName: t('common.appName'),
          tagline: t('share.cardTagline'),
          dailyRecapTitle: t('share.dailyRecapTitle'),
          dailyRecapSubtitle: t('share.dailyRecapSubtitle'),
          totalPostsLabel: t('share.statTotal'),
          unitPost: t('share.unitPost'),
          unitPosts: t('share.unitPosts'),
          unitDay: t('share.unitDay'),
          unitDays: t('share.unitDays'),
          unitMinute: t('share.unitMinute'),
          unitMinutes: t('share.unitMinutes'),
          peakHourLabel: t('share.peakHourLabel'),
          activeMinutesLabel: t('share.activeMinutesLabel'),
          privacyNotice: t('share.cardPrivacy'),
          categoryStandard: t('categories.standard'),
          categoryArticle: t('categories.article'),
          categoryVideo: t('categories.video'),
          categoryQuote: t('categories.quote'),
          categoryThread: t('categories.thread'),
        },
      });
    } else {
      renderActivityCard(canvasRef.current, calendarData, posts, {
        theme: activeTheme,
        lang,
        labels: {
          appName: t('common.appName'),
          tagline: t('share.cardTagline'),
          totalPostsLabel: t('share.statTotal'),
          unitPost: t('share.unitPost'),
          unitPosts: t('share.unitPosts'),
          unitDay: t('share.unitDay'),
          unitDays: t('share.unitDays'),
          activeDaysLabel: t('share.statActive'),
          currentStreakLabel: t('share.statStreak'),
          longestStreakLabel: t('share.statBest'),
          heatmapTitle: t('share.heatmapWeeksTitle', { weeks: calendarWeeks }),
          heatmapSub: `${t('share.peakDay')}: ${calendarData.mostActiveCount} · ${t('share.avgDay')}: ${calendarData.dailyAvg}`,
          timelineTitle: t('share.timelineTitle'),
          emptyToday: t('share.noActivityToday'),
          emptyCategory: t('share.noCategoryData'),
          lessLabel: t('heatmap.less'),
          moreLabel: t('heatmap.more'),
          weekdayMon: t('heatmap.weekdayMon'),
          weekdayWed: t('heatmap.weekdayWed'),
          weekdayFri: t('heatmap.weekdayFri'),
          privacyNotice: t('share.cardPrivacy'),
          categoryStandard: t('categories.standard'),
          categoryArticle: t('categories.article'),
          categoryVideo: t('categories.video'),
          categoryQuote: t('categories.quote'),
          categoryThread: t('categories.thread'),
        },
      });
    }
  }, [isOpen, template, heatmapSpan, calendarWeeks, activeTheme, calendarData, intradayData, posts, lang, t]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const getShareText = () => {
    if (template === 'recap') {
      return t('share.tweetTemplateToday', {
        total: intradayData.totalToday,
        peak: intradayData.peakHour || t('share.allDay'),
      });
    }
    return t('share.tweetTemplate', {
      total: calendarData.totalPosts,
      active: calendarData.activeDays,
      streak: calendarData.currentStreak,
    });
  };

  // Copy canvas image blob to clipboard
  const copyCardImageToClipboard = async (): Promise<boolean> => {
    if (!canvasRef.current) return false;
    try {
      const blob = await exportCanvasToBlob(canvasRef.current);
      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        return true;
      }
    } catch (err) {
      console.warn('[SeenX] Clipboard image write fallback:', err);
    }
    return false;
  };

  // 1. Copy Image to Clipboard
  const handleCopyImage = async () => {
    setIsProcessing(true);
    try {
      const success = await copyCardImageToClipboard();
      if (success) {
        showToast(t('share.imageCopied'));
      } else {
        throw new Error('ClipboardItem not supported');
      }
    } catch (err) {
      handleDownloadPng();
      showToast(t('share.copyImageFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Download HD PNG
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = template === 'recap'
        ? `seenx-daily-recap-${intradayData.todayKey}.png`
        : `seenx-activity-${heatmapSpan}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(t('share.downloadSuccess'));
    } catch (e) {
      console.error('[SeenX] Failed to download PNG:', e);
    }
  };

  // 3. Share to X (Twitter)
  const handleShareToX = async () => {
    setIsProcessing(true);
    await copyCardImageToClipboard();
    setIsProcessing(false);

    const text = getShareText();
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(intentUrl, '_blank');
    showToast(t('share.shareWithImageNotice'));
  };

  // 4. Share to Telegram
  const handleShareToTelegram = async () => {
    setIsProcessing(true);
    await copyCardImageToClipboard();
    setIsProcessing(false);

    const text = getShareText();
    const url = `https://t.me/share/url?url=https://github.com/seenx&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(t('share.shareWithImageNotice'));
  };

  // 5. Share to Reddit
  const handleShareToReddit = async () => {
    setIsProcessing(true);
    await copyCardImageToClipboard();
    setIsProcessing(false);

    const title = getShareText();
    const url = `https://reddit.com/submit?title=${encodeURIComponent(title)}`;
    window.open(url, '_blank');
    showToast(t('share.shareWithImageNotice'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white font-medium text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-3xl bg-[#16181c] border border-[#2f3336] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2f3336] pb-3">
          <div className="flex items-center gap-3">
            {/* Template Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#202327] rounded-xl border border-[#2f3336]">
              <button
                onClick={() => setTemplate('recap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  template === 'recap'
                    ? 'bg-emerald-500 text-black shadow-md font-bold'
                    : 'text-[#71767b] hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('share.tabDailyRecap')}</span>
              </button>

              <button
                onClick={() => setTemplate('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  template === 'heatmap'
                    ? 'bg-emerald-500 text-black shadow-md font-bold'
                    : 'text-[#71767b] hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{t('share.tabHeatmap')}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#202327] text-[#71767b] hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Controls Row (Time Span for Heatmap & Theme Picker) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#202327]/40 border border-[#2f3336]/60 p-3 rounded-2xl">
          {/* Heatmap Time Span Selector (Only in Heatmap mode) */}
          {template === 'heatmap' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#71767b] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t('share.timeSpan')}:
              </span>
              <div className="flex items-center gap-1">
                {(['1_month', '3_months', '1_year', 'all_time'] as HeatmapTimeSpan[]).map((sp) => {
                  const active = heatmapSpan === sp;
                  const labelMap: Record<HeatmapTimeSpan, string> = {
                    '1_month': t('heatmap.span1Month'),
                    '3_months': t('heatmap.span3Months'),
                    '1_year': t('heatmap.span1Year'),
                    'all_time': t('heatmap.spanAll'),
                  };
                  return (
                    <button
                      key={sp}
                      onClick={() => setHeatmapSpan(sp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#1d9bf0] text-white font-bold shadow-sm'
                          : 'bg-[#202327] text-[#71767b] hover:text-white hover:bg-[#2f3336]'
                      }`}
                    >
                      {labelMap[sp]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#71767b] flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('share.dailyRecapSubtitle')}</span>
            </div>
          )}

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#71767b]" />
            <div className="flex gap-1.5">
              {Object.values(HEATMAP_THEMES).map((th) => {
                const active = selectedThemeKey === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setSelectedThemeKey(th.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      active
                        ? 'border-white bg-white/10 text-white font-bold'
                        : 'border-[#2f3336] bg-[#202327]/60 text-[#71767b] hover:text-white'
                    }`}
                    title={t(th.nameKey)}
                  >
                    <span
                      style={{ backgroundColor: th.accentColor }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                    <span className="hidden sm:inline text-[11px]">{t(th.nameKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Canvas Preview */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#71767b]">
            {t('share.preview')}
          </div>
          <div className="bg-black/60 rounded-2xl p-3 border border-[#2f3336]/60 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[380px] object-contain rounded-lg shadow-2xl transition-all"
            />
          </div>
        </div>

        {/* Main Sharing Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Share to X */}
          <button
            onClick={handleShareToX}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white text-black hover:bg-[#e7e9ea] active:scale-[0.98] transition-all font-bold text-sm shadow-lg group"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>{t('share.shareToX')}</span>
          </button>

          {/* Copy Image */}
          <button
            onClick={handleCopyImage}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#202327] hover:bg-[#2f3336] active:scale-[0.98] text-[#e7e9ea] border border-[#2f3336] transition-all font-semibold text-sm group"
          >
            <Copy className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span>{t('share.copyImage')}</span>
          </button>

          {/* Download PNG */}
          <button
            onClick={handleDownloadPng}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#202327] hover:bg-[#2f3336] active:scale-[0.98] text-[#e7e9ea] border border-[#2f3336] transition-all font-semibold text-sm group"
          >
            <Download className="w-4 h-4 text-[#1d9bf0] group-hover:scale-110 transition-transform shrink-0" />
            <span>{t('share.downloadPng')}</span>
          </button>
        </div>

        {/* Auto-copy Image Hint Banner */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/25 text-[#1d9bf0] text-xs">
          <Sparkles className="w-4 h-4 shrink-0 text-[#1d9bf0]" />
          <span className="leading-relaxed">
            {t('share.pasteHint')}
          </span>
        </div>

        {/* Quick Social Platform Intents */}
        <div className="pt-2 border-t border-[#2f3336]/60 flex items-center justify-between gap-3 text-xs text-[#71767b]">
          <span className="font-medium">{t('share.platformSharing')}:</span>
          <div className="flex items-center gap-2">
            {/* Telegram - Icon only */}
            <button
              onClick={handleShareToTelegram}
              disabled={isProcessing}
              title={t('share.shareToTelegram')}
              aria-label={t('share.shareToTelegram')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#202327] hover:bg-[#229ED9]/20 text-[#71767b] hover:text-[#229ED9] border border-[#2f3336] transition-all hover:scale-110 active:scale-95 group"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.197 1.006.128.832.946z" />
              </svg>
            </button>

            {/* Reddit - Icon only */}
            <button
              onClick={handleShareToReddit}
              disabled={isProcessing}
              title={t('share.shareToReddit')}
              aria-label={t('share.shareToReddit')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#202327] hover:bg-[#FF4500]/20 text-[#71767b] hover:text-[#FF4500] border border-[#2f3336] transition-all hover:scale-110 active:scale-95 group"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
