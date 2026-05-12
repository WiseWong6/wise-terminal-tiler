import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Layers, Search } from 'lucide-react';
import { knowledgeTopics } from '@/data/knowledge';

export default function Knowledge() {
  return (
    <div>
      {/* ─── Header ─── */}
      <section className="border-b border-warm-200">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl font-bold text-warm-900 sm:text-5xl">
                Knowledge
              </h1>
              <p className="mt-4 text-base leading-relaxed text-warm-500">
                这里是「歪斯的 AI 见闻」的公开导航层。从 AI 产品、模型测评、Prompt/Skills、
                AI Coding 到效率工具，展示稳定主题和代表文章方向。
              </p>
            </div>

            <div className="rounded-2xl border border-warm-200 bg-warm-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-warm-900">当前策略</h2>
                  <p className="text-sm text-warm-500">精选主题索引，不做全文迁移。</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-warm-600">
                先公开主题入口，不搬空整个知识库。这能让网站先承载个人品牌和研究方向，
                同时保留未来升级为博客、知识库搜索或会员内容入口的空间。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Topic Grid ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {knowledgeTopics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="group rounded-2xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-6 transition-all hover:border-warm-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  {topic.category}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-warm-900 group-hover:text-amber-700 transition-colors">
                {topic.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-warm-500 line-clamp-2">
                {topic.description}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-warm-100 pt-4">
                <span className="text-xs text-warm-400">
                  {topic.articles.length} 篇文章方向
                </span>
                <ArrowRight className="h-4 w-4 text-warm-300 group-hover:text-amber-500 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── Article Directions ─── */}
      <section id="articles" className="scroll-mt-24 border-t border-warm-200">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-warm-900">文章方向</h2>
          <p className="mt-2 text-sm text-warm-500">
            每个主题下的代表文章方向，展示稳定输出领域。
          </p>

          <div className="mt-10 space-y-10">
            {knowledgeTopics.map((topic) => (
              <div key={topic.id} id={topic.id} className="scroll-mt-24">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-amber-600">{topic.category}</span>
                  <h3 className="text-xl font-bold text-warm-900">{topic.title}</h3>
                </div>
                <div className="mt-4 border-l-2 border-amber-400 pl-4">
                  <ul className="space-y-2">
                    {topic.articles.map((article) => (
                      <li key={article} className="flex items-start gap-2 text-sm text-warm-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        <span>{article}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-warm-400">
                    Obsidian: {topic.pathHint}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Future Upgrades ─── */}
      <section className="border-t border-warm-200">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-bold text-warm-900">未来可以升级成三种形态</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['精选文章页', '知识库搜索', '项目案例库'].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-4 transition-all hover:border-warm-300 hover:shadow-sm hover:-translate-y-0.5"
              >
                <Layers className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-sm font-semibold text-warm-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-warm-900 p-6 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">从知识入口继续看项目</h2>
            <p className="mt-2 text-sm text-warm-300">
              很多项目都来自这些长期主题：先有判断框架，再有可复用工具。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-warm-900 transition hover:bg-warm-100"
            >
              浏览 Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
