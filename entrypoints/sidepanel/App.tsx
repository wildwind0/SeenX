import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Maximize2, 
  Sliders, 
  Download, 
  X, 
  Sparkles, 
  RefreshCw,
  SearchX,
  Coffee
} from 'lucide-react';
import { Post, FilterCategory } from '../../src/types';
import { getAllPosts, subscribeToDBChanges } from '../../src/storage/db';
import { getSearchEngine } from '../../src/search/engine';
import { PostCard } from '../../src/components/PostCard';
import { SearchBar } from '../../src/components/SearchBar';
import { FilterTabs } from '../../src/components/FilterTabs';
import { SettingsModal } from '../../src/components/SettingsModal';
import { ExportModal } from '../../src/components/ExportModal';
import { ReaderModal } from '../../src/components/ReaderModal';
import { useI18n } from '../../src/i18n';
import { BUY_ME_A_COFFEE_URL } from '../../src/constants';

export const App: React.FC = () => {
  const { t, lang } = useI18n();

  useEffect(() => {
    document.title = t('main.sidepanelTabTitle');
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, t]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeArticlePost, setActiveArticlePost] = useState<Post | null>(null);

  const searchEngine = useMemo(() => getSearchEngine(), []);

  // Fetch all posts and update search index
  const loadPosts = useCallback(async () => {
    try {
      const all = await getAllPosts();
      setPosts(all);
      searchEngine.indexPosts(all);
    } catch (e) {
      console.error('[SeenX] Failed to load posts in sidepanel:', e);
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

  // Open Full-page Dashboard
  const handleOpenDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    } else {
      window.open('/dashboard.html', '_blank');
    }
  };

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

  // Filtered posts based on search, category, author
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 1. Author filter
    if (authorFilter) {
      result = result.filter(p => p.author.screenName.toLowerCase() === authorFilter.toLowerCase());
    }

    // 2. Category filter
    if (selectedCategory === 'starred') {
      result = result.filter(p => p.starred);
    } else if (selectedCategory === 'thread') {
      result = result.filter(p => p.postType === 'thread' || (Boolean(p.threadInfo?.conversationId) && (conversationCounts.get(p.threadInfo!.conversationId) || 0) > 1));
    } else if (selectedCategory !== 'all') {
      result = result.filter(p => p.postType === selectedCategory);
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const matchedIds = new Set(searchEngine.search(searchQuery));
      result = result.filter(p => matchedIds.has(p.id));
    }

    return result;
  }, [posts, selectedCategory, searchQuery, authorFilter, searchEngine, conversationCounts]);

  // Calculate today's captures
  const todayCount = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayMs = startOfToday.getTime();
    return posts.filter(p => p.lastSeenAt >= todayMs).length;
  }, [posts]);

  return (
    <div className="flex flex-col h-screen w-full bg-black text-[#e7e9ea] overflow-x-hidden select-none">
      {/* Top Header */}
      <header className="px-4 py-3 border-b border-[#2f3336] bg-[#000000]/80 backdrop-blur-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1d9bf0] to-purple-500 flex items-center justify-center font-black text-white text-sm shadow-md">
            X
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-tight text-white">{t('common.appName')}</span>
              <span className="text-[10px] text-[#71767b] font-medium">{t('common.tagline')}</span>
            </div>
            <div className="text-[10px] text-[#1d9bf0] font-mono mt-0.5">
              {t('main.todayCaptures', { count: todayCount })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#71767b]">
          <button
            onClick={() => loadPosts()}
            className="p-1.5 rounded-lg hover:bg-[#202327] hover:text-[#e7e9ea] transition-colors"
            title={t('main.refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1d9bf0]' : ''}`} />
          </button>

          <button
            onClick={() => setExportOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#202327] hover:text-[#e7e9ea] transition-colors"
            title={t('main.backupExport')}
          >
            <Download className="w-4 h-4" />
          </button>

          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-amber-400/10 text-amber-400/80 hover:text-amber-400 transition-colors"
            title={t('sponsor.tooltip')}
          >
            <Coffee className="w-4 h-4" />
          </a>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg hover:bg-[#202327] hover:text-[#e7e9ea] transition-colors"
            title={t('main.rulesSettings')}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenDashboard}
            className="p-1.5 rounded-lg bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-colors ml-1"
            title={t('main.dashboard')}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Filter and Search Section */}
      <div className="px-4 pt-3 pb-2 space-y-2.5 shrink-0 border-b border-[#2f3336]/60">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('search.placeholder')}
          totalCount={posts.length}
          resultCount={filteredPosts.length}
        />

        <FilterTabs
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          counts={counts}
        />

        {authorFilter && (
          <div className="flex items-center gap-1.5 text-xs text-[#1d9bf0] bg-[#1d9bf0]/10 border border-[#1d9bf0]/20 px-2.5 py-1 rounded-full w-fit">
            <span>{t('main.authorFilterPrefix', { name: authorFilter })}</span>
            <button
              onClick={() => setAuthorFilter(null)}
              className="p-0.5 hover:text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Post Stream */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#71767b] gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#1d9bf0]" />
            <span className="text-xs">{t('common.loading')}</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            {posts.length === 0 ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#16181c] border border-[#2f3336] flex items-center justify-center text-[#1d9bf0] mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#e7e9ea] mb-1">{t('main.sidepanelReadyTitle')}</h4>
                <p className="text-xs text-[#71767b] max-w-xs leading-relaxed">
                  {t('main.sidepanelReadyDesc')}
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#16181c] border border-[#2f3336] flex items-center justify-center text-[#71767b] mb-3">
                  <SearchX className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#e7e9ea] mb-1">
                  {selectedCategory === 'thread' ? t('main.threadEmptyTitle') : t('main.sidepanelNoMatchTitle')}
                </h4>
                <p className="text-xs text-[#71767b] max-w-[240px] leading-relaxed">
                  {selectedCategory === 'thread'
                    ? t('main.threadEmptyDesc')
                    : t('main.sidepanelNoMatchDesc')}
                </p>
              </>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              threadCount={conversationCounts.get(post.threadInfo?.conversationId || '') || 1}
              compact
              onPostDeleted={(id) => {
                setPosts(prev => prev.filter(p => p.id !== id));
                searchEngine.removePost(id);
              }}
              onAuthorClick={(screenName) => setAuthorFilter(screenName)}
              onOpenArticleReader={(p) => setActiveArticlePost(p)}
            />
          ))
        )}
      </main>

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

      <ReaderModal
        post={activeArticlePost}
        onClose={() => setActiveArticlePost(null)}
      />
    </div>
  );
};
