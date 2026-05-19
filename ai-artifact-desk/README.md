# AI Artifact Desk

<p align="center">
  <a href="./README.md">中文</a> | <a href="./README.en.md">English</a>
</p>

> AI 文档渲染工具：在一个编辑器里写 Markdown、Mermaid、JSON、HTML，右侧即时预览、复制和导出。

AI Artifact Desk 面向经常和 AI 生成内容打交道的人：模型输出里常常混着说明文字、JSON 配置、Mermaid 图表和 HTML 片段。这个工具把这些内容放回同一个工作台里，不用在 Markdown 预览、Mermaid Live、JSON Formatter 和浏览器之间来回切。

---

## 预览

左侧编辑，右侧实时渲染：

```text
┌──────────────────────────────────────────────────────┐
│  AI Artifact Desk                    案例  源码  关于 │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│   Editor     │   Preview                             │
│              │                                       │
│  # Hello     │   Hello                               │
│  ```mermaid  │   ┌───┐    ┌───┐                      │
│  graph LR    │   │ A │───→│ B │                      │
│    A --> B   │   └───┘    └───┘                      │
│  ```         │                                       │
│              │   复制富文本 / 复制图片 / 导出 HTML    │
│  ```json     │   ┌─────────────────┐                 │
│  {"a": 1}    │   │ { "a": 1 }       │                 │
│  ```         │   └─────────────────┘                 │
└──────────────┴───────────────────────────────────────┘
```

---

## 核心功能

- 实时预览：编辑内容后自动刷新，默认 600ms 防抖。
- 自动识别内容类型：支持 Markdown、纯 JSON、纯 Mermaid、完整 HTML 文档和混合内容。
- Mermaid 图表工作流：内置多类图表示例，支持懒渲染、独立缩放、SVG 下载和 PNG 下载。
- 一键复制：JSON 可复制格式化结果，Markdown/Mermaid 可复制富文本，Mermaid 可复制单图或多图图片，混合内容和 HTML 可复制截图。
- HTML 沙盒预览：完整 HTML 文档在 iframe 中渲染，样式隔离，并支持新窗口预览与导出 HTML 文件。
- 主题适配：支持亮色/暗色主题，嵌入主站时可接收父页面主题同步。
- 移动端适配：小屏下编辑器可折叠，工具栏按钮自动收敛为图标优先。

---

## 快速开始

```bash
git clone https://github.com/WiseWong6/wise-labs.git
cd wise-labs/ai-artifact-desk

npm install
npm run dev
# http://localhost:3000
```

---

## 它解决什么问题

写技术文档、提示词说明、方案草稿或 AI 输出验收时，内容经常不是单一格式：一段 Markdown 说明里夹着 JSON 配置、Mermaid 流程图，甚至一整段 HTML 原型。

传统工具通常只照顾其中一种格式：

| 方案 | 擅长什么 | 不方便之处 |
|------|----------|------------|
| mermaid.live | Mermaid 预览和导出 | 只能处理图，不能承载完整文档上下文 |
| Typora / StackEdit | Markdown 写作 | 对 JSON、完整 HTML、复杂 Mermaid 工作流支持有限 |
| JSON Formatter | JSON 格式化 | 只处理结构化数据，不能和说明文档混排 |
| CodePen / JSFiddle | HTML/CSS/JS 预览 | 更偏前端开发，不适合快速整理 AI 文档输出 |

AI Artifact Desk 的目标是把“看一眼是否渲染正确、复制到聊天/文档/PPT、导出给别人看”这条链路缩短。

---

## 支持的内容类型

### Markdown

支持 GitHub Flavored Markdown：表格、任务列表、删除线、代码块和语法高亮。Markdown 中可以混写原生 HTML。

### Mermaid

支持 Mermaid 11 的主流图表类型，包括 Flowchart、Sequence、Class、State、ER、Gantt、Pie、Journey、Mindmap、Timeline、Git Graph、C4、Quadrant、XYChart、Sankey、Treemap、Kanban、Architecture、Packet、Ishikawa 等。

每张 Mermaid 图都有独立的缩放控制和 SVG/PNG 下载按钮。预览区还提供“复制图片”，可把 Mermaid 图写入剪贴板，方便粘贴到文档、PPT 或聊天窗口。

### JSON

支持 JSON5：允许注释、尾随逗号和单引号。输入后会自动解析、格式化并高亮展示。

### HTML

当内容是完整 HTML 文档时，会在 iframe 沙盒中渲染。预览区支持新窗口打开、导出 HTML 文件和复制截图。

### 混合内容

Markdown 文档中的 Mermaid、JSON、HTML 片段会在同一预览区里一起呈现。复制富文本时会尽量保留布局与图表结果。

---

## 技术栈

| 依赖 | 用途 |
|------|------|
| React 19 | UI 框架 |
| Vite | 开发与构建 |
| Tailwind CSS v4 CLI | 构建时生成样式 |
| mermaid | 图表渲染 |
| react-markdown + remark-gfm + rehype-raw | Markdown 渲染 |
| react-syntax-highlighter | 代码高亮 |
| html2canvas | 截图与图片复制 |
| json5 | 宽松 JSON 解析 |
| lucide-react | 图标 |

---

## 开发

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm test             # 运行测试
npm run lint         # ESLint 检查
npm run build        # 生产构建
npm run preview      # 预览生产构建
```

---

## 边界

**它做**

- 混合渲染 Markdown、Mermaid、JSON 和 HTML。
- 把预览内容复制为文本、富文本、图片或截图。
- 导出 Mermaid 图和完整 HTML 文件。
- 在本地浏览器中运行，不需要账号。

**它不做**

- 不是多人协作编辑器。
- 不是文件管理器，当前只有一个编辑区。
- 不提供云端持久化存储。
- 不内置 AI API 调用或自动修复功能。

---

## 社交媒体

<div align="center">
  <p>全网同名：<code>@歪斯Wise</code></p>
  <p>
    <a href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73">小红书</a> /
    <a href="https://x.com/killthewhys">Twitter(X)</a> /
    扫码关注公众号
  </p>
  <img src="assets/wechat-wise-qr.jpg" alt="公众号歪斯二维码" width="220" />
</div>

---

## Star History

[![Star History Chart](https://api.star-history.com/image?repos=WiseWong6/wise-labs&type=Date)](https://www.star-history.com/#WiseWong6/wise-labs&Date)

---

## License

MIT License
