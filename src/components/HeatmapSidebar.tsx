import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CalendarDays, 
  Share2, 
  Calendar, 
  X, 
  Flame, 
  ArrowLeftRight, 
  Sparkles 
} from 'lucide-react';
import { Post } from '../types';
import { 
  buildHeatmapCalendar, 
  buildIntradayTimeline, 
  HeatmapDay, 
  HEATMAP_THEMES, 
  IntradayPoint 
} from '../utils/activity';
import { useI18n } from '../i18n';

interface HeatmapSidebarProps {
  posts: Post[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
  onOpenShareModal: (viewMode: 'today' | 'calendar') => void;
}

const STORAGE_VIEW_KEY = 'seenx_activity_view_mode';

export const HeatmapSidebar: React.FC<HeatmapSidebarProps> = ({
  posts,
  selectedDate,
  onSelectDate,
  onOpenShareModal,
}) => {
  const { t, lang } = useI18n();

  // View mode: 'today' | 'calendar' (persisted in localStorage)
  const [viewMode, setViewMode] = useState<'today' | 'calendar'>('today');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIEW_KEY);
      if (saved === 'calendar' || saved === 'today') {
        setViewMode(saved);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const toggleViewMode = () => {
    const nextMode = viewMode === 'today' ? 'calendar' : 'today';
    setViewMode(nextMode);
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, nextMode);
    } catch {
      // Ignore localStorage write errors
    }
  };

  // Hover state for calendar day
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Hover state for today's timeline point
  const [hoveredPoint, setHoveredPoint] = useState<IntradayPoint | null>(null);

  // 1. Build Intraday Timeline Data (Today)
  const intraday = useMemo(() => {
    return buildIntradayTimeline(posts);
  }, [posts]);

  // 2. Build 5-week Compact Calendar Grid (Month)
  const calendar = useMemo(() => {
    return buildHeatmapCalendar(posts, 5, lang);
  }, [posts, lang]);

  const theme = HEATMAP_THEMES.github;

  // SVG dimensions for Today's line chart
  const svgW = 256;
  const svgH = 68;
  const padLeft = 8;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 16;
  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  // Compute SVG polyline and gradient area path
  const chartPaths = useMemo(() => {
    if (intraday.totalToday === 0 || intraday.points.length === 0) {
      return { linePath: '', areaPath: '', coords: [] };
    }

    const maxVal = Math.max(1, intraday.totalToday);
    const getX = (minOfDay: number) => padLeft + (Math.min(1440, minOfDay) / 1440) * plotW;
    const getY = (val: number) => padTop + plotH - (val / maxVal) * (plotH - 4);

    const coords = intraday.points.map((pt) => ({
      pt,
      x: getX(pt.minuteOfDay),
      y: getY(pt.cumulative),
    }));

    let linePath = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 1; i < coords.length; i++) {
      linePath += ` L ${coords[i].x.toFixed(1)} ${coords[i].y.toFixed(1)}`;
    }

    const lastCoord = coords[coords.length - 1];
    const firstCoord = coords[0];
    const baselineY = (padTop + plotH).toFixed(1);
    const areaPath = `${linePath} L ${lastCoord.x.toFixed(1)} ${baselineY} L ${firstCoord.x.toFixed(1)} ${baselineY} Z`;

    return { linePath, areaPath, coords };
  }, [intraday, padLeft, padRight, padTop, padBottom, plotW, plotH]);

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (intraday.totalToday === 0 || chartPaths.coords.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgW;

    let closest = chartPaths.coords[0];
    let minDiff = Math.abs(svgX - closest.x);

    for (let i = 1; i < chartPaths.coords.length; i++) {
      const diff = Math.abs(svgX - chartPaths.coords[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = chartPaths.coords[i];
      }
    }
    setHoveredPoint(closest.pt);
  };

  return (
    <div className="flip-card-container w-full select-none">
      <div className={`flip-card-inner ${viewMode === 'calendar' ? 'flipped' : ''}`}>
        {/* ================= FRONT FACE: TODAY INTRADAY TIMELINE ================= */}
        <div 
          className={`flip-card-face bg-[#16181c] border border-[#2f3336] rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-300 ${
            viewMode === 'today' ? 'relative z-10' : 'absolute inset-0 pointer-events-none z-0'
          }`}
          style={{ minHeight: '196px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-0.5">
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#202327] hover:bg-[#2f3336] text-white hover:text-emerald-400 transition-all font-semibold text-xs border border-[#2f3336]/60 group"
              title={t('heatmap.viewModeToggleTooltip')}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{t('heatmap.viewToday')}</span>
              <ArrowLeftRight className="w-3 h-3 text-[#71767b] group-hover:text-emerald-400 transition-colors ml-0.5" />
            </button>

            <button
              onClick={() => onOpenShareModal('today')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#202327] hover:bg-[#2f3336] text-[11px] font-medium text-[#71767b] hover:text-[#e7e9ea] transition-colors shrink-0"
              title={t('share.title')}
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              <span>{t('heatmap.shareCard')}</span>
            </button>
          </div>

          {/* Subtitle / Hover state */}
          <div className="text-[11px] text-[#71767b] px-0.5 truncate h-4 flex items-center my-1">
            {hoveredPoint ? (
              <span className="text-emerald-400 font-medium">
                {t('heatmap.todayHoverStat', {
                  time: hoveredPoint.timeStr,
                  count: hoveredPoint.count,
                  cumulative: hoveredPoint.cumulative,
                })}
              </span>
            ) : intraday.totalToday > 0 ? (
              <span>
                {t('heatmap.todaySubTitle', { count: intraday.totalToday })}
                {intraday.peakHour ? ` · ${t('heatmap.todayPeakHour', { hour: intraday.peakHour })}` : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#71767b]">
                <Sparkles className="w-3 h-3 text-amber-400/80" />
                {t('heatmap.todayEmpty')}
              </span>
            )}
          </div>

          {/* SVG Line Chart Container */}
          <div className="w-full relative h-[70px] overflow-hidden rounded-lg bg-black/25 border border-[#2f3336]/40 px-1 pt-1 my-1">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-full cursor-crosshair overflow-visible"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="todayAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline */}
              <line
                x1={padLeft}
                y1={padTop + plotH}
                x2={padLeft + plotW}
                y2={padTop + plotH}
                stroke="#2f3336"
                strokeWidth="1"
                strokeDasharray={intraday.totalToday === 0 ? '4 3' : 'none'}
              />

              {/* Time axis text markers */}
              <text x={padLeft} y={svgH - 3} fill="#536471" fontSize="8" fontFamily="monospace">00:00</text>
              <text x={padLeft + plotW * 0.25} y={svgH - 3} fill="#536471" fontSize="8" textAnchor="middle" fontFamily="monospace">06:00</text>
              <text x={padLeft + plotW * 0.5} y={svgH - 3} fill="#536471" fontSize="8" textAnchor="middle" fontFamily="monospace">12:00</text>
              <text x={padLeft + plotW * 0.75} y={svgH - 3} fill="#536471" fontSize="8" textAnchor="middle" fontFamily="monospace">18:00</text>
              <text x={padLeft + plotW} y={svgH - 3} fill="#536471" fontSize="8" textAnchor="end" fontFamily="monospace">24:00</text>

              {intraday.totalToday > 0 ? (
                <>
                  <path d={chartPaths.areaPath} fill="url(#todayAreaGrad)" />
                  <path
                    d={chartPaths.linePath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {chartPaths.coords.map((c, i) => {
                    if (c.pt.count <= 0) return null;
                    return (
                      <circle
                        key={i}
                        cx={c.x}
                        cy={c.y}
                        r="2.5"
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                  {chartPaths.coords.length > 0 && (
                    <circle
                      cx={chartPaths.coords[chartPaths.coords.length - 1].x}
                      cy={chartPaths.coords[chartPaths.coords.length - 1].y}
                      r="3.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  )}
                  {hoveredPoint && (
                    <g>
                      <line
                        x1={padLeft + (hoveredPoint.minuteOfDay / 1440) * plotW}
                        y1={padTop}
                        x2={padLeft + (hoveredPoint.minuteOfDay / 1440) * plotW}
                        y2={padTop + plotH}
                        stroke="#e7e9ea"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}
                </>
              ) : null}
            </svg>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2f3336]/60 text-[10px] text-[#71767b]">
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-400 font-semibold truncate">
                {t('heatmap.todayViewed', { count: intraday.totalToday })}
              </span>
              <span>·</span>
              <span className="truncate">
                {t('heatmap.todayActiveMins', { count: intraday.activeMinutesCount })}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 font-mono text-[9px]">
              {intraday.categoryCounts.article > 0 && (
                <span className="text-[#c084fc]" title={t('categories.article')}>
                  {intraday.categoryCounts.article}A
                </span>
              )}
              {intraday.categoryCounts.video > 0 && (
                <span className="text-[#38bdf8]" title={t('categories.video')}>
                  {intraday.categoryCounts.video}V
                </span>
              )}
              {intraday.categoryCounts.quote > 0 && (
                <span className="text-[#34d399]" title={t('categories.quote')}>
                  {intraday.categoryCounts.quote}Q
                </span>
              )}
              {intraday.categoryCounts.thread > 0 && (
                <span className="text-[#fbbf24]" title={t('categories.thread')}>
                  {intraday.categoryCounts.thread}T
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================= BACK FACE: MONTH ACTIVITY HEATMAP ================= */}
        <div 
          className={`flip-card-face bg-[#16181c] border border-[#2f3336] rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-300 ${
            viewMode === 'calendar' ? 'relative z-10' : 'absolute inset-0 pointer-events-none z-0'
          }`}
          style={{ 
            minHeight: '196px',
            transform: 'rotateY(180deg)' 
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-0.5">
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#202327] hover:bg-[#2f3336] text-white hover:text-emerald-400 transition-all font-semibold text-xs border border-[#2f3336]/60 group"
              title={t('heatmap.viewModeToggleTooltip')}
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{t('heatmap.viewCalendar')}</span>
              <ArrowLeftRight className="w-3 h-3 text-[#71767b] group-hover:text-emerald-400 transition-colors ml-0.5" />
            </button>

            <button
              onClick={() => onOpenShareModal('calendar')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#202327] hover:bg-[#2f3336] text-[11px] font-medium text-[#71767b] hover:text-[#e7e9ea] transition-colors shrink-0"
              title={t('share.title')}
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              <span>{t('heatmap.shareCard')}</span>
            </button>
          </div>

          {/* Subtitle / Hover state */}
          <div className="text-[11px] text-[#71767b] px-0.5 truncate h-4 flex items-center my-0.5">
            {hoveredDay ? (
              hoveredDay.count > 0 ? (
                <span className="text-emerald-400 font-medium">
                  {t('heatmap.postsOnDate', { date: hoveredDay.dateKey, count: hoveredDay.count })}
                </span>
              ) : (
                <span>{t('heatmap.noPostsOnDate', { date: hoveredDay.dateKey })}</span>
              )
            ) : (
              <span>{t('heatmap.monthSubtitle', { count: calendar.totalPosts })}</span>
            )}
          </div>

          {/* Compact 5-Week Grid Container (Cleanly sized & centered) */}
          <div className="w-full flex justify-center py-1">
            <div className="inline-flex flex-col gap-1">
              {/* Month labels */}
              <div className="flex text-[9px] text-[#71767b] font-mono h-3.5 relative">
                <div className="w-4 shrink-0" />
                {calendar.monthLabels.map((ml, idx) => (
                  <span
                    key={idx}
                    className="absolute"
                    style={{ left: `${16 + ml.weekIndex * 21}px` }}
                  >
                    {ml.label}
                  </span>
                ))}
              </div>

              {/* Grid with Weekday Labels */}
              <div className="flex gap-2 items-start">
                {/* Weekday labels */}
                <div className="flex flex-col gap-[3px] text-[8px] text-[#71767b] font-mono w-3 shrink-0 pt-[1px]">
                  <span className="h-[10px] leading-[10px]" />
                  <span className="h-[10px] leading-[10px]">{t('heatmap.weekdayMon')}</span>
                  <span className="h-[10px] leading-[10px]" />
                  <span className="h-[10px] leading-[10px]">{t('heatmap.weekdayWed')}</span>
                  <span className="h-[10px] leading-[10px]" />
                  <span className="h-[10px] leading-[10px]">{t('heatmap.weekdayFri')}</span>
                  <span className="h-[10px] leading-[10px]" />
                </div>

                {/* 5 Weeks columns: 10px cells with clean 3px gaps */}
                <div className="flex gap-2.5">
                  {calendar.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day) => {
                        const isSelected = selectedDate === day.dateKey;
                        const level = day.level;
                        const cellColor = day.isFuture
                          ? 'bg-[#202327]/30'
                          : theme.colors[level];

                        return (
                          <button
                            key={day.dateKey}
                            onClick={() => onSelectDate(isSelected ? null : day.dateKey)}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            style={{ backgroundColor: cellColor }}
                            className={`w-2.5 h-2.5 rounded-[2px] transition-all shrink-0 ${
                              isSelected
                                ? 'ring-2 ring-white scale-125 z-10'
                                : 'hover:opacity-80 hover:scale-120'
                            } ${level === 0 && !day.isFuture ? 'border border-[#21262d]/60' : ''}`}
                            title={
                              day.count > 0
                                ? `${day.dateKey}: ${day.count} posts`
                                : `${day.dateKey}: no posts`
                            }
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer / Stats & Legend */}
          <div className="flex items-center justify-between pt-1 border-t border-[#2f3336]/60 text-[10px] text-[#71767b]">
            <div className="flex items-center gap-1.5 truncate">
              {calendar.currentStreak > 0 ? (
                <span className="flex items-center gap-0.5 text-emerald-400 font-semibold shrink-0">
                  <Flame className="w-3 h-3" />
                  {t('heatmap.streak', { count: calendar.currentStreak })}
                </span>
              ) : null}
              <span className="truncate">{t('heatmap.activeDays', { count: calendar.activeDays })}</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 shrink-0">
              <span>{t('heatmap.less')}</span>
              <div className="flex gap-0.5">
                {theme.colors.map((c, i) => (
                  <span
                    key={i}
                    style={{ backgroundColor: c }}
                    className="w-2 h-2 rounded-[1.5px] inline-block border border-black/30"
                  />
                ))}
              </div>
              <span>{t('heatmap.more')}</span>
            </div>
          </div>

          {/* Date Filter Active Pill */}
          {selectedDate && (
            <div className="flex items-center justify-between px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] mt-1">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3 h-3 shrink-0" />
                <span className="truncate">{selectedDate}</span>
              </div>
              <button
                onClick={() => onSelectDate(null)}
                className="p-0.5 hover:text-white rounded transition-colors"
                title={t('heatmap.clearFilter')}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
