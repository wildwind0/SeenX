import { getCaptureRules } from '../src/storage/rules';
import { cleanupRetention, savePost, getAllPosts } from '../src/storage/db';

export default defineBackground(() => {
  // 1. Enable Side Panel on action icon click
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.debug('[SeenX] SidePanel API note:', err));
  }

  // 2. Handle messages from extension components & content scripts
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === 'OPEN_DASHBOARD') {
        const dashboardUrl = chrome.runtime.getURL('dashboard.html');
        chrome.tabs.create({ url: dashboardUrl });
        sendResponse({ success: true });
        return true;
      }

      if (message?.type === 'SAVE_POST') {
        savePost(message.post)
          .then((saved) => {
            sendResponse({ success: true, post: saved });
          })
          .catch((err) => {
            console.error('[SeenX Background] Failed to save post:', err);
            sendResponse({ success: false, error: String(err) });
          });
        return true; // Keep message channel open for async response
      }

      if (message?.type === 'GET_ALL_POSTS') {
        getAllPosts()
          .then((posts) => sendResponse({ success: true, posts }))
          .catch((err) => sendResponse({ success: false, error: String(err) }));
        return true;
      }
    });
  }

  // 3. Inject content scripts into already-open tabs on install/update
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(async () => {
      try {
        if (chrome.tabs && chrome.scripting) {
          const tabs = await chrome.tabs.query({ url: ['*://*.x.com/*', '*://*.twitter.com/*'] });
          for (const tab of tabs) {
            if (tab.id) {
              try {
                await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ['content-scripts/inject.js'],
                  world: 'MAIN',
                });
                await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  files: ['content-scripts/content.js'],
                });
              } catch (e) {
                // Tab may not be ready or active
              }
            }
          }
        }
      } catch (err) {
        console.debug('[SeenX] onInstalled injection note:', err);
      }
    });
  }

  // 4. Periodic retention cleanup
  async function performRetentionCleanup() {
    try {
      const rules = await getCaptureRules();
      if (rules.retentionDays > 0) {
        const deleted = await cleanupRetention(rules.retentionDays);
        if (deleted > 0) {
          console.log(`[SeenX] Cleaned up ${deleted} expired posts older than ${rules.retentionDays} days.`);
        }
      }
    } catch (e) {
      console.error('[SeenX] Retention cleanup failed:', e);
    }
  }

  performRetentionCleanup();

  if (typeof chrome !== 'undefined' && chrome.alarms) {
    chrome.alarms.create('seenx_retention_check', { periodInMinutes: 1440 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'seenx_retention_check') {
        performRetentionCleanup();
      }
    });
  }
});
