import { Copy, Check, LayoutGrid, Keyboard, Monitor, Terminal } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Keyboard,
    title: '快捷键一键整理',
    desc: '默认 Ctrl+Cmd+T 即可将 2~10 个终端窗口自动排列成最优网格。',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: LayoutGrid,
    title: '全屏 / 分区模式',
    desc: '支持全屏平铺和左侧 1/2、1/3、1/4 分区模式，方便搭配浏览器使用。',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Monitor,
    title: '多显示器支持',
    desc: '自动按显示器分组，每个屏幕独立平铺，互不干扰。',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: Terminal,
    title: '跨终端混用',
    desc: '支持 iTerm2、Terminal、Ghostty 三种终端同时平铺。',
    color: 'text-violet-600 bg-violet-50',
  },
];

const layouts = [
  { windows: '2', layout: '2 × 1' },
  { windows: '3', layout: '3 × 1' },
  { windows: '4', layout: '2 × 2' },
  { windows: '5–6', layout: '3 × 2' },
  { windows: '7–8', layout: '4 × 2' },
  { windows: '9', layout: '3 × 3' },
  { windows: '10', layout: '4 × 3' },
];

const installCmd = 'curl -fsSL https://raw.githubusercontent.com/WiseWong6/wise-labs/main/terminal-tiler/scripts/install-agent-commands | bash';

export default function TerminalTiler() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <LayoutGrid className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-bold text-warm-900 sm:text-5xl">
            Terminal Tiler
          </h1>
          <p className="mt-1 text-sm text-warm-500">
            macOS 终端窗口平铺工具
          </p>
        </div>
      </div>

      <p className="mt-8 text-base leading-relaxed text-warm-600">
        一键整理散乱的 iTerm2、Terminal 和 Ghostty 终端窗口。
        为 Claude Code、Codex、OpenClaw 等多终端工作流设计。
      </p>

      <a
        href="https://github.com/WiseWong6/wise-labs/tree/main/terminal-tiler"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-warm-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-800"
      >
        GitHub 仓库
      </a>

      {/* Features */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-2xl border border-warm-200 bg-white p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-warm-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-warm-500">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Layout Matrix */}
      <div className="mt-14 rounded-2xl border border-warm-200 bg-white overflow-hidden">
        <div className="border-b border-warm-100 px-6 py-4">
          <h2 className="text-lg font-bold text-warm-900">布局矩阵</h2>
          <p className="mt-1 text-sm text-warm-500">根据窗口数量自动选择最优布局</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-50">
                <th className="px-6 py-3 text-left font-medium text-warm-500">窗口数量</th>
                <th className="px-6 py-3 text-left font-medium text-warm-500">布局</th>
              </tr>
            </thead>
            <tbody>
              {layouts.map((row) => (
                <tr key={row.windows} className="border-t border-warm-100">
                  <td className="px-6 py-3 font-medium text-warm-800">{row.windows}</td>
                  <td className="px-6 py-3 font-mono text-warm-600">{row.layout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Install */}
      <div className="mt-14 rounded-2xl bg-warm-900 p-6">
        <h2 className="text-lg font-bold text-white">快速安装</h2>
        <p className="mt-2 text-sm text-warm-300">
          在终端中运行以下命令，一键安装 Terminal Tiler 及其快捷键。
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-warm-800 p-4">
          <code className="flex-1 text-sm text-warm-200 font-mono break-all select-all">
            {installCmd}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-2 text-warm-400 transition hover:bg-warm-700 hover:text-white"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-14 text-center">
        <h2 className="text-lg font-bold text-warm-900">技术栈</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {['Swift', 'AppleScript', 'Shell', 'macOS Accessibility API'].map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-sm text-warm-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
