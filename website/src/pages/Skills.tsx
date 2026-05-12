import { useState } from 'react';
import { Puzzle, ExternalLink } from 'lucide-react';
import { skills, categories } from '@/data/skills';

const categoryColors: Record<string, string> = {
  '内容创作': 'bg-rose-50 text-rose-700 border-rose-200',
  'AI 工具': 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const filtered =
    activeCategory === '全部'
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Puzzle className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-serif text-4xl font-bold text-warm-900 sm:text-5xl">
            Wise Skills
          </h1>
          <p className="mt-1 text-sm text-warm-500">
            扩展 AI 助手能力的开源 Skills 集合
          </p>
        </div>
      </div>

      <p className="mt-8 text-base leading-relaxed text-warm-600">
        把飞书、提示词和内容创作等日常工作封装成可复用 Skills。
        面向 AI 助手，连接真实工作平台与个人工作流。
      </p>

      <a
        href="https://github.com/WiseWong6/wise-skills"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-warm-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-800"
      >
        GitHub 仓库 <ExternalLink className="h-4 w-4" />
      </a>

      {/* Categories */}
      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              activeCategory === cat
                ? 'border-warm-800 bg-warm-800 text-white'
                : 'border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {filtered.map((skill) => (
          <a
            key={skill.id}
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-2xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-5 transition-all hover:border-warm-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-warm-900 group-hover:text-amber-600 transition-colors">
                {skill.name}
              </h3>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  categoryColors[skill.category] || 'bg-warm-50 text-warm-500 border-warm-200'
                }`}
              >
                {skill.category}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-warm-500">{skill.description}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
              查看详情 <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-warm-400">该分类下暂无 Skills</div>
      )}
    </div>
  );
}
