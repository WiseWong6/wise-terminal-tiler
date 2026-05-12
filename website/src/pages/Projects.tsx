import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  ExternalLink,
  FileCode,
  LayoutGrid,
  Newspaper,
  Puzzle,
} from 'lucide-react';
import { projectCategories, projects, type Project, type ProjectStatus } from '@/data/projects';

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

function ProjectCard({ project }: { project: Project }) {
  const Icon = iconMap[project.icon] || FileCode;
  const primaryLink = project.path || project.links[0]?.href || '/projects';
  const isPrimaryExternal = primaryLink.startsWith('http');

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warm-100 text-warm-700">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[project.status]}`}>
          {project.status}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium text-warm-400">{project.category} / {project.stage}</p>
        <h2 className="mt-2 text-xl font-bold text-warm-900">{project.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-warm-500">{project.oneLiner}</p>
      </div>

      <div className="mt-5 rounded-lg bg-warm-50 p-4">
        <p className="text-xs font-semibold text-warm-400">解决的问题</p>
        <p className="mt-1.5 text-sm leading-relaxed text-warm-600">{project.problem}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-warm-200 bg-white px-2 py-1 text-xs text-warm-500">
            {tag}
          </span>
        ))}
      </div>
    </>
  );

  const className =
    'group block rounded-2xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-5 transition-all hover:border-warm-300 hover:shadow-md hover:-translate-y-0.5';

  if (isPrimaryExternal) {
    return (
      <a href={primaryLink} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link to={primaryLink} className={className}>
      {content}
    </Link>
  );
}

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<(typeof projectCategories)[number]>('全部');

  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => a.order - b.order);
    if (activeCategory === '全部') {
      return sorted;
    }
    return sorted.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-3xl">
          <h1 className="font-serif text-4xl font-bold text-warm-900 sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-base leading-relaxed text-warm-500">
            工具、原型和知识产品都在这里。来自同一条主线：把 AI 产品判断、内容生产、
            Agent 能力和个人工作流做成可复用系统。
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {projectCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? 'border-warm-800 bg-warm-800 text-white'
                  : 'border-warm-200 bg-white text-warm-500 hover:border-warm-300 hover:text-warm-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-warm-200 bg-gradient-to-b from-white to-warm-50/30 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-warm-900">想看源码和更新节奏？</h2>
              <p className="mt-1 text-sm text-warm-500">
                Wise Labs 和 Wise Skills 是当前最主要的公开项目入口。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/WiseWong6/wise-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-warm-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-800"
              >
                Wise Labs <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/WiseWong6/wise-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-warm-200 bg-white px-4 py-2.5 text-sm font-semibold text-warm-700 transition hover:border-warm-300"
              >
                Wise Skills <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
