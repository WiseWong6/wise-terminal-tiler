import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="text-center sm:text-left">
          <p className="text-sm text-warm-500">
            © {new Date().getFullYear()} Wise Wong
          </p>
          <p className="mt-1 text-xs text-warm-400">
            AI 工作流实验室：工具、知识产品和开源 Skills
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link to="/projects" className="text-sm text-warm-500 transition hover:text-warm-800">
            Projects
          </Link>
          <Link to="/knowledge" className="text-sm text-warm-500 transition hover:text-warm-800">
            Knowledge
          </Link>
          <Link to="/about" className="text-sm text-warm-500 transition hover:text-warm-800">
            About
          </Link>
          <a
            href="https://github.com/WiseWong6"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-warm-500 transition hover:text-warm-800"
          >
            GitHub
          </a>
          <a
            href="https://x.com/killthewhys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-warm-500 transition hover:text-warm-800"
          >
            X
          </a>
        </div>
      </div>
    </footer>
  );
}
