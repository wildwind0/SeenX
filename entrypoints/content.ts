import { Post, CaptureRules, DEFAULT_CAPTURE_RULES, MediaItem, PostType } from '../src/types';
import { getCaptureRules, onCaptureRulesChanged } from '../src/storage/rules';

export default defineContentScript({
  matches: ['*://*.x.com/*', '*://*.twitter.com/*'],
  runAt: 'document_start',
  main() {
    console.log('[SeenX Content Script] Initialized.');

    let currentRules: CaptureRules = DEFAULT_CAPTURE_RULES;
    const postCache = new Map<string, Post>();
    const pendingDwellTimers = new Map<string, number>();

    // Load active rules and listen for changes
    getCaptureRules().then((rules) => {
      currentRules = rules;
    });
    onCaptureRulesChanged((newRules) => {
      currentRules = newRules;
    });

    // 1. Receive posts from Main World interceptor
    window.addEventListener('message', (event) => {
      if (event.data?.source === 'seenx-main-world' && event.data?.type === 'POSTS_EXTRACTED') {
        const posts: Post[] = event.data.posts;
        for (const post of posts) {
          if (post && post.id) {
            postCache.set(post.id, post);
          }
        }
        checkCurrentStatusPage();
      }
    });

    // Request sync from Main World cache
    function requestSync() {
      window.postMessage(
        { source: 'seenx-content-script', type: 'SEENX_REQUEST_SYNC' },
        '*'
      );
    }
    requestSync();
    setTimeout(requestSync, 1000);
    setTimeout(requestSync, 3000);

    // Robust DOM Avatar Extractor
    function extractAvatarFromDOM(el: HTMLElement): string {
      // 1. Check data-testid="Tweet-User-Avatar"
      const avatarContainer = el.querySelector('[data-testid="Tweet-User-Avatar"]');
      if (avatarContainer) {
        const img = avatarContainer.querySelector('img');
        if (img?.src && !img.src.startsWith('data:')) {
          return img.src;
        }
        const bgDiv = avatarContainer.querySelector('[style*="background-image"]') as HTMLElement;
        if (bgDiv?.style?.backgroundImage) {
          const match = bgDiv.style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
          if (match && match[1]) return match[1];
        }
      }

      // 2. Check profile images anywhere in the tweet header
      const header = el.querySelector('[data-testid="User-Name"]')?.parentElement;
      if (header) {
        const img = header.querySelector('img');
        if (img?.src && !img.src.startsWith('data:')) {
          return img.src;
        }
      }

      // 3. Check any img with profile_images in src
      const imgs = el.querySelectorAll('img');
      for (const img of imgs) {
        const src = img.src || img.getAttribute('src') || '';
        if (src.includes('profile_images') || src.includes('default_profile')) {
          return src;
        }
      }

      return '';
    }

    // Fallback: Parse directly from DOM node when network data is not yet in cache
    function extractPostFromDOM(el: HTMLElement, tweetId: string): Post | null {
      try {
        const userContainer = el.querySelector('[data-testid="User-Name"]');
        let authorName = 'X User';
        let authorScreenName = 'user';
        let verified = false;

        if (userContainer) {
          const links = userContainer.querySelectorAll('a');
          if (links.length > 0) {
            authorName = links[0].textContent?.trim() || authorName;
            const handleText = links[1]?.textContent?.trim() || links[0].getAttribute('href')?.replace('/', '') || '';
            authorScreenName = handleText.replace('@', '');
          }
          if (userContainer.querySelector('svg[data-testid*="verified"]')) {
            verified = true;
          }
        }

        const rawAvatar = extractAvatarFromDOM(el);
        let avatarUrl = rawAvatar.trim();
        if (avatarUrl.startsWith('//')) avatarUrl = 'https:' + avatarUrl;
        if (avatarUrl.includes('_normal')) {
          avatarUrl = avatarUrl.replace(/_normal(?=\.[a-zA-Z0-9]+)/i, '_bigger');
        }

        const textContainer = el.querySelector('[data-testid="tweetText"]');
        const text = textContainer?.textContent?.trim() || '';

        // Check media
        const mediaList: MediaItem[] = [];
        const photoImgs = el.querySelectorAll('[data-testid="tweetPhoto"] img');
        photoImgs.forEach((img) => {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('profile_images')) {
            mediaList.push({
              type: 'image',
              url: src,
              previewUrl: src,
            });
          }
        });

        const videoEl = el.querySelector('video');
        if (videoEl) {
          mediaList.push({
            type: 'video',
            url: videoEl.poster || '',
            previewUrl: videoEl.poster,
            videoUrl: videoEl.src,
          });
        }

        let postType: PostType = 'standard';
        if (mediaList.some((m) => m.type === 'video')) {
          postType = 'video';
        } else if (text.length > 500) {
          postType = 'article';
        }

        // Check promoted
        const isPromoted = Boolean(
          el.textContent?.includes('Ad') || 
          el.textContent?.includes('推广') || 
          el.textContent?.includes('Sponsored')
        );

        const now = Date.now();

        return {
          id: tweetId,
          url: `https://x.com/${authorScreenName}/status/${tweetId}`,
          author: {
            id: '',
            name: authorName,
            screenName: authorScreenName,
            avatarUrl,
            verified,
          },
          text,
          postType,
          media: mediaList,
          threadInfo: {
            conversationId: tweetId,
          },
          firstSeenAt: now,
          lastSeenAt: now,
          seenCount: 1,
          engaged: false,
          starred: false,
          isPromoted,
        };
      } catch (e) {
        return null;
      }
    }

    // Helper: persist a post via background service worker to ensure extension origin IndexedDB
    async function persistPost(id: string, options: { isEngaged?: boolean } = {}) {
      let post = postCache.get(id);

      if (!post || !post.author.avatarUrl) {
        const domTweet = document.querySelector(`article[data-seenx-id="${id}"]`) as HTMLElement;
        if (domTweet) {
          const extracted = extractPostFromDOM(domTweet, id);
          if (extracted) {
            if (post) {
              // Supplement missing avatar from DOM
              if (!post.author.avatarUrl && extracted.author.avatarUrl) {
                post.author.avatarUrl = extracted.author.avatarUrl;
              }
            } else {
              post = extracted;
            }
            postCache.set(id, post);
          }
        }
      }

      if (!post) {
        post = {
          id,
          url: `https://x.com/i/web/status/${id}`,
          author: { id: '', name: 'X Post', screenName: 'i', avatarUrl: '' },
          text: '',
          postType: 'standard',
          media: [],
          firstSeenAt: Date.now(),
          lastSeenAt: Date.now(),
          seenCount: 1,
          engaged: !!options.isEngaged,
          starred: false,
        };
      }

      if (currentRules.filterPromoted && post.isPromoted) {
        return;
      }

      if (currentRules.captureMode === 'engaged_only' && !options.isEngaged && !post.engaged) {
        return;
      }

      const postToSave: Partial<Post> & { id: string } = {
        ...post,
        engaged: options.isEngaged || post.engaged,
      };

      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            type: 'SAVE_POST',
            post: postToSave,
          }, () => {
            if (chrome.runtime.lastError) {
              console.debug('[SeenX] Save message note:', chrome.runtime.lastError.message);
            }
          });
        }
      } catch (err) {
        console.error('[SeenX] Failed to send post to background:', err);
      }
    }

    // Helper: extract Tweet ID from a tweet DOM node
    function getTweetIdFromElement(el: Element): string | null {
      // Best anchor: time element's parent link
      const timeEl = el.querySelector('time');
      if (timeEl) {
        const timeLink = timeEl.closest('a');
        if (timeLink) {
          const href = timeLink.getAttribute('href') || '';
          const match = href.match(/\/status\/(\d+)/);
          if (match && match[1]) return match[1];
        }
      }

      // Fallback: any status link
      const statusLinks = el.querySelectorAll('a[href*="/status/"]');
      for (const link of statusLinks) {
        const href = (link as HTMLAnchorElement).getAttribute('href') || '';
        const match = href.match(/\/status\/(\d+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    }

    // 2. IntersectionObserver for Dwell Time (Impression)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const tweetEl = entry.target as HTMLElement;
          const tweetId = tweetEl.dataset.seenxId || getTweetIdFromElement(tweetEl);

          if (!tweetId) continue;
          tweetEl.dataset.seenxId = tweetId;

          // Qualifies if >= 25% visible OR at least 160px visible on screen
          const isVisibleEnough = entry.intersectionRatio >= 0.25 || entry.intersectionRect.height >= 160;

          if (entry.isIntersecting && isVisibleEnough) {
            if (!pendingDwellTimers.has(tweetId)) {
              const timer = window.setTimeout(() => {
                pendingDwellTimers.delete(tweetId);
                persistPost(tweetId, { isEngaged: false });
              }, currentRules.dwellTimeMs);

              pendingDwellTimers.set(tweetId, timer);
            }
          } else {
            const timer = pendingDwellTimers.get(tweetId);
            if (timer) {
              clearTimeout(timer);
              pendingDwellTimers.delete(tweetId);
            }
          }
        }
      },
      {
        threshold: [0.1, 0.25, 0.5],
      }
    );

    // Scan and observe tweet elements
    function observeTweets() {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');
      tweets.forEach((tweet) => {
        const tweetId = getTweetIdFromElement(tweet);
        if (tweetId) {
          (tweet as HTMLElement).dataset.seenxId = tweetId;
          if (!tweet.hasAttribute('data-seenx-observed')) {
            tweet.setAttribute('data-seenx-observed', 'true');
            observer.observe(tweet);
          }
        }
      });
    }

    function initObserver() {
      const domObserver = new MutationObserver(() => {
        observeTweets();
      });
      domObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
      observeTweets();
    }

    if (document.body) {
      initObserver();
    } else {
      document.addEventListener('DOMContentLoaded', initObserver);
    }

    // 3. User Engagement Tracker (Clicks / Interactivity)
    document.addEventListener(
      'click',
      (e) => {
        const target = e.target as HTMLElement;
        if (!target) return;

        const tweetEl = target.closest('article[data-testid="tweet"]') as HTMLElement;
        if (tweetEl) {
          const tweetId = tweetEl.dataset.seenxId || getTweetIdFromElement(tweetEl);
          if (tweetId) {
            persistPost(tweetId, { isEngaged: true });
          }
        }
      },
      true
    );

    // 4. URL change detection for Direct Status Landing
    function checkCurrentStatusPage() {
      const match = window.location.pathname.match(/\/status\/(\d+)/);
      if (match && match[1]) {
        const statusId = match[1];
        persistPost(statusId, { isEngaged: true });
      }
    }

    let lastPathname = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== lastPathname) {
        lastPathname = window.location.pathname;
        checkCurrentStatusPage();
      }
    }, 500);
    checkCurrentStatusPage();
  },
});
