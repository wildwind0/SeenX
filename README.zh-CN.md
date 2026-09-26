<div align="center">

<img src="public/icon.svg" alt="SeenX Logo" width="80" height="80" />

# SeenX 🧭

**记录与找回你的每一个 X (Twitter) 优质瞬间**

一款**完全免费、100% 纯本地化、零云端依赖、极致隐私安全**的开源浏览器扩展。  
自动无感捕获你在 X 上停留浏览与交互过的图文、长文、视频与串推，毫秒级多语言全文检索，告别“想搜却找不到”、“原帖被删”的焦虑！

---

[English](README.md) · [简体中文](README.zh-CN.md)

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![100% Free](https://img.shields.io/badge/Price-100%25%20Free-brightgreen.svg?style=flat-square)](LICENSE)
[![Local-First](https://img.shields.io/badge/Storage-100%25%20Local--First-blue.svg?style=flat-square)](#-三大核心优势)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Telemetry-orange.svg?style=flat-square)](#-三大核心优势)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-emerald.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Framework: WXT](https://img.shields.io/badge/Framework-WXT-blueviolet.svg?style=flat-square)](https://wxt.dev/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-34%20passed-brightgreen.svg?style=flat-square)](tests/)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-FFDD00.svg?style=flat-square&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/wildwind0)

</div>

---

## 📑 目录

- [为什么需要 SeenX？](#-为什么需要-seenx)
- [三大核心优势（本地化、隐私、免费）](#-三大核心优势)
- [全功能矩阵](#-全功能矩阵)
  - [1. 智能防噪音捕获机制](#1-智能防噪音捕获机制)
  - [2. 全格式内容无损留存](#2-全格式内容无损留存)
  - [3. 毫秒级多语言全文检索](#3-毫秒级多语言全文检索)
  - [4. 阅读热力图与数据足迹洞察](#4-阅读热力图与数据足迹洞察)
  - [5. 精美社交分享卡片生成](#5-精美社交分享卡片生成)
  - [6. 侧边栏与全屏看板双工作台](#6-侧边栏与全屏看板双工作台)
  - [7. 数据自主权与双链笔记联动](#7-数据自主权与双链笔记联动)
  - [8. 国际化多语言与暗黑模式](#8-国际化多语言与暗黑模式)
- [捕获模式与敏感度规则](#-捕获模式与敏感度规则)
- [安装与快速上手](#-安装与快速上手)
  - [加载已解压扩展程序 (Chrome / Edge / Brave)](#加载已解压扩展程序-chrome--edge--brave)
  - [从源码构建](#从源码构建)
- [隐私与安全承诺](#-隐私与安全承诺)
- [支持与赞助 (Buy Me a Coffee)](#-支持与赞助-buy-me-a-coffee)
- [贡献指南](#-贡献指南)
- [开源许可证](#-开源许可证)

---

## 💡 为什么需要 SeenX？

在每天刷 X（Twitter）的过程中，我们常常偶遇各种充满洞见的推文、深度干货长文、高价值技术讨论或精选视频。然而现实中却始终伴随着最真实的痛点：

- ❌ **好内容当时往往忘记收藏**：刷推通常处于连续的阅读心流中，大多数时候我们根本不会、也经常忘记去随手点击书签保存。
- ❌ **下一次想找时彻底找不到**：几天或几周后，当你突然想引用某条推文、复盘某段深度观点或查找那个工具推荐时，它早已被无尽的信息流淹没。在 X 上用模糊词搜索，搜出来的全是无关的新推与广告，曾经读过的好内容就此石沉大海。
- ❌ **原生书签成了“信息黑洞”**：即使偶尔手动加了书签，X 原生书签缺乏高效的离线全文检索与分类能力，堆积上百条后依然难以重新翻出。
- ❌ **推文被原作者删除或下架**：推主删帖、锁推、长文撤下或账号异动后，未留存的内容将永久丢失。

**SeenX 彻底解决这一痛点 ——「无感自动留存，随时毫秒找回」**：  
你只需要像往常一样正常浏览 X，SeenX 会在后台静默判断并捕获你真正停留阅读或深度交互过的优质内容。无需任何手动收藏操作，推文正文、长文富文本、高清原图、原画视频直链与作者信息均已完整存入本地。  
**下一次需要时，只需在搜索框敲入记忆中的几个关键词，毫秒级瞬间找回原帖！**

---

## 🛡️ 三大核心优势

### 1. 纯本地化优先 (100% Local-First)
- **设备内持久化**：所有捕获的推文、多媒体元信息及搜索倒排索引全部存放在浏览器内置的 **IndexedDB** 数据库中。
- **无需连接任何外部服务器**：既没有托管云服务器，也没有中间商数据库。拔掉网线，离线状态下检索、阅读长文和查看足迹依然丝滑流畅。
- **数据永久归你所有**：不再受制于平台的删帖、封禁或网络波动，你看到的内容就是你私有数字资产的一部分。

### 2. 极致隐私与安全 (Zero Telemetry & Private)
- **免登录、零账号体系**：即装即用！不需要注册账号、不需要绑定手机邮箱、不需要授权 Twitter OAuth 访问令牌。
- **零遥测、零跟踪打点**：扩展内**不包含任何第三方跟踪 SDK、统计代码或错误日志回传服务器**，连一次网络外联都不会产生。
- **最小化权限控制**：扩展权限严格仅限定在 `*://*.x.com/*` 与 `*://*.twitter.com/*`，绝不申请或访问其他任何网页，保证浏览器环境绝对安全。

### 3. 100% 完全免费 & 开源透明 (Free & Open Source)
- **MIT 开源许可证**：完整代码公开透明，欢迎任何人审计、交流或贡献代码。
- **无任何商业套路**：没有订阅制收费、没有功能分级壁垒 (Paywall)、没有内购解锁，更不会插入恶心烦人的广告。所有强大功能面向所有人终身免费开放。

---

## ✨ 全功能矩阵

### 1. 智能防噪音捕获机制
- **视口有效停留判定 (Impression)**：结合推文在屏幕中的有效可视面积与停留时长（默认 $\ge 1.5s$），智能过滤飞速滚屏走马观花的瞬时噪音。
- **深度互动即刻捕获 (Engagement)**：当你点击进入推文详情、展开阅读长文全文、点击播放视频或展开回复时，无须等待停留，立即高精度无损留存。
- **推广广告自动过滤**：自动识别带有 Promoted / Sponsored / 推广 标记的赞助信息流，并在前端静默丢弃，绝不污染你的个人知识库。

### 2. 全格式内容无损留存
- **普通图文推文**：完整保留排版正文、高清原图配图、发布时间、推主头像、Handle 及互动指标。
- **X Article / 深度长文**：完整提取富文本段落与排版结构，提供沉浸式 **离线阅读器 (Reader View)**，支持字号无级缩放与 Markdown 格式一键复制。
- **原画视频直链播放**：智能抓取最高码率的 MP4 视频直链与海报封面，在看板中支持通过 HTML5 原生播放器无阻碍内嵌播放。
- **串推（Thread）脉络聚合**：自动识别 Conversation ID，按时间前后关系将同一讨论串推的所有内容串联成线，还原完整叙事逻辑。
- **引用推文（Quote）保真**：完整嵌套回溯被引用的原始推文、配图与作者元数据，脉络一清二楚。

### 3. 毫秒级多语言全文检索
- 采用轻量级内存倒排索引 **MiniSearch** 结合现代浏览器原生 **`Intl.Segmenter`** 分词引擎。
- 零外部庞大字典体积依赖，原生完美支持**中文（分词切分）、英文、日文、数字及 Emoji** 混合检索。
- 支持前缀实时联想、模糊容错检索、推主用户名及昵称权重加权，即使积累数万条历史，输入瞬间即可精准呈现结果。

### 4. 阅读热力图与数据足迹洞察
- **GitHub 风格足迹热力图**：直观展示年/季/月度每日阅读推文量分布，记录你的连续学习天数（Streak）。
- **24 小时阅读时段分布 (Intraday Timeline)**：清晰呈现全天各时间段的阅读活跃曲线，洞察自己的知识摄取习惯。
- **热力图按日下钻检索**：点击日历中任意一天的色块，即可秒级筛选出该自然日所浏览过的全部推文，轻松做每日复盘。

### 5. 精美社交分享卡片生成
- **高颜值生成器**：支持一键将「今日阅读总结 (Daily Recap)」或「活动热力图 (Heatmap)」渲染为设计感十足的分享卡片。
- **多种色彩主题**：内置 GitHub Classic、Midnight Dark、Neon Cyber 等多种主题自由切换。
- **快捷分享**：支持一键复制到剪贴板，或导出为高清 PNG 图片，方便分享到社交平台或贴入周报笔记。

### 6. 侧边栏与全屏看板双工作台
- **伴侣原生侧边栏 (Side Panel)**：边刷推边在屏幕右侧查看最新捕获与今日阅读统计，不打断推特主界面浏览心流。
- **全功能大屏看板 (Dashboard)**：全屏瀑布流（支持单列/双列切换），提供星标收藏置顶、时间范围筛选、推文类型过滤（全部/星标/图文/长文/视频/串推/引用）以及推主聚合视图。

### 7. 数据自主权与双链笔记联动
- **精排 Markdown 笔记导出**：将推文、推主、发布时间、高清媒体链接与正文一键转换为排版优美的 Markdown，完美无缝拖入 **Obsidian、Notion、Logseq** 等本地与云端知识库。
- **全量 JSON 数据备份与还原**：一键导出所有 IndexedDB 底层数据，支持随时在其他设备上导入恢复，自带去重逻辑，换机迁移零门槛。

### 8. 国际化多语言与暗黑模式
- **多语言原生支持**：内置 10+ 种主流语言（简体中文、繁体中文、English、日本語、한국어、Français、Español、Deutsch、Português、Türkçe、العربية、Bahasa Indonesia），设置中随心一键切换。
- **全生态暗黑模式**：完美契合 X 的深色护眼美学，夜间阅读更舒适。

---

## ⚙️ 捕获模式与敏感度规则

SeenX 提供了灵活的前向生效捕获规则设置（修改设置只对后续浏览生效，绝不破坏已有历史数据）：

| 设置项 | 可选值 | 说明 |
| :--- | :--- | :--- |
| **捕获运行模式** | `全能模式 (默认)` | 视口有效停留 **+** 点击/互动全记录，不遗漏任何有印象的优质内容。 |
| | `极简模式 (仅点击)` | 划过不记录，只记录你主动点击进入详情、展开长文或播放视频的推文。 |
| **停留时长阈值** | `1.0s` / `1.5s` / `2.0s` / `3.0s` | 推文在视口内停留达到该时长才会被记录，滑屏速度快可调大以过滤走马观花。 |
| **过滤推广广告** | `开启` / `关闭` | 自动识别并丢弃带有「Promoted / 推广」标记的信息流广告。 |
| **数据保留周期** | `永久` / `30天` / `90天` / `180天` | 超期自动清理历史记录，或永久无限制留存。 |

---

## 🛠️ 安装与快速上手

### 加载已解压扩展程序 (Chrome / Edge / Brave)

1. 从 Release 页面下载最新的安装包解压，或在本地从源码构建（见下文）；
2. 打开浏览器的扩展程序管理页面：
   - **Chrome**: 地址栏输入 `chrome://extensions`
   - **Microsoft Edge**: 地址栏输入 `edge://extensions`
   - **Brave**: 地址栏输入 `brave://extensions`
3. 开启右上角「**开发者模式**」开关；
4. 点击「**加载已解压的扩展程序 (Load unpacked)**」；
5. 在弹出的文件选择器中，选中项目目录下的 `dist/chrome-mv3` 文件夹；
6. 在浏览器扩展栏将 **SeenX** 图标固定；打开 [x.com](https://x.com) 即可像往常一样正常浏览！

### 从源码构建

#### 环境要求
- Node.js $\ge 18$
- `pnpm` (推荐), `npm` 或 `yarn`

```bash
# 1. 克隆代码仓库
git clone https://github.com/seenx-app/seenx.git
cd seenx

# 2. 安装项目依赖
pnpm install

# 3. 启动开发模式（支持热重载）
pnpm dev

# 4. 执行自动化测试
pnpm test

# 5. 构建生产扩展包
pnpm run build
```

构建生成的产物将位于 `dist/chrome-mv3` 目录下。

---

## 🔒 隐私与安全承诺

- 🛡️ **绝对零云端上报**：SeenX 没有部署任何后端服务器，无任何第三方数据分析或用户跟踪代码。
- 🛡️ **最小权限申请**：权限严格限定在 `*://*.x.com/*` 与 `*://*.twitter.com/*`，绝不申请或访问其他网站数据。
- 🛡️ **本地隔离存储**：所有推文与索引仅保留在您浏览器的 IndexedDB 数据库中，只有您自己能读取。

---

## ☕ 支持与赞助 (Buy Me a Coffee)

SeenX 是一款完全免费且开源的独立作品。如果您觉得 SeenX 帮您找回了重要的灵感、节省了翻找推文的时间，或者成了您离线知识库的重要一环，欢迎请作者喝杯咖啡，支持项目的持续维护与更新！

<div align="center">

<a href="https://buymeacoffee.com/wildwind0" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200" />
</a>

<br/>

*您的每一份赞赏，都是开源创作者持续打磨好产品的最大动力！*

</div>

---

## 🤝 贡献指南

我们非常欢迎社区的贡献！无论是提交 Bug 报告、提出功能想法还是提交代码，都欢迎参考 [**贡献指南 (CONTRIBUTING.md)**](CONTRIBUTING.md)。

1. Fork 本仓库并新建分支：`git checkout -b feat/my-feature`
2. 运行自动化测试：`pnpm test`
3. 检查 TypeScript 类型：`pnpm run compile`
4. 提交更改并附上清晰的 Commit 信息：`git commit -m 'feat: 增加自定义标签筛选'`
5. 推送到您的分支并创建 Pull Request！

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。  
Copyright © 2026 SeenX Contributors.
