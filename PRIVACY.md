# Privacy Policy for SeenX

*Last updated: September 2026*

SeenX ("the Extension") is dedicated to protecting your privacy. This Privacy Policy outlines our strict adherence to user privacy and local-only data processing.

---

## English Version

### 1. 100% Local-First & Zero Data Collection
SeenX is designed from the ground up as a private, local-first utility:
- **No Cloud Synchronization**: SeenX does not operate any remote servers or databases for user data.
- **No Personal Data Collected**: We do not collect, store, transmit, sell, or share any personal identity information, accounts, browsing activity, or post content.
- **Zero Login Required**: The extension operates entirely without user registration, authentication, or third-party OAuth.

### 2. Local Storage
All captured data—including post texts, author details, timestamps, categories, media links, and full-text search indexes—are stored strictly within your browser's local storage (IndexedDB). This data resides exclusively on your device and is never transmitted externally.

### 3. No Third-Party Telemetry or Analytics
SeenX contains no third-party tracking scripts, telemetry tools, crash reporters, diagnostic beacons, or advertising SDKs. The extension does not initiate any background network requests to third-party endpoints.

### 4. Permissions & Justification
- **Host Permissions (`*://*.x.com/*`, `*://*.twitter.com/*`)**:
  Used solely to detect post impressions, parse structured post payloads, and monitor user reading interactions on X (Twitter) within the active tab.
- **`storage` & `unlimitedStorage`**:
  Used to persist your browsing history, custom capture preferences, and search indexes locally via IndexedDB.
- **`sidePanel`**:
  Used to render the companion side panel interface for rapid access to recent history while browsing.
- **`scripting`**:
  Used to initialize content scripts on existing X/Twitter tabs upon initial installation or extension updates.
- **`alarms`**:
  Used to schedule a periodic background task to automatically clean up browsing history exceeding your configured retention period.

### 5. Open Source Transparency
SeenX is open-source. Anyone can inspect and audit the source code to verify that all operations are performed locally on the user's machine without data exfiltration.

---

## 中文版（隐私权政策）

### 1. 100% 纯本地运行与零数据收集
SeenX 遵循严格的隐私保护原则与“本地优先”（Local-First）架构：
- **无云端同步**：SeenX 不架设任何用于存储用户数据的远程服务器或后端数据库。
- **不收集个人信息**：我们不会收集、存储、上传、出售或共享用户的任何个人身份信息、账号密码、浏览记录或推文内容。
- **免登录即用**：插件无需注册账号、无需登录，即装即用。

### 2. 仅在本地存储数据
插件捕获并存储的所有数据（包括帖子文本、作者信息、浏览时间戳、分类标签、多媒体预览与全文检索索引），均完整保存在您当前浏览器的本地数据库（IndexedDB）中。所有数据仅存在于您的个人设备上，绝不会被传出。

### 3. 绝无第三方追踪与遥测
SeenX 代码中不包含任何第三方跟踪脚本、埋点代码、遥测分析工具或广告 SDK。插件不会主动向任何第三方服务器发起数据回传请求。

### 4. 权限使用说明
- **主机权限（`*://*.x.com/*`, `*://*.twitter.com/*`）**：仅用于在用户浏览 X (Twitter) 网页时识别帖子可见性、解析结构化内容并在本地建立索引。
- **`storage` 与 `unlimitedStorage`**：用于在用户本地安全持久化保存浏览历史与检索索引。
- **`sidePanel`**：用于在浏览器侧边栏呈现最近历史记录与轻量搜索面板。
- **`scripting`**：用于在扩展初次安装或更新时，向已打开的 X 页面注入抓取脚本，无需用户重启浏览器。
- **`alarms`**：用于在后台执行定时清理任务，根据用户设置的保留天数自动清除过期历史。

### 5. 开源与透明度
SeenX 属于开源项目，源代码完全公开。任何人均可查阅并审计代码，确保所有处理逻辑均在本地完成，绝无隐式网络上传行为。

---

## 6. Contact / 联系方式
If you have any questions or concerns regarding this Privacy Policy, please open an issue in the project repository.  
如有任何关于本隐私权政策的疑问或建议，欢迎在项目代码仓库中提交 Issue。
