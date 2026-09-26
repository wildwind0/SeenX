import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  outDir: 'dist',
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDesc__',
    default_locale: 'zh_CN',
    permissions: [
      'storage',
      'unlimitedStorage',
      'sidePanel',
      'scripting',
      'alarms',
    ],
    host_permissions: ['*://*.x.com/*', '*://*.twitter.com/*'],
    browser_specific_settings: {
      gecko: {
        id: 'seenx-extension@seenx.local',
        strict_min_version: '109.0',
      },
    },
    action: {
      default_title: '__MSG_actionTitle__',
      default_icon: {
        16: 'icon-16.png',
        32: 'icon-32.png',
        48: 'icon-48.png',
        128: 'icon-128.png',
      },
    },
    icons: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  },
});
