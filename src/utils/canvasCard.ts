import { HeatmapData, HeatmapTheme, HEATMAP_THEMES, IntradayData } from './activity';
import { Post } from '../types';
import { Language } from '../i18n';

export interface CardRenderOptions {
  theme?: HeatmapTheme;
  lang?: Language;
  userHandle?: string;
  labels?: {
    appName?: string;
    tagline?: string;
    periodLabel?: string;
    totalPostsLabel?: string;
    activeDaysLabel?: string;
    currentStreakLabel?: string;
    longestStreakLabel?: string;
    unitPost?: string;
    unitPosts?: string;
    unitDay?: string;
    unitDays?: string;
    unitMinute?: string;
    unitMinutes?: string;
    heatmapTitle?: string;
    heatmapSub?: string;
    lessLabel?: string;
    moreLabel?: string;
    weekdayMon?: string;
    weekdayWed?: string;
    weekdayFri?: string;
    privacyNotice?: string;
    categoryStandard?: string;
    categoryArticle?: string;
    categoryVideo?: string;
    categoryQuote?: string;
    categoryThread?: string;
    dailyRecapTitle?: string;
    dailyRecapSubtitle?: string;
    peakHourLabel?: string;
    activeMinutesLabel?: string;
    timelineTitle?: string;
    emptyToday?: string;
    emptyCategory?: string;
  };
}


const LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja-JP',
  es: 'es-ES',
  pt: 'pt-BR',
  id: 'id-ID',
  de: 'de-DE',
  fr: 'fr-FR',
  tr: 'tr-TR',
  ar: 'ar-SA',
  ko: 'ko-KR',
  en: 'en-US',
};

export function formatCountWithUnit(
  count: number,
  lang: Language,
  singularUnit?: string,
  pluralUnit?: string,
  fallbackZh = '',
  fallbackEnPlural = '',
  fallbackEnSingular = fallbackEnPlural
): string {
  if (lang === 'zh' || lang === 'zh-TW' || lang === 'ja') {
    const unit = pluralUnit || fallbackZh;
    return unit ? `${count} ${unit}` : `${count}`;
  }
  const unit = count === 1 ? (singularUnit || fallbackEnSingular) : (pluralUnit || fallbackEnPlural);
  return unit ? `${count} ${unit}` : `${count}`;
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x + r, y);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Render the activity calendar heatmap card onto an HTML5 Canvas
 */
export function renderActivityCard(
  canvas: HTMLCanvasElement,
  data: HeatmapData,
  posts: Post[],
  options: CardRenderOptions = {}
): void {
  const theme = options.theme || HEATMAP_THEMES.github;
  const lang = options.lang || 'en';
  const labels = options.labels || {};

  const width = 1200;
  const height = 675;
  const scale = 2; // 2x Retina sharpness

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Base Dark Background
  ctx.fillStyle = theme.cardBg || '#0d1117';
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Gradient Light at Top Left & Center
  const radialGlow = ctx.createRadialGradient(240, 160, 20, 240, 160, 580);
  radialGlow.addColorStop(0, hexToRgba(theme.accentColor, 0.18));
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Card Outer Border
  ctx.beginPath();
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 24);
  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Header: Logo Badge & Title
  const logoX = 64;
  const logoY = 52;
  const logoSize = 52;

  ctx.beginPath();
  drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 14);
  const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
  logoGrad.addColorStop(0, '#1d9bf0');
  logoGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = logoGrad;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', logoX + logoSize / 2, logoY + logoSize / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(labels.appName || 'SeenX', logoX + logoSize + 16, logoY + 28);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.tagline || (lang === 'zh' ? 'X 浏览历史与数据分析' : 'X Browsing History & Analytics'),
    logoX + logoSize + 16,
    logoY + 48
  );

  // Right Header: Date / Period Badge
  const badgeW = 270;
  const badgeH = 38;
  const badgeX = width - 64 - badgeW;
  const badgeY = logoY + (logoSize - badgeH) / 2;

  ctx.beginPath();
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const todayStr = new Intl.DateTimeFormat(LOCALE_MAP[lang] || 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
  ctx.fillText(labels.periodLabel || `${todayStr} · SeenX`, badgeX + badgeW / 2, badgeY + badgeH / 2);

  // 5. Stat Highlight Row (Localized units!)
  const statsY = 128;
  const statsH = 78;
  const statCardW = 250;
  const statCardGap = 24;

  const statItems = [
    {
      title: labels.totalPostsLabel || (lang === 'zh' ? '累计浏览推文' : 'TOTAL POSTS'),
      value: formatCountWithUnit(data.totalPosts, lang, labels.unitPost, labels.unitPosts, '篇', 'posts', 'post'),
      accent: true,
    },
    {
      title: labels.activeDaysLabel || (lang === 'zh' ? '累计活跃天数' : 'ACTIVE DAYS'),
      value: formatCountWithUnit(data.activeDays, lang, labels.unitDay, labels.unitDays, '天', 'days', 'day'),
    },
    {
      title: labels.currentStreakLabel || (lang === 'zh' ? '当前连续记录' : 'CURRENT STREAK'),
      value: (lang === 'zh' || lang === 'zh-TW') ? `${data.currentStreak} 天` : `${data.currentStreak} d`,
    },
    {
      title: labels.longestStreakLabel || (lang === 'zh' ? '最长连续记录' : 'BEST STREAK'),
      value: (lang === 'zh' || lang === 'zh-TW') ? `${data.longestStreak} 天` : `${data.longestStreak} d`,
    },
  ];

  for (let i = 0; i < statItems.length; i++) {
    const item = statItems[i];
    const sx = 64 + i * (statCardW + statCardGap);

    ctx.beginPath();
    drawRoundedRect(ctx, sx, statsY, statCardW, statsH, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.title, sx + 20, statsY + 30);

    ctx.fillStyle = item.accent ? theme.accentColor : '#ffffff';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.value, sx + 20, statsY + 65);
  }

  // 6. Heatmap Container
  const hmContainerX = 64;
  const hmContainerY = 226;
  const hmContainerW = width - 128;
  const hmContainerH = 265;

  ctx.beginPath();
  drawRoundedRect(ctx, hmContainerX, hmContainerY, hmContainerW, hmContainerH, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Heatmap Section Header
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.heatmapTitle || (lang === 'zh' ? `推文浏览热力图 (${data.weeks.length} 周)` : `Daily Browsing Heatmap (${data.weeks.length} Weeks)`),
    hmContainerX + 24,
    hmContainerY + 34
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.heatmapSub ||
      `${lang === 'zh' ? '单日最高' : 'Peak'}: ${data.mostActiveCount} · ${
        lang === 'zh' ? '日均' : 'Avg'
      }: ${data.dailyAvg}`,
    hmContainerX + hmContainerW - 24,
    hmContainerY + 34
  );

  // Month Labels Row & Adaptive Grid Sizing
  const availableGridWidth = hmContainerW - 120;
  const weeksCount = data.weeks.length;

  let colStep = 17.2;
  let rowStep = 17.2;
  let cellSize = 13;
  let gridStartY = hmContainerY + 74;

  if (weeksCount <= 6) {
    cellSize = 18;
    rowStep = 23;
    colStep = 32;
    gridStartY = hmContainerY + 58;
  } else if (weeksCount <= 16) {
    cellSize = 15;
    rowStep = 20;
    colStep = 22;
    gridStartY = hmContainerY + 68;
  } else {
    cellSize = 13;
    rowStep = 17.2;
    colStep = 17.2;
    gridStartY = hmContainerY + 74;
  }

  const totalGridW = (weeksCount - 1) * colStep + cellSize;
  const gridStartX = hmContainerX + 56 + Math.max(0, (availableGridWidth - totalGridW) / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  for (const ml of data.monthLabels) {
    const mx = gridStartX + ml.weekIndex * colStep;
    ctx.fillText(ml.label, mx, gridStartY - 8);
  }

  // Weekday Labels Column (Mon, Wed, Fri)
  const weekdays = [
    { row: 1, text: labels.weekdayMon || (lang === 'zh' ? '一' : 'Mon') },
    { row: 3, text: labels.weekdayWed || (lang === 'zh' ? '三' : 'Wed') },
    { row: 5, text: labels.weekdayFri || (lang === 'zh' ? '五' : 'Fri') },
  ];

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  for (const wd of weekdays) {
    const wy = gridStartY + wd.row * rowStep + cellSize / 2;
    ctx.fillText(wd.text, gridStartX - 10, wy);
  }

  // Draw Heatmap Grid Cells
  for (let w = 0; w < data.weeks.length; w++) {
    const week = data.weeks[w];
    const cx = gridStartX + w * colStep;

    for (let d = 0; d < week.length; d++) {
      const cell = week[d];
      const cy = gridStartY + d * rowStep;

      ctx.beginPath();
      drawRoundedRect(ctx, cx, cy, cellSize, cellSize, cellSize > 16 ? 3.5 : 2.5);

      if (cell.isFuture) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      } else {
        ctx.fillStyle = theme.colors[cell.level];
      }
      ctx.fill();

      if (cell.level === 0 && !cell.isFuture) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Heatmap Legend
  const legendY = hmContainerY + hmContainerH - 24;
  let legendX = hmContainerX + hmContainerW - 24;

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(labels.moreLabel || (lang === 'zh' ? '多' : 'More'), legendX, legendY);
  legendX -= 36;

  const legBoxSize = 12;
  const legBoxGap = 4;

  for (let l = 4; l >= 0; l--) {
    ctx.beginPath();
    drawRoundedRect(ctx, legendX - legBoxSize, legendY - legBoxSize / 2, legBoxSize, legBoxSize, 2);
    ctx.fillStyle = theme.colors[l];
    ctx.fill();
    legendX -= legBoxSize + legBoxGap;
  }

  ctx.textAlign = 'right';
  ctx.fillText(labels.lessLabel || (lang === 'zh' ? '少' : 'Less'), legendX - 6, legendY);

  // 7. Category Breakdown Row
  const catY = 512;
  const categoriesCount = {
    standard: 0,
    article: 0,
    video: 0,
    quote: 0,
    thread: 0,
  };

  for (const p of posts) {
    if (p.postType && p.postType in categoriesCount) {
      categoriesCount[p.postType as keyof typeof categoriesCount]++;
    }
  }

  const categoryPills = [
    { label: labels.categoryStandard || (lang === 'zh' ? '普通图文' : 'Posts'), count: categoriesCount.standard, color: '#38bdf8' },
    { label: labels.categoryArticle || (lang === 'zh' ? '深度长文' : 'Articles'), count: categoriesCount.article, color: '#c084fc' },
    { label: labels.categoryVideo || (lang === 'zh' ? '精选视频' : 'Videos'), count: categoriesCount.video, color: '#38bdf8' },
    { label: labels.categoryQuote || (lang === 'zh' ? '引用转推' : 'Quotes'), count: categoriesCount.quote, color: '#34d399' },
    { label: labels.categoryThread || (lang === 'zh' ? '串推讨论' : 'Threads'), count: categoriesCount.thread, color: '#fbbf24' },
  ].filter(c => c.count > 0);

  let pillX = 64;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  for (const cat of categoryPills) {
    const text = `${cat.label} ${cat.count}`;
    const textW = ctx.measureText(text).width;
    const pillW = textW + 32;
    const pillH = 30;

    ctx.beginPath();
    drawRoundedRect(ctx, pillX, catY, pillW, pillH, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pillX + 14, catY + pillH / 2, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = cat.color;
    ctx.fill();

    ctx.fillStyle = '#e5e7eb';
    ctx.fillText(text, pillX + 25, catY + pillH / 2);

    pillX += pillW + 10;
  }

  // 8. Footer: Privacy & Watermark
  const footerY = height - 50;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.privacyNotice || (lang === 'zh' ? '🔒 100% 本地私有化存储 · 零云端追踪' : '🔒 100% Local & Private • Zero Cloud Tracking'),
    64,
    footerY
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(
    'SeenX Extension for X (Twitter)',
    width - 64,
    footerY
  );

  ctx.restore();
}

/**
 * Render the Daily Recap Card (Today's Intraday Timeline + Categories Breakdown) onto an HTML5 Canvas
 */
export function renderDailyRecapCard(
  canvas: HTMLCanvasElement,
  intradayData: IntradayData,
  posts: Post[],
  options: CardRenderOptions = {}
): void {
  const theme = options.theme || HEATMAP_THEMES.seenx;
  const lang = options.lang || 'en';
  const labels = options.labels || {};

  const width = 1200;
  const height = 675;
  const scale = 2;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Dark Background
  ctx.fillStyle = theme.cardBg || '#000000';
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Gradient Glow
  const radialGlow = ctx.createRadialGradient(width / 2, 160, 20, width / 2, 160, 600);
  radialGlow.addColorStop(0, hexToRgba(theme.accentColor, 0.22));
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Card Outer Border
  ctx.beginPath();
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 24);
  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Header: Logo Badge & Title
  const logoX = 64;
  const logoY = 52;
  const logoSize = 52;

  ctx.beginPath();
  drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 14);
  const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
  logoGrad.addColorStop(0, '#1d9bf0');
  logoGrad.addColorStop(1, '#a855f7');
  ctx.fillStyle = logoGrad;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', logoX + logoSize / 2, logoY + logoSize / 2);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(labels.appName || 'SeenX', logoX + logoSize + 16, logoY + 28);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.dailyRecapTitle || (lang === 'zh' ? '今日浏览战报' : "Today's Browsing Recap"),
    logoX + logoSize + 16,
    logoY + 48
  );

  // Right Header: Date Badge
  const badgeW = 220;
  const badgeH = 38;
  const badgeX = width - 64 - badgeW;
  const badgeY = logoY + (logoSize - badgeH) / 2;

  ctx.beginPath();
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(intradayData.todayKey, badgeX + badgeW / 2, badgeY + badgeH / 2);

  // 5. Stat Highlight Row (Properly localized units!)
  const statsY = 128;
  const statsH = 78;
  const statCardW = 340;
  const statCardGap = 26;

  const statItems = [
    {
      title: labels.totalPostsLabel || (lang === 'zh' ? '今日浏览' : 'TODAY BROWSED'),
      value: formatCountWithUnit(intradayData.totalToday, lang, labels.unitPost, labels.unitPosts, '篇', 'posts', 'post'),
      accent: true,
    },
    {
      title: labels.peakHourLabel || (lang === 'zh' ? '活跃峰值' : 'PEAK HOUR'),
      value: intradayData.peakHour || (lang === 'zh' ? '暂无数据' : 'N/A'),
      accent: false,
    },
    {
      title: labels.activeMinutesLabel || (lang === 'zh' ? '记录时长' : 'ACTIVE TIME'),
      value: formatCountWithUnit(intradayData.activeMinutesCount, lang, labels.unitMinute, labels.unitMinutes, '分钟', 'min', 'min'),
      accent: false,
    },
  ];

  for (let i = 0; i < statItems.length; i++) {
    const item = statItems[i];
    const sx = 64 + i * (statCardW + statCardGap);

    ctx.beginPath();
    drawRoundedRect(ctx, sx, statsY, statCardW, statsH, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.title, sx + 20, statsY + 30);

    ctx.fillStyle = item.accent ? theme.accentColor : '#ffffff';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.value, sx + 20, statsY + 65);
  }

  // 6. Timeline Line Chart Container (Simplified, zero redundant copy!)
  const chartBoxX = 64;
  const chartBoxY = 226;
  const chartBoxW = width - 128;
  const chartBoxH = 265;

  ctx.beginPath();
  drawRoundedRect(ctx, chartBoxX, chartBoxY, chartBoxW, chartBoxH, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Clean Chart Title (No redundant subtitles)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.timelineTitle || (lang === 'zh' || lang === 'zh-TW' ? '浏览走势' : 'Browsing Timeline'),
    chartBoxX + 24,
    chartBoxY + 34
  );

  // Line Chart Inner Area
  const innerLeft = chartBoxX + 48;
  const innerRight = chartBoxX + chartBoxW - 48;
  const innerTop = chartBoxY + 60;
  const innerBottom = chartBoxY + chartBoxH - 45;
  const plotW = innerRight - innerLeft;
  const plotH = innerBottom - innerTop;

  // Grid Lines (0%, 25%, 50%, 75%, 100%)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const gy = innerBottom - (plotH * g) / 4;
    ctx.beginPath();
    ctx.moveTo(innerLeft, gy);
    ctx.lineTo(innerRight, gy);
    ctx.stroke();
  }

  // Time Axis Labels
  const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  for (let i = 0; i < timeLabels.length; i++) {
    const tx = innerLeft + (plotW * i) / (timeLabels.length - 1);
    ctx.fillText(timeLabels[i], tx, innerBottom + 12);
  }

  // Render Line and Gradient Area
  if (intradayData.totalToday > 0 && intradayData.points.length > 0) {
    const maxVal = Math.max(1, intradayData.totalToday);

    const getX = (minOfDay: number) => innerLeft + (Math.min(1440, minOfDay) / 1440) * plotW;
    const getY = (val: number) => innerBottom - (val / maxVal) * (plotH - 12);

    // 1. Shaded Area Under Curve
    ctx.beginPath();
    ctx.moveTo(getX(intradayData.points[0].minuteOfDay), innerBottom);
    for (const pt of intradayData.points) {
      ctx.lineTo(getX(pt.minuteOfDay), getY(pt.cumulative));
    }
    const lastPt = intradayData.points[intradayData.points.length - 1];
    ctx.lineTo(getX(lastPt.minuteOfDay), innerBottom);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, innerTop, 0, innerBottom);
    areaGrad.addColorStop(0, hexToRgba(theme.accentColor, 0.35));
    areaGrad.addColorStop(1, hexToRgba(theme.accentColor, 0.01));
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 2. Stroke Polyline
    ctx.beginPath();
    for (let i = 0; i < intradayData.points.length; i++) {
      const pt = intradayData.points[i];
      const px = getX(pt.minuteOfDay);
      const py = getY(pt.cumulative);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Highlight dots on active minutes
    for (const pt of intradayData.points) {
      if (pt.count > 0) {
        const px = getX(pt.minuteOfDay);
        const py = getY(pt.cumulative);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 4. Glowing final point
    const endX = getX(lastPt.minuteOfDay);
    const endY = getY(lastPt.cumulative);
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = theme.accentColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    // Clean empty state without verbose slogan
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6b7280';
    ctx.font = '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(
      labels.emptyToday || (lang === 'zh' || lang === 'zh-TW' ? '今日暂无浏览记录' : 'No activity recorded today'),
      innerLeft + plotW / 2,
      innerTop + plotH / 2
    );
  }

  // 7. Post Types Breakdown Row
  const catY = 512;
  const categoriesCount = intradayData.categoryCounts;

  const categoryPills = [
    { label: labels.categoryStandard || (lang === 'zh' ? '普通短推' : 'Posts'), count: categoriesCount.standard || 0, color: '#38bdf8' },
    { label: labels.categoryArticle || (lang === 'zh' ? '深度长文' : 'Articles'), count: categoriesCount.article || 0, color: '#c084fc' },
    { label: labels.categoryVideo || (lang === 'zh' ? '精选视频' : 'Videos'), count: categoriesCount.video || 0, color: '#38bdf8' },
    { label: labels.categoryQuote || (lang === 'zh' ? '引用转推' : 'Quotes'), count: categoriesCount.quote || 0, color: '#34d399' },
    { label: labels.categoryThread || (lang === 'zh' ? '串推讨论' : 'Threads'), count: categoriesCount.thread || 0, color: '#fbbf24' },
  ].filter(c => c.count > 0);

  let pillX = 64;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  if (categoryPills.length > 0) {
    for (const cat of categoryPills) {
      const pct = intradayData.totalToday > 0 ? Math.round((cat.count / intradayData.totalToday) * 100) : 0;
      const text = `${cat.label} ${cat.count} (${pct}%)`;
      const textW = ctx.measureText(text).width;
      const pillW = textW + 32;
      const pillH = 30;

      ctx.beginPath();
      drawRoundedRect(ctx, pillX, catY, pillW, pillH, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pillX + 14, catY + pillH / 2, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = cat.color;
      ctx.fill();

      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(text, pillX + 25, catY + pillH / 2);

      pillX += pillW + 10;
    }
  } else {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6b7280';
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(labels.emptyCategory || (lang === 'zh' || lang === 'zh-TW' ? '暂无分类构成数据' : 'No category data recorded'), pillX, catY + 15);
  }

  // 8. Footer
  const footerY = height - 50;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    labels.privacyNotice || (lang === 'zh' ? '🔒 100% 本地私有化存储 · 零云端追踪' : '🔒 100% Local & Private • Zero Cloud Tracking'),
    64,
    footerY
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(
    'SeenX Extension for X (Twitter)',
    width - 64,
    footerY
  );

  ctx.restore();
}

/**
 * Export canvas to PNG Blob
 */
export function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}
