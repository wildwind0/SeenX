import { Post } from '../types';
import { Language } from '../i18n';

export interface DailyActivity {
  dateKey: string; // YYYY-MM-DD
  count: number;
  postIds: string[];
}

export interface HeatmapDay {
  date: Date;
  dateKey: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isFuture: boolean;
}

export interface MonthLabel {
  weekIndex: number;
  label: string;
}

export interface HeatmapData {
  weeks: HeatmapDay[][];
  monthLabels: MonthLabel[];
  maxCount: number;
  totalPosts: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  dailyAvg: number;
  mostActiveDate: string | null;
  mostActiveCount: number;
}

export interface HeatmapTheme {
  id: string;
  nameKey: string;
  colors: [string, string, string, string, string]; // [level0, level1, level2, level3, level4]
  accentColor: string;
  cardBg: string;
  cardBorder: string;
}

export const HEATMAP_THEMES: Record<string, HeatmapTheme> = {
  github: {
    id: 'github',
    nameKey: 'heatmap.themeGithub',
    colors: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    accentColor: '#39d353',
    cardBg: '#0d1117',
    cardBorder: '#30363d',
  },
  seenx: {
    id: 'seenx',
    nameKey: 'heatmap.themeSeenx',
    colors: ['#16181c', '#0c385c', '#0284c7', '#38bdf8', '#7dd3fc'],
    accentColor: '#1d9bf0',
    cardBg: '#000000',
    cardBorder: '#2f3336',
  },
  cyberpunk: {
    id: 'cyberpunk',
    nameKey: 'heatmap.themeCyberpunk',
    colors: ['#18122B', '#3b0764', '#7e22ce', '#c084fc', '#f0abfc'],
    accentColor: '#c084fc',
    cardBg: '#0f0715',
    cardBorder: '#3b0764',
  },
  sunset: {
    id: 'sunset',
    nameKey: 'heatmap.themeSunset',
    colors: ['#1c1917', '#451a03', '#9a3412', '#ea580c', '#fdba74'],
    accentColor: '#f97316',
    cardBg: '#140c08',
    cardBorder: '#431407',
  },
};

/**
 * Format timestamp or Date into local YYYY-MM-DD
 */
export function toLocalDateKey(dateOrTimestamp: number | Date): string {
  const d = typeof dateOrTimestamp === 'number' ? new Date(dateOrTimestamp) : dateOrTimestamp;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate post activity map by date from posts
 */
export function getDailyActivityMap(posts: Post[]): Map<string, DailyActivity> {
  const map = new Map<string, DailyActivity>();

  for (const post of posts) {
    if (!post || !post.id) continue;

    const firstKey = toLocalDateKey(post.firstSeenAt);
    const lastKey = toLocalDateKey(post.lastSeenAt);

    // Track first seen date
    let firstAct = map.get(firstKey);
    if (!firstAct) {
      firstAct = { dateKey: firstKey, count: 0, postIds: [] };
      map.set(firstKey, firstAct);
    }
    if (!firstAct.postIds.includes(post.id)) {
      firstAct.postIds.push(post.id);
      firstAct.count++;
    }

    // Track last seen date if different from first seen date
    if (lastKey !== firstKey) {
      let lastAct = map.get(lastKey);
      if (!lastAct) {
        lastAct = { dateKey: lastKey, count: 0, postIds: [] };
        map.set(lastKey, lastAct);
      }
      if (!lastAct.postIds.includes(post.id)) {
        lastAct.postIds.push(post.id);
        lastAct.count++;
      }
    }
  }

  return map;
}

/**
 * Determine GitHub-like activity color level (0 - 4)
 */
export function getActivityLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (maxCount <= 4) {
    return Math.min(count, 4) as 1 | 2 | 3 | 4;
  }
  const step = maxCount / 4;
  if (count <= Math.ceil(step)) return 1;
  if (count <= Math.ceil(step * 2)) return 2;
  if (count <= Math.ceil(step * 3)) return 3;
  return 4;
}

/**
 * Calculate streak and statistics
 */
export function calculateActivityStats(
  posts: Post[],
  activityMap: Map<string, DailyActivity>,
  refDate = new Date()
) {
  let totalPosts = 0;
  let activeDays = 0;
  let maxCount = 0;
  let mostActiveDate: string | null = null;

  activityMap.forEach((act) => {
    if (act.count > 0) {
      activeDays++;
      totalPosts += act.count;
      if (act.count > maxCount) {
        maxCount = act.count;
        mostActiveDate = act.dateKey;
      }
    }
  });

  // Calculate current streak
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const todayKey = toLocalDateKey(today);
  const todayCount = activityMap.get(todayKey)?.count || 0;

  let currentStreak = 0;
  const cursor = new Date(today);

  if (todayCount > 0) {
    // Streak includes today
    while (true) {
      const k = toLocalDateKey(cursor);
      const c = activityMap.get(k)?.count || 0;
      if (c > 0) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // If today is 0 so far, check yesterday so user doesn't lose streak before day ends
    cursor.setDate(cursor.getDate() - 1);
    while (true) {
      const k = toLocalDateKey(cursor);
      const c = activityMap.get(k)?.count || 0;
      if (c > 0) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across the past 365 days
  let longestStreak = 0;
  let tempStreak = 0;

  // Scan from 365 days ago up to today
  const scanDate = new Date(today);
  scanDate.setDate(scanDate.getDate() - 365);

  while (scanDate <= today) {
    const k = toLocalDateKey(scanDate);
    const c = activityMap.get(k)?.count || 0;
    if (c > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    scanDate.setDate(scanDate.getDate() + 1);
  }

  const dailyAvg = activeDays > 0 ? parseFloat((totalPosts / activeDays).toFixed(1)) : 0;

  return {
    totalPosts,
    activeDays,
    maxCount,
    mostActiveDate,
    mostActiveCount: maxCount,
    currentStreak,
    longestStreak,
    dailyAvg,
  };
}

/**
 * Format month label according to locale
 */
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

export function formatMonthName(date: Date, lang: Language = 'en'): string {
  try {
    const locale = LOCALE_MAP[lang] || 'en-US';
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
    }).format(date);
  } catch {
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return enMonths[date.getMonth()] || '';
  }
}

/**
 * Build the full 52-week calendar grid (GitHub style)
 */
export function buildHeatmapCalendar(
  posts: Post[],
  weeksCount = 52,
  lang: Language = 'en',
  refDate = new Date()
): HeatmapData {
  const activityMap = getDailyActivityMap(posts);
  const stats = calculateActivityStats(posts, activityMap, refDate);

  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  // GitHub calendar grid ends on the Saturday of the current week
  const todayDayOfWeek = today.getDay(); // 0 = Sun, ..., 6 = Sat
  const endSaturday = new Date(today);
  endSaturday.setDate(today.getDate() + (6 - todayDayOfWeek));
  endSaturday.setHours(23, 59, 59, 999);

  // Go back exactly (weeksCount * 7 - 1) days to land on a Sunday
  const startSunday = new Date(endSaturday);
  startSunday.setDate(endSaturday.getDate() - (weeksCount * 7 - 1));
  startSunday.setHours(0, 0, 0, 0);

  const weeks: HeatmapDay[][] = [];
  const monthLabels: MonthLabel[] = [];
  let lastMonth = -1;
  let lastLabelWeek = -3;

  for (let w = 0; w < weeksCount; w++) {
    const days: HeatmapDay[] = [];

    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startSunday);
      cellDate.setDate(startSunday.getDate() + (w * 7 + d));
      cellDate.setHours(0, 0, 0, 0);

      const isFuture = cellDate.getTime() > today.getTime();
      const dateKey = toLocalDateKey(cellDate);
      const count = isFuture ? 0 : (activityMap.get(dateKey)?.count || 0);
      const level = isFuture ? 0 : getActivityLevel(count, stats.maxCount);

      days.push({
        date: cellDate,
        dateKey,
        count,
        level,
        isFuture,
      });

      // Check month boundary on Sunday (first day of week) or 1st of month
      if (d === 0 || cellDate.getDate() === 1) {
        const m = cellDate.getMonth();
        if (m !== lastMonth && w - lastLabelWeek >= 2) {
          monthLabels.push({
            weekIndex: w,
            label: formatMonthName(cellDate, lang),
          });
          lastMonth = m;
          lastLabelWeek = w;
        }
      }
    }

    weeks.push(days);
  }

  return {
    weeks,
    monthLabels,
    maxCount: stats.maxCount,
    totalPosts: stats.totalPosts,
    activeDays: stats.activeDays,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    dailyAvg: stats.dailyAvg,
    mostActiveDate: stats.mostActiveDate,
    mostActiveCount: stats.mostActiveCount,
  };
}

export interface IntradayPoint {
  timestamp: number;
  minuteOfDay: number; // 0..1439
  timeStr: string;     // "HH:mm"
  count: number;       // posts browsed in this minute
  cumulative: number;  // running total up to this minute
}

export interface IntradayData {
  todayKey: string;
  points: IntradayPoint[];
  totalToday: number;
  peakHour: string | null;       // e.g. "14:00 - 15:00"
  peakMinuteStr: string | null;  // e.g. "14:23"
  peakMinuteCount: number;
  categoryCounts: Record<string, number>;
  activeMinutesCount: number;
}

export type HeatmapTimeSpan = '1_month' | '3_months' | '1_year' | 'all_time';

export function getHeatmapWeeksForSpan(
  posts: Post[],
  span: HeatmapTimeSpan,
  refDate = new Date()
): number {
  if (span === '1_month') return 5;
  if (span === '3_months') return 14;
  if (span === '1_year') return 52;

  // all_time
  let earliest = refDate.getTime();
  for (const p of posts) {
    if (p.firstSeenAt && p.firstSeenAt < earliest) {
      earliest = p.firstSeenAt;
    }
  }

  const diffMs = refDate.getTime() - earliest;
  const diffDays = Math.max(7, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const weeks = Math.ceil(diffDays / 7) + 1;
  return Math.min(104, Math.max(5, weeks));
}

/**
 * Build minute-level cumulative progression for today's browsing activity
 */
export function buildIntradayTimeline(
  posts: Post[],
  refDate = new Date()
): IntradayData {
  const todayKey = toLocalDateKey(refDate);
  const currentMinute = refDate.getHours() * 60 + refDate.getMinutes();

  const categoryCounts: Record<string, number> = {
    standard: 0,
    article: 0,
    video: 0,
    quote: 0,
    thread: 0,
  };

  const minuteMap = new Map<number, number>();
  const hourlyCounts = new Array(24).fill(0);

  let totalToday = 0;
  let peakMinute = -1;
  let peakMinuteCount = 0;

  for (const post of posts) {
    if (!post || !post.id) continue;

    const firstKey = toLocalDateKey(post.firstSeenAt);
    const lastKey = toLocalDateKey(post.lastSeenAt);

    let postTimestampToday: number | null = null;
    if (firstKey === todayKey) {
      postTimestampToday = post.firstSeenAt;
    } else if (lastKey === todayKey) {
      postTimestampToday = post.lastSeenAt;
    }

    if (postTimestampToday !== null) {
      totalToday++;
      const pType = post.postType || 'standard';
      categoryCounts[pType] = (categoryCounts[pType] || 0) + 1;

      const d = new Date(postTimestampToday);
      const minOfDay = Math.min(1439, Math.max(0, d.getHours() * 60 + d.getMinutes()));
      const c = (minuteMap.get(minOfDay) || 0) + 1;
      minuteMap.set(minOfDay, c);

      if (c > peakMinuteCount) {
        peakMinuteCount = c;
        peakMinute = minOfDay;
      }

      const h = d.getHours();
      hourlyCounts[h]++;
    }
  }

  let peakHour: string | null = null;
  if (totalToday > 0) {
    let maxHour = 0;
    let maxHourCount = -1;
    for (let h = 0; h < 24; h++) {
      if (hourlyCounts[h] > maxHourCount) {
        maxHourCount = hourlyCounts[h];
        maxHour = h;
      }
    }
    const nextH = (maxHour + 1) % 24;
    peakHour = `${String(maxHour).padStart(2, '0')}:00 - ${String(nextH).padStart(2, '0')}:00`;
  }

  const points: IntradayPoint[] = [];

  points.push({
    timestamp: new Date(refDate).setHours(0, 0, 0, 0),
    minuteOfDay: 0,
    timeStr: '00:00',
    count: 0,
    cumulative: 0,
  });

  const sortedMinutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);
  let cumulative = 0;

  for (const m of sortedMinutes) {
    const c = minuteMap.get(m)!;
    cumulative += c;
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    const timestamp = new Date(refDate).setHours(h, min, 0, 0);

    points.push({
      timestamp,
      minuteOfDay: m,
      timeStr,
      count: c,
      cumulative,
    });
  }

  const lastPointMin = points[points.length - 1].minuteOfDay;
  if (currentMinute > lastPointMin) {
    const h = Math.floor(currentMinute / 60);
    const min = currentMinute % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    points.push({
      timestamp: refDate.getTime(),
      minuteOfDay: currentMinute,
      timeStr,
      count: 0,
      cumulative,
    });
  }

  const peakMinuteStr = peakMinute >= 0
    ? `${String(Math.floor(peakMinute / 60)).padStart(2, '0')}:${String(peakMinute % 60).padStart(2, '0')}`
    : null;

  return {
    todayKey,
    points,
    totalToday,
    peakHour,
    peakMinuteStr,
    peakMinuteCount,
    categoryCounts,
    activeMinutesCount: minuteMap.size,
  };
}
