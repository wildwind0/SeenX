import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sliders, 
  Download, 
  RefreshCw, 
  Sparkles, 
  SearchX, 
  X, 
  Star, 
  FileText, 
  BookOpen, 
  Play, 
  Repeat2, 
  Layers, 
  LayoutGrid, 
  Calendar, 
  ArrowUpDown, 
  Columns, 
  ListFilter, 
  Coffee 
} from 'lucide-react';
import { Post, FilterCategory, DateFilter } from '../../src/types';
import { getAllPosts, subscribeToDBChanges } from '../../src/storage/db';
import { getSearchEngine } from '../../src/search/engine';
import { PostCard } from '../../src/components/PostCard';
import { SearchBar } from '../../src/components/SearchBar';
import { SettingsModal } from '../../src/components/SettingsModal';
import { ExportModal } from '../../src/components/ExportModal';
import { ReaderModal } from '../../src/components/ReaderModal';
import { HeatmapSidebar } from '../../src/components/HeatmapSidebar';
import { ShareModal } from '../../src/components/ShareModal';
import { toLocalDateKey } from '../../src/utils/activity';
import { useI18n } from '../../src/i18n';
import { BUY_ME_A_COFFEE_URL } from '../../src/constants';

type SortOption = 'last_seen' | 'first_seen' | 'most_viewed';

export const App: React.FC = () => {
  const { t, lang } = useI18n();

  useEffect(() => {
    document.title = t('main.dashboardTabTitle');
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, t]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [heatmapDateFilter, setHeatmapDateFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('last_seen');
  const [columnsLayout, setColumnsLayout] = useState<'single' | 'double'>('double');

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalTemplate, setShareModalTemplate] = useState<'recap' | 'heatmap'>('recap');
  const [activeArticlePost, setActiveArticlePost] = useState<Post | null>(null);

  const searchEngine = useMemo(() => getSearchEngine(), []);

  const loadPosts = useCallback(async () => {
    try {
      const all = await getAllPosts();
      setPosts(all);
      searchEngine.indexPosts(all);
    } catch (e) {
      console.error('[SeenX] Failed to load dashboard posts:', e);
    } finally {
      setLoading(false);
    }
  }, [searchEngine]);

  useEffect(() => {
    loadPosts();
    const unsubscribe = subscribeToDBChanges(() => {
      loadPosts();
    });
    return () => unsubscribe();
  }, [loadPosts]);

  // Precompute conversation counts for threads
  const conversationCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      const convId = p.threadInfo?.conversationId;
      if (convId) {
        map.set(convId, (map.get(convId) || 0) + 1);
      }
    }
    return map;
  }, [posts]);

  // Category counts
  const counts = useMemo(() => {
    const res: Partial<Record<FilterCategory, number>> = {
      all: posts.length,
      starred: 0,
      standard: 0,
      article: 0,
      video: 0,
      quote: 0,
      thread: 0,
    };
    for (const p of posts) {
      if (p.starred) res.starred = (res.starred || 0) + 1;
      if (p.postType === 'standard') res.standard = (res.standard || 0) + 1;
      if (p.postType === 'article') res.article = (res.article || 0) + 1;
      if (p.postType === 'video') res.video = (res.video || 0) + 1;
      if (p.postType === 'quote') res.quote = (res.quote || 0) + 1;
      const isThread = p.postType === 'thread' || (Boolean(p.threadInfo?.conversationId) && (conversationCounts.get(p.threadInfo!.conversationId) || 0) > 1);
      if (isThread) res.thread = (res.thread || 0) + 1;
    }
    return res;
  }, [posts, conversationCounts]);

  // Filtered & sorted posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 1. Author
    if (authorFilter) {
      result = result.filter(p => p.author.screenName.toLowerCase() === authorFilter.toLowerCase());
    }

    // 2. Category
    if (selectedCategory === 'starred') {
      result = result.filter(p => p.starred);
    } else if (selectedCategory === 'thread') {
      result = result.filter(p => p.postType === 'thread' || (Boolean(p.threadInfo?.conversationId) && (conversationCounts.get(p.threadInfo!.conversationId) || 0) > 1));
    } else if (selectedCategory !== 'all') {
      result = result.filter(p => p.postType === selectedCategory);
    }

    // 3. Date range or specific heatmap date
    if (heatmapDateFilter) {
      result = result.filter(p => {
        const firstKey = toLocalDateKey(p.firstSeenAt);
        const lastKey = toLocalDateKey(p.lastSeenAt);
        return firstKey === heatmapDateFilter || lastKey === heatmapDateFilter;
      });
    } else {
      const now = Date.now();
      if (dateFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        result = result.filter(p => p.lastSeenAt >= startOfToday.getTime());
      } else if (dateFilter === 'week') {
        result = result.filter(p => p.lastSeenAt >= now - 7 * 86400000);
      } else if (dateFilter === 'month') {
        result = result.filter(p => p.lastSeenAt >= now - 30 * 86400000);
      }
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const matchedIds = new Set(searchEngine.search(searchQuery));
      result = result.filter(p => matchedIds.has(p.id));
    }

    // 5. Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'first_seen') {
        return b.firstSeenAt - a.firstSeenAt;
      }
      if (sortBy === 'most_viewed') {
        return b.seenCount - a.seenCount;
      }
      return b.lastSeenAt - a.lastSeenAt;
    });

    return result;
  }, [posts, selectedCategory, searchQuery, authorFilter, dateFilter, heatmapDateFilter, sortBy, searchEngine, conversationCounts]);

  const navCategories: { id: FilterCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: t('categories.all'), icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'starred', label: t('categories.starred'), icon: <Star className="w-4 h-4 text-amber-400" /> },
    { id: 'standard', label: t('categories.standard'), icon: <FileText className="w-4 h-4 text-blue-400" /> },
    { id: 'article', label: t('categories.article'), icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
    { id: 'video', label: t('categories.video'), icon: <Play className="w-4 h-4 text-sky-400" /> },
    { id: 'quote', label: t('categories.quote'), icon: <Repeat2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'thread', label: t('categories.thread'), icon: <Layers className="w-4 h-4 text-amber-400" /> },
  ];

  const dateFilters: { id: DateFilter; label: string }[] = [
    { id: 'all', label: t('timeRange.all') },
    { id: 'today', label: t('timeRange.today') },
    { id: 'week', label: t('timeRange.week') },
    { id: 'month', label: t('timeRange.month') },
  ];

  return (
    <div className="flex h-screen w-screen bg-black text-[#e7e9ea] overflow-hidden select-none">
      {/* Left Navigation Sidebar - width increased by 20% to w-[308px] */}
      <aside className="w-[308px] border-r border-[#2f3336] bg-[#000000] p-3.5 flex flex-col justify-between shrink-0 overflow-y-auto scrollbar-thin h-screen">
        {/* Top: Branding, Categories, Time Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d9bf0] to-purple-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              X
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">SeenX</h1>
              <span className="text-[11px] text-[#71767b] font-medium leading-tight block">
                {t('common.tagline')}
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#71767b] px-3 pb-1">
              {t('main.contentCategories')}
            </div>
            {navCategories.map((cat) => {
              const active = selectedCategory === cat.id;
              const count = counts[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#e7e9ea] text-black shadow-md font-bold'
                      : 'text-[#71767b] hover:bg-[#202327] hover:text-[#e7e9ea]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cat.icon}
                    <span>{cat.label}</span>
                  </div>
                  {count !== undefined && count > 0 && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      active ? 'bg-black/10 text-black' : 'bg-[#202327] text-[#71767b]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="space-y-1 pt-2 border-t border-[#2f3336]/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#71767b] px-3 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t('timeRange.title')}
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {dateFilters.map((df) => (
                <button
                  key={df.id}
                  onClick={() => {
                    setDateFilter(df.id);
                    setHeatmapDateFilter(null);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                    !heatmapDateFilter && dateFilter === df.id
                      ? 'bg-[#1d9bf0]/15 text-[#1d9bf0] font-bold border border-[#1d9bf0]/30'
                      : 'text-[#71767b] hover:bg-[#202327] hover:text-white'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {authorFilter && (
            <div className="px-1 pt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 text-xs text-[#1d9bf0]">
                <span className="truncate">{t('main.authorFilterPrefix', { name: authorFilter })}</span>
                <button
                  onClick={() => setAuthorFilter(null)}
                  className="p-1 hover:text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Heatmap Dashboard placed near bottom + Actions */}
        <div className="space-y-3 pt-4 mt-auto">
          {/* GitHub-style Heatmap Dashboard in Left Sidebar (positioned near bottom) */}
          <HeatmapSidebar
            posts={posts}
            selectedDate={heatmapDateFilter}
            onSelectDate={(d) => setHeatmapDateFilter(d)}
            onOpenShareModal={(viewMode) => {
              setShareModalTemplate(viewMode === 'calendar' ? 'heatmap' : 'recap');
              setShareModalOpen(true);
            }}
          />

          <div className="space-y-2 pt-3 border-t border-[#2f3336]">
            <a
              href={BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 transition-colors"
              title={t('sponsor.tooltip')}
            >
              <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('sponsor.button')}</span>
            </a>

            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#71767b] hover:bg-[#202327] hover:text-white transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>{t('main.rulesSettings')}</span>
            </button>

            <button
              onClick={() => setExportOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#71767b] hover:bg-[#202327] hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t('main.backupExport')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-6 py-4 border-b border-[#2f3336] bg-[#000000]/70 backdrop-blur-md shrink-0 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('search.placeholder')}
              totalCount={posts.length}
              resultCount={filteredPosts.length}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#202327] rounded-xl px-3 py-2 text-xs text-[#71767b]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-[#e7e9ea] outline-none cursor-pointer"
              >
                <option value="last_seen" className="bg-[#16181c]">{t('sort.lastSeen')}</option>
                <option value="first_seen" className="bg-[#16181c]">{t('sort.firstSeen')}</option>
                <option value="most_viewed" className="bg-[#16181c]">{t('sort.mostViewed')}</option>
              </select>
            </div>

            <div className="hidden md:flex items-center gap-0.5 bg-[#202327] rounded-xl p-1 text-[#71767b]">
              <button
                onClick={() => setColumnsLayout('single')}
                className={`p-1.5 rounded-lg transition-colors ${
                  columnsLayout === 'single' ? 'bg-[#2f3336] text-white' : 'hover:text-white'
                }`}
                title="Single column"
              >
                <ListFilter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setColumnsLayout('double')}
                className={`p-1.5 rounded-lg transition-colors ${
                  columnsLayout === 'double' ? 'bg-[#2f3336] text-white' : 'hover:text-white'
                }`}
                title="Two columns"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => loadPosts()}
              className="p-2 rounded-xl bg-[#202327] text-[#71767b] hover:text-white transition-colors"
              title={t('main.refresh')}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Active Date or Author Filter Pills */}
          {(heatmapDateFilter || authorFilter) && (
            <div className="max-w-6xl mx-auto mb-4 flex flex-wrap items-center gap-2">
              {heatmapDateFilter && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('heatmap.filterByDate', { date: heatmapDateFilter, count: filteredPosts.length })}</span>
                  <button
                    onClick={() => setHeatmapDateFilter(null)}
                    className="p-0.5 hover:text-white hover:bg-emerald-500/20 rounded-full transition-colors ml-1"
                    title={t('heatmap.clearFilter')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {authorFilter && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 text-[#1d9bf0] text-xs font-semibold shadow-sm">
                  <span>@{authorFilter}</span>
                  <button
                    onClick={() => setAuthorFilter(null)}
                    className="p-0.5 hover:text-white hover:bg-[#1d9bf0]/20 rounded-full transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#71767b] gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#1d9bf0]" />
              <span className="text-sm">{t('main.loadingDb')}</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              {posts.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-[#16181c] border border-[#2f3336] flex items-center justify-center text-[#1d9bf0] mb-4 shadow-xl">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-[#e7e9ea] mb-2">{t('main.dashboardWelcomeTitle')}</h3>
                  <p className="text-sm text-[#71767b] max-w-md leading-relaxed">
                    {t('main.dashboardWelcomeDesc')}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-[#16181c] border border-[#2f3336] flex items-center justify-center text-[#71767b] mb-4">
                    <SearchX className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-[#e7e9ea] mb-2">
                    {selectedCategory === 'thread' ? t('main.threadEmptyTitle') : t('main.dashboardNoMatchTitle')}
                  </h3>
                  <p className="text-sm text-[#71767b] max-w-md">
                    {selectedCategory === 'thread'
                      ? t('main.threadEmptyDesc')
                      : t('main.dashboardNoMatchDesc')}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className={
              columnsLayout === 'single'
                ? 'max-w-2xl mx-auto space-y-4'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto items-start'
            }>
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  threadCount={conversationCounts.get(post.threadInfo?.conversationId || '') || 1}
                  onPostDeleted={(id) => {
                    setPosts(prev => prev.filter(p => p.id !== id));
                    searchEngine.removePost(id);
                  }}
                  onAuthorClick={(screenName) => setAuthorFilter(screenName)}
                  onOpenArticleReader={(p) => setActiveArticlePost(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onHistoryCleared={() => {
          setPosts([]);
          searchEngine.clear();
        }}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        posts={posts}
        onImportSuccess={() => loadPosts()}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        posts={posts}
        initialTemplate={shareModalTemplate}
      />

      <ReaderModal
        post={activeArticlePost}
        onClose={() => setActiveArticlePost(null)}
      />
    </div>
  );
};
