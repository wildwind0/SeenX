# Contributing to SeenX

Thank you for your interest in contributing to **SeenX**! 🧭

SeenX is built as a **100% local-first, zero-login, privacy-first open-source browser extension** for preserving and searching X (Twitter) browsing history. We welcome community contributions, bug reports, feature suggestions, and documentation improvements.

---

## 🧭 Core Principles

Before opening a PR or proposing a major change, please keep these non-negotiable principles in mind:

1. **Privacy & Zero Telemetry**: We never collect user data, track behavior, or make outgoing network requests to external tracking servers.
2. **Local-First Data Ownership**: All browsing history lives exclusively in the user's browser IndexedDB.
3. **Zero Login / Frictionless UX**: Users must never be required to register, log in, or pay to use core browsing history features.
4. **Resilience to X Changes**: The extension leverages non-invasive GraphQL response interception and robust fallback heuristics.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
- **Supported Browsers**: Chrome, Edge, Brave, or any Chromium-based browser supporting Manifest V3.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/seenx-app/seenx.git
   cd seenx
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development mode** (hot-reload enabled):
   ```bash
   pnpm dev
   ```

4. **Run the test suite**:
   ```bash
   pnpm test
   ```

5. **Typecheck & compile**:
   ```bash
   pnpm run compile
   ```

6. **Build for production**:
   ```bash
   pnpm run build
   ```
   The compiled unpacked extension will be generated in `dist/chrome-mv3`.

---

## 🧪 Testing Guidelines

- We use **Vitest** for unit and integration tests (`tests/`).
- Always write or update tests when modifying parser utilities, storage logic, search indexing, or export functions.
- Ensure all tests pass (`pnpm test`) and TypeScript compiles with zero errors (`pnpm run compile`) before submitting a pull request.

---

## 📐 Architecture & Standards

- **Extension Framework**: [WXT](https://wxt.dev/) with Manifest V3.
- **UI Framework**: React 18 + Tailwind CSS 3.4.
- **Icon Set**: `lucide-react`.
- **Search Engine**: In-memory `minisearch` with browser-native `Intl.Segmenter` for CJK and multilingual tokenization.
- **Storage Layer**: IndexedDB via `idb` wrapper.
- **Domain Modeling & ADRs**: Please consult [`CONTEXT.md`](CONTEXT.md) and [`docs/adr/`](docs/adr/) for architectural decisions and terminology.

---

## 🤝 Submitting a Pull Request

1. Fork the repository and create your branch from `master`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add support for custom keyword tags"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
4. Open a Pull Request on GitHub against the `master` branch.
5. Fill out the PR template with a summary of the change, test verification, and any relevant screenshots.

---

## 💬 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of background, gender, sexual orientation, disability, ethnicity, or religion. Please be respectful and constructive in all discussions.
