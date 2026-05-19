# AI Artifact Desk

<p align="center">
  <a href="./README.md">中文</a> | <a href="./README.en.md">English</a>
</p>

> A live rendering desk for AI-generated artifacts: write Markdown, Mermaid, JSON, and HTML in one editor, then preview, copy, and export from the same place.

AI Artifact Desk is built for the messy output real AI workflows produce: explanatory Markdown, JSON configs, Mermaid diagrams, and HTML snippets often arrive together. Instead of bouncing between a Markdown previewer, Mermaid Live, a JSON formatter, and a browser, you can inspect the whole artifact in one workspace.

---

## Preview

Edit on the left, render on the right:

```text
┌──────────────────────────────────────────────────────┐
│  AI Artifact Desk             Samples  Source  About │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│   Editor     │   Preview                             │
│              │                                       │
│  # Hello     │   Hello                               │
│  ```mermaid  │   ┌───┐    ┌───┐                      │
│  graph LR    │   │ A │───→│ B │                      │
│    A --> B   │   └───┘    └───┘                      │
│  ```         │                                       │
│              │   Copy rich text / Copy image / HTML  │
│  ```json     │   ┌─────────────────┐                 │
│  {"a": 1}    │   │ { "a": 1 }       │                 │
│  ```         │   └─────────────────┘                 │
└──────────────┴───────────────────────────────────────┘
```

---

## Highlights

- Live preview with a 600ms editing debounce.
- Automatic content detection for Markdown, raw JSON, raw Mermaid, full HTML documents, and mixed documents.
- Mermaid workflow with built-in samples, lazy rendering, per-diagram zoom controls, SVG download, and PNG download.
- One-click copy: formatted JSON, rich Markdown/Mermaid output, single or multiple Mermaid images, mixed-content screenshots, and HTML screenshots.
- Sandboxed HTML preview in an iframe, plus open-in-new-window and HTML file export.
- Theme support for light and dark mode, including parent-page theme sync when embedded.
- Mobile-friendly layout with a collapsible editor and icon-first toolbar actions.

---

## Quick Start

```bash
git clone https://github.com/WiseWong6/wise-labs.git
cd wise-labs/ai-artifact-desk

npm install
npm run dev
# http://localhost:3000
```

---

## What Problem It Solves

Technical docs, prompt notes, architecture sketches, and AI output reviews rarely stay in one format. A single artifact may contain Markdown explanations, JSON config, Mermaid diagrams, and a full HTML mockup.

Most tools are optimized for only one part of that job:

| Tool | Good at | Gap |
|------|---------|-----|
| mermaid.live | Mermaid preview and export | Diagram-only, without the surrounding document context |
| Typora / StackEdit | Markdown writing | Limited support for JSON, full HTML, and complex Mermaid workflows |
| JSON Formatter | Structured data formatting | No surrounding narrative or mixed-document preview |
| CodePen / JSFiddle | HTML/CSS/JS preview | Geared toward frontend development, not quick AI artifact review |

AI Artifact Desk shortens the loop from “paste AI output” to “verify the rendering” to “copy or export something usable.”

---

## Supported Content Types

### Markdown

GitHub Flavored Markdown is supported, including tables, task lists, strikethrough, fenced code blocks, and syntax highlighting. Raw HTML can be mixed into Markdown.

### Mermaid

Supports mainstream Mermaid 11 diagram types, including Flowchart, Sequence, Class, State, ER, Gantt, Pie, Journey, Mindmap, Timeline, Git Graph, C4, Quadrant, XYChart, Sankey, Treemap, Kanban, Architecture, Packet, and Ishikawa.

Each Mermaid diagram has independent zoom controls and SVG/PNG download buttons. The preview toolbar can also copy rendered Mermaid images to the clipboard for documents, slides, or chat apps.

### JSON

JSON5 is supported, including comments, trailing commas, and single quotes. Input is parsed, formatted, and syntax-highlighted automatically.

### HTML

Full HTML documents render in a sandboxed iframe. The preview toolbar supports opening the result in a new window, exporting an HTML file, and copying a screenshot.

### Mixed Documents

Mermaid, JSON, and HTML blocks inside Markdown render together in the same preview. Rich copy preserves as much layout and rendered diagram output as the browser allows.

---

## Tech Stack

| Dependency | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Development and build tooling |
| Tailwind CSS v4 CLI | Build-time CSS generation |
| mermaid | Diagram rendering |
| react-markdown + remark-gfm + rehype-raw | Markdown rendering |
| react-syntax-highlighter | Code highlighting |
| html2canvas | Screenshots and image copy |
| json5 | Lenient JSON parsing |
| lucide-react | Icons |

---

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start the dev server
npm test             # Run tests
npm run lint         # Run ESLint
npm run build        # Production build
npm run preview      # Preview the production build
```

---

## Scope

**It does**

- Render Markdown, Mermaid, JSON, and HTML together.
- Copy preview output as text, rich text, images, or screenshots.
- Export Mermaid diagrams and complete HTML files.
- Run locally in the browser without an account.

**It does not**

- It is not a collaborative editor.
- It is not a file manager; there is one editor pane.
- It does not provide cloud persistence.
- It does not include built-in AI API calls or automatic fixing.

---

## Social

<div align="center">
  <p><code>@歪斯Wise</code></p>
  <p>
    <a href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73">XiaoHongShu</a> /
    <a href="https://x.com/killthewhys">Twitter(X)</a> /
    WeChat Official Account
  </p>
  <img src="assets/wechat-wise-qr.jpg" alt="WeChat QR Code" width="220" />
</div>

---

## Star History

[![Star History Chart](https://api.star-history.com/image?repos=WiseWong6/wise-labs&type=Date)](https://www.star-history.com/#WiseWong6/wise-labs&Date)

---

## License

MIT License
