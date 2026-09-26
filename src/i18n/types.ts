export type Language =
  | 'en'
  | 'zh'
  | 'zh-TW'
  | 'ja'
  | 'es'
  | 'pt'
  | 'id'
  | 'de'
  | 'fr'
  | 'tr'
  | 'ar'
  | 'ko';

export interface LanguageMeta {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇭🇰' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export interface TranslationSchema {
  common: {
    appName: string;
    tagline: string;
    clear: string;
    cancel: string;
    confirm: string;
    delete: string;
    close: string;
    save: string;
    loading: string;
    copied: string;
    viewOnX: string;
    openInX: string;
  };
  categories: {
    all: string;
    starred: string;
    standard: string;
    article: string;
    video: string;
    quote: string;
    thread: string;
  };
  timeRange: {
    title: string;
    all: string;
    today: string;
    week: string;
    month: string;
  };
  sort: {
    label: string;
    lastSeen: string;
    firstSeen: string;
    mostViewed: string;
  };
  search: {
    placeholder: string;
  };
  postCard: {
    star: string;
    unstar: string;
    delete: string;
    copyLink: string;
    linkCopied: string;
    readArticle: string;
    viewCountSuffix: string;
    threadReply: string;
    threadSeries: string;
    collapseThread: string;
    loadingThread: string;
    noOtherPosts: string;
    recordedThreadPosts: string;
    itemsCount: string;
    onlyBrowsedFootnote: string;
    viewFullDiscussion: string;
    revisitedTimes: string;
  };
  reader: {
    tag: string;
    wordCount: string;
    zoomIn: string;
    zoomOut: string;
    copyMarkdown: string;
    copiedMarkdown: string;
    openOriginal: string;
    untitled: string;
    viewedAt: string;
  };
  export: {
    title: string;
    jsonTitle: string;
    jsonDesc: string;
    mdTitle: string;
    mdDesc: string;
    importJson: string;
    importing: string;
    importSuccess: string;
    importError: string;
  };
  sponsor: {
    title: string;
    desc: string;
    button: string;
    tooltip: string;
    exportFooterPrefix: string;
    exportFooterLink: string;
  };
  settings: {
    title: string;
    savedToast: string;
    language: string;
    langZh: string;
    langEn: string;
    captureMode: string;
    allQualifying: string;
    allQualifyingDesc: string;
    engagedOnly: string;
    engagedOnlyDesc: string;
    dwellTitle: string;
    dwellDesc: string;
    dwellUnit: string;
    filterPromoted: string;
    filterPromotedDesc: string;
    retentionTitle: string;
    retentionForever: string;
    retentionDays: string;
    clearHistoryBtn: string;
    confirmClearPrompt: string;
    confirmClearBtn: string;
    footerDisclaimer: string;
  };
  main: {
    todayCaptures: string;
    contentCategories: string;
    authorFilterPrefix: string;
    rulesSettings: string;
    backupExport: string;
    dashboard: string;
    refresh: string;
    loadingDb: string;
    dashboardWelcomeTitle: string;
    dashboardWelcomeDesc: string;
    dashboardNoMatchTitle: string;
    dashboardNoMatchDesc: string;
    sidepanelReadyTitle: string;
    sidepanelReadyDesc: string;
    sidepanelNoMatchTitle: string;
    sidepanelNoMatchDesc: string;
    threadEmptyTitle: string;
    threadEmptyDesc: string;
    dashboardTabTitle: string;
    sidepanelTabTitle: string;
  };
  relativeTime: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
    weeksAgo: string;
  };
  heatmap: {
    title: string;
    subTitle: string;
    streak: string;
    activeDays: string;
    totalPosts: string;
    dailyAvg: string;
    longestStreak: string;
    mostActive: string;
    postsOnDate: string;
    noPostsOnDate: string;
    less: string;
    more: string;
    shareCard: string;
    filterByDate: string;
    clearFilter: string;
    themeGithub: string;
    themeSeenx: string;
    themeCyberpunk: string;
    themeSunset: string;
    weekdayMon: string;
    weekdayWed: string;
    weekdayFri: string;
    viewToday: string;
    viewCalendar: string;
    viewModeToggleTooltip: string;
    todaySubTitle: string;
    todayEmpty: string;
    todayHoverStat: string;
    todayPeakHour: string;
    monthSubtitle: string;
    span1Month: string;
    span3Months: string;
    span1Year: string;
    spanAll: string;
    todayViewed: string;
    todayActiveMins: string;
  };
  share: {
    title: string;
    theme: string;
    preview: string;
    shareToX: string;
    copyImage: string;
    downloadPng: string;
    shareToTelegram: string;
    shareToReddit: string;
    platformSharing: string;
    imageCopied: string;
    downloadSuccess: string;
    copyImageFailed: string;
    tweetTemplate: string;
    tweetCopiedNotice: string;
    pasteHint: string;
    cardTagline: string;
    cardPrivacy: string;
    statTotal: string;
    statActive: string;
    statStreak: string;
    statBest: string;
    tabDailyRecap: string;
    tabHeatmap: string;
    timeSpan: string;
    dailyRecapTitle: string;
    dailyRecapSubtitle: string;
    categoryBreakdown: string;
    peakHourLabel: string;
    activeMinutesLabel: string;
    tweetTemplateToday: string;
    shareWithImageNotice: string;
    unitPost: string;
    unitPosts: string;
    unitDay: string;
    unitDays: string;
    unitMinute: string;
    unitMinutes: string;
    heatmapWeeksTitle: string;
    peakDay: string;
    avgDay: string;
    allDay: string;
    timelineTitle: string;
    noActivityToday: string;
    noCategoryData: string;
  };
}
