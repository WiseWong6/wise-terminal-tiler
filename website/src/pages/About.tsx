import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code, Terminal } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const skills = [
  'AI 产品', '模型测评', 'Agent Workflow', 'Claude Skills',
  'React', 'TypeScript', 'Swift', 'Python', 'Lark API', 'Knowledge Base',
];

const timeline = [
  {
    year: '2025',
    title: 'Wise Skills',
    desc: '创建开源 Skills 集合，覆盖飞书、微信、内容创作等场景。',
    icon: BookOpen,
    color: 'text-amber-600 bg-amber-50',
  },
  {
    year: '2025',
    title: 'Terminal Tiler',
    desc: 'macOS 终端窗口平铺工具，支持 iTerm2 / Terminal / Ghostty。',
    icon: Terminal,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    year: '2024',
    title: 'Mixed Preview',
    desc: '混合内容实时预览编辑器，Markdown / Mermaid / JSON / HTML。',
    icon: Code,
    color: 'text-blue-600 bg-blue-50',
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
      <h1 className="font-serif text-4xl font-bold text-warm-900 sm:text-5xl">
        About
      </h1>

      {/* Bio */}
      <div className="mt-10 space-y-5 text-sm leading-7 text-warm-600">
        <p>
          Hi，我是 Wise。之前在腾讯，现在是上市港企的 AI 产品负责人。
        </p>
        <p>
          我的长期方向是把 AI 产品判断、知识系统、内容生产和开发工具做成可复用的工作流。
          每月持续测试最新 AI 产品，把筛选结果、产品判断和实战技巧写成内容，也把高频痛点做成工具。
        </p>
        <p>
          从 Mixed Preview 的混合内容预览，到 Terminal Tiler 的多终端窗口整理，
          再到 Wise Skills 的 AI 能力封装——内容和项目都来自同一个目标：让 AI 真正进入日常工作。
        </p>
      </div>

      {/* Skills */}
      <div className="mt-14">
        <h2 className="text-lg font-bold text-warm-900">主要领域</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-warm-200 bg-white px-3 py-1.5 text-sm text-warm-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-14">
        <h2 className="text-lg font-bold text-warm-900">开源历程</h2>
        <div className="mt-6 space-y-0">
          {timeline.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex gap-4">
                <div className="w-12 shrink-0 pt-1 text-right text-sm font-bold text-warm-400">
                  {item.year}
                </div>
                <div className="flex flex-col items-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-warm-200" />
                  )}
                </div>
                <div className={`pb-8 ${idx === timeline.length - 1 ? 'pb-0' : ''}`}>
                  <h3 className="font-bold text-warm-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-warm-500">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social + QR */}
      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-warm-900">找到我</h2>
          <p className="mt-2 text-sm text-warm-500">全网同名：@歪斯Wise</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://github.com/WiseWong6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-warm-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-800"
            >
              <GithubIcon /> GitHub
            </a>
            <a
              href="https://x.com/killthewhys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300"
            >
              X / Twitter
            </a>
            <a
              href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300"
            >
              小红书
            </a>
            <a
              href="https://www.douyin.com/user/MS4wLjABAAAAH9nnezGOIpAhJpVqxT-h6oqeL6IQduXj54YnE7vCi5Hm0UgUd8fvo8DdKAwbHOb5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300"
            >
              抖音
            </a>
          </div>

          <div className="mt-6">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
            >
              看看我的 Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-warm-200 bg-white p-6 text-center">
          <img
            src="/assets/wechat-wise-qr.jpg"
            alt="歪斯 Wise 公众号二维码"
            className="h-32 w-32 rounded-lg"
          />
          <p className="mt-3 text-sm font-semibold text-warm-800">公众号 / 歪斯 Wise</p>
          <p className="mt-1 text-xs text-warm-400">扫码继续看长期内容</p>
        </div>
      </div>
    </div>
  );
}
