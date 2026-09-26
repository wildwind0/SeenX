import { extractPostsFromPayload } from '../src/utils/parser';

export default defineContentScript({
  matches: ['*://*.x.com/*', '*://*.twitter.com/*'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    if ((window as any).__SEENX_INJECTED__) return;
    (window as any).__SEENX_INJECTED__ = true;

    console.log('[SeenX Main World] Interceptor active.');
    const memoryCache = new Map<string, any>();

    function emitExtractedPosts(posts: any[]) {
      if (!posts || posts.length === 0) return;
      for (const p of posts) {
        if (p && p.id) {
          memoryCache.set(p.id, p);
        }
      }
      window.postMessage(
        {
          source: 'seenx-main-world',
          type: 'POSTS_EXTRACTED',
          posts,
        },
        '*'
      );
    }

    // Respond to sync requests from Content Script
    window.addEventListener('message', (e) => {
      if (e.data?.source === 'seenx-content-script' && e.data?.type === 'SEENX_REQUEST_SYNC') {
        const allPosts = Array.from(memoryCache.values());
        if (allPosts.length > 0) {
          window.postMessage(
            {
              source: 'seenx-main-world',
              type: 'POSTS_EXTRACTED',
              posts: allPosts,
            },
            '*'
          );
        }
      }
    });

    function processPayload(data: any) {
      if (!data) return;
      try {
        const posts = extractPostsFromPayload(data);
        if (posts.length > 0) {
          emitExtractedPosts(posts);
        }
      } catch (err) {
        console.debug('[SeenX] Payload processing error:', err);
      }
    }

    // 1. Hook fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args: any[]) {
      const response = await originalFetch.apply(this, args as any);
      try {
        const rawUrl = response.url || (typeof args[0] === 'string' ? args[0] : (args[0] as any)?.url || (args[0] as any)?.href || '');
        if (rawUrl.includes('/graphql/') || rawUrl.includes('/i/api/') || rawUrl.includes('twitter.com') || rawUrl.includes('x.com')) {
          try {
            const clone = response.clone();
            clone.text().then((text) => {
              if (text && text.startsWith('{')) {
                try {
                  const data = JSON.parse(text);
                  processPayload(data);
                } catch {}
              }
            }).catch(() => {});
          } catch {}
        }
      } catch {}
      return response;
    };

    // 2. Hook XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: any[]) {
      (this as any).__seenx_url = args[1];
      return originalOpen.apply(this, args as any);
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, ...args: any[]) {
      this.addEventListener('load', function () {
        try {
          const url = (this as any).__seenx_url || this.responseURL || '';
          if (url.includes('/graphql/') || url.includes('/i/api/')) {
            if (this.responseText && this.responseText.startsWith('{')) {
              try {
                const data = JSON.parse(this.responseText);
                processPayload(data);
              } catch {}
            }
          }
        } catch {}
      });
      return originalSend.apply(this, args as any);
    };

    // 3. Scan initial SSR state
    function checkInitialState() {
      try {
        const initialState = (window as any).__INITIAL_STATE__;
        if (initialState) {
          processPayload(initialState);
        }

        const scripts = document.querySelectorAll('script[type="application/json"]');
        scripts.forEach((script) => {
          try {
            const text = script.textContent;
            if (text && (text.includes('tweet') || text.includes('instructions'))) {
              const parsed = JSON.parse(text);
              processPayload(parsed);
            }
          } catch {}
        });
      } catch {}
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkInitialState);
    } else {
      checkInitialState();
    }
  },
});
