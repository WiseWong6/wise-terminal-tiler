import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ExternalLink,
  FileCode,
  LayoutGrid,
  Newspaper,
  Puzzle,
} from 'lucide-react';
import { featuredProjects, type ProjectStatus } from '@/data/projects';
import { knowledgeTopics } from '@/data/knowledge';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileCode,
  LayoutGrid,
  Puzzle,
  Newspaper,
  BrainCircuit,
  BookOpen,
};

const statusStyles: Record<ProjectStatus, string> = {
  'Open Source': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Prototype: 'border-amber-200 bg-amber-50 text-amber-700',
  'Coming Soon': 'border-slate-200 bg-slate-100 text-slate-500',
};

export default function Home() {
  return (
    <div>
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.12),transparent)]">
        <section className="relative mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:px-6 lg:pb-16 lg:pt-24">
          <h1 className="font-serif text-5xl font-black tracking-tight bg-gradient-to-r from-warm-900 via-warm-700 to-amber-700 bg-clip-text text-transparent sm:text-6xl lg:text-7xl">
            歪斯 Wise
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-warm-500 sm:text-xl">
            AI 产品负责人 · 开源工作流工具作者
          </p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-warm-400">
            前腾讯，现上市港企 AI 产品负责人。长期输出 AI 产品测评、工作流工具和开源 Skills。
          </p>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs">
            <span>
              <strong className="font-serif text-base font-bold text-amber-600">500w+</strong>{' '}
              <span className="text-warm-400">阅读</span>
            </span>
            <span className="text-warm-300">·</span>
            <span className="font-semibold text-warm-500">腾讯技术影响力奖</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-warm-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-warm-800"
            >
              浏览 Projects <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-5 py-3 text-sm font-semibold text-warm-700 transition hover:border-warm-300 hover:text-warm-900"
            >
              精选知识 <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* ─── Featured Projects ─── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl font-bold text-warm-900 sm:text-4xl">
              Featured Projects
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-warm-500">
              项目不分新旧，统一看它解决什么问题。
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
          >
            查看全部 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredProjects.map((project, index) => {
            const Icon = iconMap[project.icon] || FileCode;
            const target = project.path || '/projects';
            const isFirst = index === 0;

            return (
              <Link
                key={project.id}
                to={target}
                className={`group rounded-2xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-5 transition-all hover:border-warm-300 hover:shadow-md hover:-translate-y-0.5 ${
                  isFirst ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-100 text-warm-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>

                {isFirst && project.id === 'mixed-preview' ? (
                  <>
                    <h3 className="mt-5 text-xl font-bold text-warm-900 group-hover:text-amber-600">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-warm-500">{project.oneLiner}</p>
                    <p className="mt-4 rounded-lg bg-warm-50 p-4 text-xs leading-relaxed text-warm-600">
                      {project.problem}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-warm-200 bg-white px-2 py-1 text-xs text-warm-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mt-5 text-lg font-bold text-warm-900 group-hover:text-amber-600">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-warm-500">{project.oneLiner}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-warm-200 bg-warm-50 px-2 py-1 text-xs text-warm-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-warm-200 to-transparent" />

      {/* ─── Selected Knowledge ─── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-3xl font-bold text-warm-900 sm:text-4xl">
                Knowledge
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-warm-500">
                「歪斯的 AI 见闻」精选主题入口。先展示研究方向，不搬空整个知识库。
              </p>
            </div>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
            >
              进入 Knowledge <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 max-w-3xl divide-y divide-warm-100">
            {knowledgeTopics.slice(0, 5).map((topic) => (
              <Link
                key={topic.id}
                to="/knowledge"
                className="group flex items-start gap-6 px-4 py-5 transition hover:bg-warm-50 sm:px-6"
              >
                <span className="shrink-0 pt-0.5 text-xs font-semibold text-amber-600 min-w-[5rem]">
                  {topic.category}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-warm-900 group-hover:text-amber-700">
                    {topic.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-warm-500 line-clamp-2">
                    {topic.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-warm-300 group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
            <Link
              to="/knowledge"
              className="group flex items-center gap-2 px-4 py-5 text-sm font-semibold text-warm-400 transition hover:bg-warm-50 hover:text-warm-600 sm:px-6"
            >
              更多主题（效率工具 · AI Coding 实践）
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-warm-200 to-transparent" />

      {/* ─── About ─── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-warm-900 sm:text-4xl">
              About
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-warm-600">
              我每月持续测试最新 AI 产品，把筛选结果、产品判断和实战技巧写成内容，
              也把自己的高频工作流做成工具。这个网站是一个公开入口：你可以从项目看到工具，
              从知识主题看到判断框架，从社交平台继续追踪更新。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/WiseWong6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-warm-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-800"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://x.com/killthewhys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300 hover:text-warm-900"
              >
                X / Twitter <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300 hover:text-warm-900"
              >
                小红书 <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.douyin.com/user/MS4wLjABAAAAH9nnezGOIpAhJpVqxT-h6oqeL6IQduXj54YnE7vCi5Hm0UgUd8fvo8DdKAwbHOb5"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300 hover:text-warm-900"
              >
                抖音 <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 lg:items-end">
            <img
              src="/assets/wechat-wise-qr.jpg"
              alt="歪斯 Wise 公众号二维码"
              className="h-44 w-44 rounded-2xl object-cover"
            />
            <p className="text-center text-xs text-warm-400 lg:text-right">
              公众号 / 歪斯 Wise
              <br />
              扫码继续看长期内容
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
