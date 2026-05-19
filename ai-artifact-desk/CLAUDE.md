# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build into ./dist
npm run preview      # Preview production build locally
npm run lint         # ESLint across all files
npm run format       # Prettier auto-format (.ts, .tsx, .json, .md, .css)
```

No test framework is configured.

## Project Architecture

**AI Artifact Desk** — 实时混排编辑器，支持 Markdown / JSON / HTML / Mermaid 在同一个编辑器中混合编写并即时预览。纯客户端 SPA，无后端。

### 核心架构

```
index.html → index.tsx → App.tsx
                           ├── Editor (左面板，textarea)
                           ├── ArtifactPreview (右面板，渲染引擎，2247 行)
                           │     ├── MermaidDiagram (通过 mermaid.render())
                           │     ├── JsonViewer (JSON5 解析 + 语法高亮)
                           │     ├── HtmlPreview (沙箱 iframe)
                           │     └── SyntaxHighlighter (Prism)
                           └── AboutModal (项目信息弹窗)
```

### 关键数据流

1. **Editor** 输入 → `code` state → **600ms debounce** (`useDebounce` hook) → `debouncedCode` → **ArtifactPreview**
2. `detectContentType()` 自动识别内容类型（markdown/json/html/mermaid/mixed）
3. `preprocessCode()` 将纯 JSON/HTML/Mermaid 自动包裹为 fenced code block
4. `react-markdown` 渲染时，自定义 `code` 组件按语言分发到对应子组件

### 重要文件

| 文件 | 行数 | 职责 |
|------|------|------|
| `App.tsx` | ~196 | 根组件：布局、状态、拖拽调整面板大小 |
| `components/ArtifactPreview.tsx` | ~2247 | 核心渲染引擎（最大的文件，包含多个内置子组件） |
| `components/Editor.tsx` | ~77 | 编辑面板（textarea + 复制/清空） |
| `components/ZoomableWrapper.tsx` | ~92 | CSS transform 缩放 + 拖拽平移容器 |
| `components/AboutModal.tsx` | ~124 | 关于弹窗 |
| `hooks/useDebounce.ts` | ~19 | 防抖 hook（含 flush 方法） |
| `constants.ts` | ~187 | 5 个内置示例内容 |

### 关键模式

- **内容类型检测**：`detectContentType()` 在 `ArtifactPreview.tsx` 中 — 通过首字符判定 JSON/Mermaid/HTML/Mixed/Markdown
- **混排渲染**：依赖 `react-markdown` 的自定义 `code` 组件分发（`preprocessCode` 确保纯内容也能走 fenced block 路径）
- **微信富文本复制**：`buildPreviewCopyPayload` → `copyRichHtml` 管道 — 克隆 DOM、内联样式、Mermaid SVG 转 PNG data URL、约束 677px 宽度
- **截图**：动态 `import('html2canvas')` 捕获预览区
- **缩放平移**：`ZoomableWrapper` 通过 CSS `transform: scale()` + 拖拽 scroll 实现

### 技术栈

React 19.2 / TypeScript 5.8 / Vite 6 / Tailwind CSS 3 (CDN) / react-markdown / mermaid 11 / lucide-react
