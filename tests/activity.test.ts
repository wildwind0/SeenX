import { describe, it, expect } from 'vitest';
import { 
  toLocalDateKey, 
  getDailyActivityMap, 
  getActivityLevel, 
  calculateActivityStats, 
  buildHeatmapCalendar,
  HEATMAP_THEMES 
} from '../src/utils/activity';
import { Post } from '../src/types';

function createMockPost(id: string, firstSeen: number, lastSeen?: number): Post {
  return {
    id,
    url: `https://x.com/user/status/${id}`,
    author: { id: 'u1', name: 'User 1', screenName: 'user1', avatarUrl: '' },
    text: 'Test tweet ' + id,
    postType: 'standard',
    media: [],
    firstSeenAt: firstSeen,
    lastSeenAt: lastSeen ?? firstSeen,
    seenCount: 1,
    engaged: false,
    starred: false,
  };
}

describe('Activity Heatmap utilities', () => {
  it('formats local date keys correctly', () => {
    const d = new Date(2026, 8, 26); // Month 8 is September
    expect(toLocalDateKey(d)).toBe('2026-09-26');
  });

  it('aggregates daily activity counts from posts', () => {
    const d1 = new Date(2026, 8, 20).getTime();
    const d2 = new Date(2026, 8, 21).getTime();
    const posts: Post[] = [
      createMockPost('1', d1),
      createMockPost('2', d1),
      createMockPost('3', d2),
      createMockPost('4', d1, d2), // Seen on d1, re-seen on d2
    ];

    const map = getDailyActivityMap(posts);
    expect(map.get('2026-09-20')?.count).toBe(3); // 1, 2, 4
    expect(map.get('2026-09-21')?.count).toBe(2); // 3, 4
  });

  it('calculates activity level correctly', () => {
    expect(getActivityLevel(0, 10)).toBe(0);
    expect(getActivityLevel(1, 4)).toBe(1);
    expect(getActivityLevel(2, 4)).toBe(2);
    expect(getActivityLevel(3, 4)).toBe(3);
    expect(getActivityLevel(4, 4)).toBe(4);

    expect(getActivityLevel(2, 20)).toBe(1);
    expect(getActivityLevel(7, 20)).toBe(2);
    expect(getActivityLevel(14, 20)).toBe(3);
    expect(getActivityLevel(19, 20)).toBe(4);
  });

  it('calculates current and longest streak correctly', () => {
    const today = new Date(2026, 8, 26);
    const dayMs = 24 * 60 * 60 * 1000;
    const t = today.getTime();

    // Active on today, yesterday, and 2 days ago (3-day streak)
    // Also had a 4-day streak earlier
    const posts: Post[] = [
      createMockPost('1', t), // today
      createMockPost('2', t - dayMs), // yesterday
      createMockPost('3', t - 2 * dayMs), // 2 days ago
      // gap at t - 3*dayMs
      createMockPost('4', t - 5 * dayMs),
      createMockPost('5', t - 6 * dayMs),
      createMockPost('6', t - 7 * dayMs),
      createMockPost('7', t - 8 * dayMs), // 4-day streak
    ];

    const map = getDailyActivityMap(posts);
    const stats = calculateActivityStats(posts, map, today);

    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(4);
    expect(stats.activeDays).toBe(7);
  });

  it('builds 52-week calendar grid ending on current week', () => {
    const refDate = new Date(2026, 8, 26); // Saturday Sep 26, 2026
    const posts: Post[] = [
      createMockPost('1', refDate.getTime()),
    ];

    const calendar = buildHeatmapCalendar(posts, 52, 'en', refDate);
    expect(calendar.weeks.length).toBe(52);
    for (const week of calendar.weeks) {
      expect(week.length).toBe(7);
    }

    const lastWeek = calendar.weeks[51];
    const todayCell = lastWeek.find(d => d.dateKey === '2026-09-26');
    expect(todayCell).toBeDefined();
    expect(todayCell?.count).toBe(1);
    expect(todayCell?.level).toBeGreaterThan(0);
    expect(calendar.monthLabels.length).toBeGreaterThan(5);
  });

  it('contains valid heatmap themes', () => {
    expect(HEATMAP_THEMES.github.colors).toHaveLength(5);
    expect(HEATMAP_THEMES.seenx.colors).toHaveLength(5);
    expect(HEATMAP_THEMES.cyberpunk.colors).toHaveLength(5);
    expect(HEATMAP_THEMES.sunset.colors).toHaveLength(5);
  });
});

import { renderActivityCard, renderDailyRecapCard, drawRoundedRect, formatCountWithUnit } from '../src/utils/canvasCard';

describe('Canvas Card Rendering', () => {
  it('draws with canvas context calls', () => {
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: (txt: string) => ({ width: txt.length * 8 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvas: any = {
      width: 0,
      height: 0,
      getContext: () => mockCtx,
    };

    const calendar = buildHeatmapCalendar([], 52, 'en', new Date(2026, 8, 26));
    expect(() => {
      renderActivityCard(mockCanvas, calendar, [], { lang: 'en' });
    }).not.toThrow();

    expect(mockCanvas.width).toBe(2400);
    expect(mockCanvas.height).toBe(1350);
  });

  it('handles drawRoundedRect fallback when ctx.roundRect is unavailable', () => {
    let calledMoveTo = false;
    const mockCtx: any = {
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => { calledMoveTo = true; },
      lineTo: () => {},
      quadraticCurveTo: () => {},
    };

    drawRoundedRect(mockCtx, 10, 10, 100, 100, 10);
    expect(calledMoveTo).toBe(true);
  });
});

import { buildIntradayTimeline, getHeatmapWeeksForSpan } from '../src/utils/activity';

describe('Intraday Timeline & Dynamic Heatmap Range', () => {
  it('builds cumulative intraday timeline correctly', () => {
    // 2026-09-26 15:30
    const refDate = new Date(2026, 8, 26, 15, 30);
    const t0 = new Date(2026, 8, 26, 9, 15).getTime();
    const t1 = new Date(2026, 8, 26, 9, 15, 30).getTime(); // same minute
    const t2 = new Date(2026, 8, 26, 14, 0).getTime();
    const tOld = new Date(2026, 8, 25, 10, 0).getTime(); // yesterday

    const posts: Post[] = [
      createMockPost('p1', t0),
      createMockPost('p2', t1),
      createMockPost('p3', t2),
      createMockPost('pOld', tOld),
    ];

    const timeline = buildIntradayTimeline(posts, refDate);
    expect(timeline.totalToday).toBe(3);
    expect(timeline.todayKey).toBe('2026-09-26');
    expect(timeline.points.length).toBeGreaterThanOrEqual(3);

    // Initial point at 00:00
    expect(timeline.points[0].timeStr).toBe('00:00');
    expect(timeline.points[0].cumulative).toBe(0);

    // At 09:15, cumulative should be 2
    const p915 = timeline.points.find(p => p.timeStr === '09:15');
    expect(p915).toBeDefined();
    expect(p915?.count).toBe(2);
    expect(p915?.cumulative).toBe(2);

    // Final point should reach current minute (15:30) with cumulative 3
    const pEnd = timeline.points[timeline.points.length - 1];
    expect(pEnd.timeStr).toBe('15:30');
    expect(pEnd.cumulative).toBe(3);

    // Peak hour
    expect(timeline.peakHour).toBe('09:00 - 10:00');
  });

  it('handles empty posts today gracefully', () => {
    const refDate = new Date(2026, 8, 26, 10, 0);
    const timeline = buildIntradayTimeline([], refDate);
    expect(timeline.totalToday).toBe(0);
    expect(timeline.peakHour).toBeNull();
    expect(timeline.points[0].cumulative).toBe(0);
    expect(timeline.points[timeline.points.length - 1].cumulative).toBe(0);
  });

  it('calculates heatmap weeks for different spans', () => {
    const refDate = new Date(2026, 8, 26);
    expect(getHeatmapWeeksForSpan([], '1_month', refDate)).toBe(5);
    expect(getHeatmapWeeksForSpan([], '3_months', refDate)).toBe(14);
    expect(getHeatmapWeeksForSpan([], '1_year', refDate)).toBe(52);

    // 60 days ago post
    const pastTime = refDate.getTime() - 60 * 24 * 60 * 60 * 1000;
    const posts: Post[] = [createMockPost('pOld', pastTime)];
    const weeksAll = getHeatmapWeeksForSpan(posts, 'all_time', refDate);
    expect(weeksAll).toBeGreaterThanOrEqual(9);
  });
});


describe('renderDailyRecapCard', () => {
  it('renders daily recap card without throwing', () => {
    const mockCtx: any = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: () => {},
      measureText: (txt: string) => ({ width: txt.length * 8 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvas: any = {
      width: 0,
      height: 0,
      getContext: () => mockCtx,
    };

    const refDate = new Date(2026, 8, 26, 14, 0);
    const posts: Post[] = [
      createMockPost('p1', refDate.getTime()),
    ];
    const timeline = buildIntradayTimeline(posts, refDate);

    expect(() => {
      renderDailyRecapCard(mockCanvas, timeline, posts, { lang: 'zh' });
    }).not.toThrow();

    expect(mockCanvas.width).toBe(2400);
    expect(mockCanvas.height).toBe(1350);
  });

  it("formats units adaptively across languages and plurals", () => {
    expect(formatCountWithUnit(0, "en", "post", "posts", "篇", "posts", "post")).toBe("0 posts");
    expect(formatCountWithUnit(1, "en", "post", "posts", "篇", "posts", "post")).toBe("1 post");
    expect(formatCountWithUnit(5, "en", "post", "posts", "篇", "posts", "post")).toBe("5 posts");

    expect(formatCountWithUnit(0, "zh", "篇", "篇", "篇", "posts", "post")).toBe("0 篇");
    expect(formatCountWithUnit(1, "zh", "篇", "篇", "篇", "posts", "post")).toBe("1 篇");
    expect(formatCountWithUnit(5, "zh", "篇", "篇", "篇", "posts", "post")).toBe("5 篇");

    // Also test without explicit labels (fallback defaults)
    expect(formatCountWithUnit(0, "zh", undefined, undefined, "篇", "posts", "post")).toBe("0 篇");
    expect(formatCountWithUnit(1, "en", undefined, undefined, "篇", "posts", "post")).toBe("1 post");
    expect(formatCountWithUnit(5, "en", undefined, undefined, "篇", "posts", "post")).toBe("5 posts");

    expect(formatCountWithUnit(1, "en", "day", "days", "天", "days", "day")).toBe("1 day");
    expect(formatCountWithUnit(3, "en", "day", "days", "天", "days", "day")).toBe("3 days");
    expect(formatCountWithUnit(3, "zh", "天", "天", "天", "days", "day")).toBe("3 天");
    expect(formatCountWithUnit(3, "zh", undefined, undefined, "天", "days", "day")).toBe("3 天");
  });

  it("adapts stat units for English in renderActivityCard and renderDailyRecapCard without Chinese 篇", () => {
    const filledTextsEn: string[] = [];
    const mockCtxEn: any = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: (txt: string) => { filledTextsEn.push(txt); },
      measureText: (txt: string) => ({ width: txt.length * 8 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvasEn: any = {
      width: 0,
      height: 0,
      getContext: () => mockCtxEn,
    };

    const refDate = new Date(2026, 8, 26, 14, 0);
    const posts: Post[] = [createMockPost("p1", refDate.getTime())];
    const calendar = buildHeatmapCalendar(posts, 5, "en", refDate);
    const timeline = buildIntradayTimeline(posts, refDate);

    renderActivityCard(mockCanvasEn, calendar, posts, {
      lang: "en",
      labels: {
        totalPostsLabel: "TOTAL POSTS VIEWED",
        unitPost: "post",
        unitPosts: "posts",
        unitDay: "day",
        unitDays: "days",
      },
    });

    renderDailyRecapCard(mockCanvasEn, timeline, posts, {
      lang: "en",
      labels: {
        totalPostsLabel: "TODAY BROWSED",
        unitPost: "post",
        unitPosts: "posts",
        unitMinute: "min",
        unitMinutes: "min",
      },
    });

    // In English, it must have "1 post" and must NEVER have "篇"
    expect(filledTextsEn).toContain("1 post");
    const hasChinesePian = filledTextsEn.some(t => t.includes("篇"));
    expect(hasChinesePian).toBe(false);

    // Redundant slogans must never appear
    const redundantTexts = [
      "今日阅读节奏",
      "累计走势折线图",
      "每分钟精准记录",
      "不仅攀升",
    ];
    for (const r of redundantTexts) {
      expect(filledTextsEn.some(t => t.includes(r))).toBe(false);
    }
  });

  it("renders correct units in Chinese for renderActivityCard and renderDailyRecapCard", () => {
    const filledTextsZh: string[] = [];
    const mockCtxZh: any = {
      save: () => {},
      restore: () => {},
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      fillText: (txt: string) => { filledTextsZh.push(txt); },
      measureText: (txt: string) => ({ width: txt.length * 8 }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
    };

    const mockCanvasZh: any = {
      width: 0,
      height: 0,
      getContext: () => mockCtxZh,
    };

    const refDate = new Date(2026, 8, 26, 14, 0);
    const posts: Post[] = [createMockPost("p1", refDate.getTime())];
    const calendar = buildHeatmapCalendar(posts, 5, "zh", refDate);
    const timeline = buildIntradayTimeline(posts, refDate);

    renderActivityCard(mockCanvasZh, calendar, posts, {
      lang: "zh",
      labels: {
        totalPostsLabel: "累计浏览推文",
        unitPost: "篇",
        unitPosts: "篇",
        unitDay: "天",
        unitDays: "天",
      },
    });

    renderDailyRecapCard(mockCanvasZh, timeline, posts, {
      lang: "zh",
      labels: {
        totalPostsLabel: "今日浏览",
        unitPost: "篇",
        unitPosts: "篇",
        unitMinute: "分钟",
        unitMinutes: "分钟",
      },
    });

    expect(filledTextsZh).toContain("1 篇");
    expect(filledTextsZh).toContain("1 天");
  });


});
