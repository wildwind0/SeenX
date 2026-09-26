<div align="center">

<img src="public/icon.svg" alt="SeenX Logo" width="80" height="80" />

# SeenX 🧭

**Capture, search, and rediscover every valuable moment on X (Twitter).**

A **100% free, local-first, zero-login, privacy-respecting** open-source browser extension.  
Automatically records tweets, long-form X Articles, videos, and multi-post threads as you browse—with instant multilingual full-text search, reading heatmaps, and rich classification dashboards.

---

[English](README.md) · [简体中文](README.zh-CN.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![100% Free](https://img.shields.io/badge/Price-100%25%20Free-brightgreen.svg?style=flat-square)](LICENSE)
[![Local-First](https://img.shields.io/badge/Storage-100%25%20Local--First-blue.svg?style=flat-square)](#-key-advantages)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Telemetry-orange.svg?style=flat-square)](#-key-advantages)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-emerald.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Framework: WXT](https://img.shields.io/badge/Framework-WXT-blueviolet.svg?style=flat-square)](https://wxt.dev/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-34%20passed-brightgreen.svg?style=flat-square)](tests/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-FFDD00.svg?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/wildwind0)

</div>

---

## 📑 Table of Contents

- [Why SeenX?](#-why-seenx)
- [Key Advantages (Local-First, Privacy, Free)](#-key-advantages)
- [Comprehensive Feature Matrix](#-comprehensive-feature-matrix)
  - [1. Smart Noise-Free Capture](#1-smart-noise-free-capture)
  - [2. Lossless Multi-Format Content Preservation](#2-lossless-multi-format-content-preservation)
  - [3. Sub-Millisecond Multilingual Full-Text Search](#3-sub-millisecond-multilingual-full-text-search)
  - [4. Reading Activity Heatmap & Insights](#4-reading-activity-heatmap--insights)
  - [5. Aesthetic Shareable Cards Generator](#5-aesthetic-shareable-cards-generator)
  - [6. Dual Workspaces: Side Panel & Full Dashboard](#6-dual-workspaces-side-panel--full-dashboard)
  - [7. Data Sovereignty & Note App Export](#7-data-sovereignty--note-app-export)
  - [8. Multilingual i18n & Dark Mode](#8-multilingual-i18n--dark-mode)
- [Capture Modes & Sensitivity Rules](#-capture-modes--sensitivity-rules)
- [Installation & Getting Started](#-installation--getting-started)
  - [Load Unpacked Extension (Chrome / Edge / Brave)](#load-unpacked-extension-chrome--edge--brave)
  - [Build from Source](#build-from-source)
- [Privacy & Security Guarantee](#-privacy--security-guarantee)
- [Support & Sponsorship](#-support--sponsorship)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why SeenX?

Every day on X (Twitter), we scroll past incredible insights, technical deep dives, viral videos, and thought-provoking discussions. But in everyday browsing, we constantly run into the most frustrating pain point:

- ❌ **Forgot to bookmark great content**: Browsing X is a continuous reading flow. Most of the time, we simply forget—or find it too disruptive—to manually click the bookmark icon on every valuable post.
- ❌ **Impossible to find when you need it later**: Days or weeks later, when you urgently need to recall a brilliant point, a tool recommendation, or a technical guide, it has long been swallowed by the infinite feed. Searching keywords on X only surfaces irrelevant recent posts and ads, leaving what you actually read lost forever.
- ❌ **Native bookmarks become black holes**: Even when you do occasionally bookmark posts, X's native bookmark list lacks instant local full-text search or tagging. Once bookmarks pile up, finding a specific post is nearly impossible.
- ❌ **Posts get deleted or modified**: Authors delete tweets, go private, or take down long-form articles. If not archived, they vanish permanently.

**SeenX solves this effortlessly — "Captured Silently, Rediscovered Instantly"**:  
Just browse X as you normally do. SeenX automatically detects and silently saves the high-value posts you genuinely dwell on or interact with in the background. No manual saving required.  
**Whenever you want to find something later, just type whatever words or author handle you recall—and get the original post back in milliseconds!**

---

## 🛡️ Key Advantages

### 1. 100% Local-First Architecture
- **Persistent On-Device Storage**: All captured posts, rich media metadata, and inverted search indexes reside exclusively in your browser's built-in **IndexedDB**.
- **Zero Cloud Server Dependencies**: No central backend servers or intermediate databases. Search, read long-form articles, and review your historical timeline smoothly even with your network disconnected.
- **Your Data Remains Yours**: Immune to author deletions, account bans, or network outages. Everything you read becomes a permanent part of your personal digital knowledge base.

### 2. Zero Telemetry & Privacy-First
- **No Sign-Up, No Accounts Needed**: Install and go! No email, phone number, or Twitter OAuth account authorization required.
- **Strictly Zero Telemetry & Tracking**: **Zero tracking scripts, analytics SDKs, or crash telemetry reporters**. SeenX does not make a single outbound tracking call.
- **Minimal Host Permissions**: Permissions are strictly limited to `*://*.x.com/*` and `*://*.twitter.com/*`. No access to other tabs, websites, or personal browsing history.

### 3. 100% Free & Open Source
- **Permissive MIT License**: The complete codebase is open and transparent for anyone to inspect, audit, or contribute to.
- **No Commercial Shenanigans**: No subscription fees, no locked premium features (no paywalls), no in-app purchases, and no annoying sponsored ads. All powerful capabilities are free forever for everyone.

---

## ✨ Comprehensive Feature Matrix

### 1. Smart Noise-Free Capture
- **Viewport Dwell Filtering (Impression)**: Evaluates tweet intersection visibility and dwell duration ($\ge 1.5s$ by default) to automatically filter out fast-scrolling glance noise.
- **Instant Engagement Triggering**: Instantly captures posts when you click to expand, open detail pages, read long articles, or play videos without waiting for dwell timers.
- **Automatic Ad Filtering**: Silently detects and discards sponsored/promoted advertisements, keeping your archive pristine.

### 2. Lossless Multi-Format Content Preservation
- **Standard Tweets**: Preserves formatted text, high-res photos, timestamp, author avatar, handle, and engagement metrics.
- **X Articles & Long-form Posts**: Retains full article structures and provides an offline **Immersive Reader View** with custom font scaling and one-click Markdown copy.
- **Direct Video Stream URLs**: Saves high-bitrate MP4 URLs and posters; supports inline HTML5 playback directly inside your dashboard.
- **Thread & Discussion Aggregation**: Intelligently groups tweets sharing the same conversation, showing chronological context when browsing serialized threads.
- **Quote Tweets**: Preserves nested quoted tweets, media attachments, and original author references.

### 3. Sub-Millisecond Multilingual Full-Text Search
- Powered by an in-memory **MiniSearch** inverted index coupled with modern browser-native **`Intl.Segmenter`**.
- Seamless tokenization across **Chinese (word boundary segmentation), English, Japanese, numbers, and emojis** without bloated external dictionary downloads.
- Sub-millisecond response time with prefix matching, fuzzy matching, and author field weighting across tens of thousands of posts.

### 4. Reading Activity Heatmap & Insights
- **GitHub-Style Contribution Heatmap**: Visualizes your daily reading volume across years, quarters, and months, tracking your learning streaks.
- **Intraday Timeline Distribution**: Displays your hourly reading activity curve to reveal peak knowledge-absorption hours.
- **Click-to-Filter by Date**: Click any colored day tile on the calendar to instantly view all tweets captured on that specific date.

### 5. Aesthetic Shareable Cards Generator
- **Recap & Heatmap Visual Cards**: Generate high-aesthetic "Daily Recap" and "Activity Heatmap" summary cards with one click.
- **Multiple Color Themes**: Choose between GitHub Classic, Midnight Dark, Neon Cyber, and more.
- **Quick Export & Share**: Copy directly to clipboard or download as high-res PNGs to share on social feeds or paste into weekly notes.

### 6. Dual Workspaces: Side Panel & Full Dashboard
- **Companion Side Panel**: Browse recent captures and today's stats right beside your active X tab without losing your reading context.
- **Full-Screen Dashboard**: Comprehensive management tab featuring single/double column masonry layouts, favorites/starring, media filters (All / Starred / Media / Articles / Videos / Threads / Quotes), and author aggregations.

### 7. Data Sovereignty & Note App Export
- **Obsidian / Notion-Ready Markdown**: Automatically converts preserved tweets, author handles, timestamps, and media references into beautifully styled Markdown notes.
- **Complete JSON Archive**: Full snapshot of your entire IndexedDB database for cross-device migration, automated backup, or developer analysis with automatic deduplication.

### 8. Multilingual i18n & Dark Mode
- **Native Multilingual UI**: 10+ languages supported out of the box (English, 简体中文, 繁體中文, 日本語, 한국어, Français, Español, Deutsch, Português, Türkçe, العربية, Bahasa Indonesia).
- **First-Class Dark Theme**: Tailored to match X's dark mode aesthetic for comfortable late-night reading.

---

## ⚙️ Capture Modes & Sensitivity Rules

SeenX provides flexible forward-only capture settings (modifying rules only affects future browsing, never altering existing history):

| Setting | Options | Description |
| :--- | :--- | :--- |
| **Capture Mode** | `All-in-One (Default)` | Viewport dwell **+** clicks/engagements. Never miss any memorable tweet. |
| | `Minimal (Clicks Only)` | Skips passive scroll impressions; only records posts you actively click, expand, or play. |
| **Dwell Duration** | `1.0s` / `1.5s` / `2.0s` / `3.0s` | Required viewport dwell time before a post is captured. Increase if you scroll quickly. |
| **Filter Promoted Ads** | `Enabled` / `Disabled` | Automatically detects and drops sponsored posts from your capture stream. |
| **Data Retention** | `Permanent` / `30d` / `90d` / `180d` | Automatically prunes expired records or keeps them forever without limits. |

---

## 🛠️ Installation & Getting Started

### Load Unpacked Extension (Chrome / Edge / Brave)

1. Download the latest release package or build the project locally (see below).
2. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions`
   - **Microsoft Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (加载已解压的扩展程序).
5. Select the `dist/chrome-mv3` folder inside the project directory.
6. Pin **SeenX** to your browser toolbar. Visit [x.com](https://x.com) and start browsing!


### Build from Source

#### Prerequisites
- Node.js $\ge 18$
- `pnpm` (recommended), `npm`, or `yarn`

```bash
# 1. Clone the repository
git clone https://github.com/seenx-app/seenx.git
cd seenx

# 2. Install dependencies
pnpm install

# 3. Start development server with hot-reload
pnpm dev

# 4. Run test suite
pnpm test

# 5. Build production extension package
pnpm run build
```

Production output will be generated in `dist/chrome-mv3`.

---

## 🔒 Privacy & Security Guarantee

- 🛡️ **Zero Cloud Telemetry**: SeenX contains no analytics, no trackers, and no remote crash loggers.
- 🛡️ **Strict Host Permissions**: Permissions are strictly limited to `*://*.x.com/*` and `*://*.twitter.com/*` for data extraction. No broad web permissions are requested.
- 🛡️ **Isolated Storage**: All data remains inside your browser's IndexedDB.

---

## ☕ Support & Sponsorship

SeenX is an independent, free, and open-source project created with passion. If SeenX has helped you recover valuable ideas, saved you time, or served as a useful offline knowledge repository, consider supporting its ongoing maintenance!

<div align="center">

<a href="https://buymeacoffee.com/wildwind0" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200" />
</a>

<br/>

*Every coffee gives the creator immense encouragement to keep improving SeenX!*

</div>

---

## 🤝 Contributing

Contributions are warmly welcome! Whether you are reporting an issue, suggesting a feature, or writing code, please read our [**Contributing Guide**](CONTRIBUTING.md) to get started.

1. Fork the repo and create your branch: `git checkout -b feat/amazing-idea`
2. Run test suite: `pnpm test`
3. Ensure type safety: `pnpm run compile`
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to your branch and submit a Pull Request!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).  
Copyright © 2026 SeenX Contributors.
