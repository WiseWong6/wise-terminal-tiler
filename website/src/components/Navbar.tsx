import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const knowledgeItems = [
  { label: 'Article', path: '/knowledge#articles' },
  { label: 'Prompt', path: '/knowledge#prompt-skills' },
  { label: 'Skill', path: '/skills' },
];

function DirectoryLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  const isActive = (path: string) => {
    const [pathname, hash] = path.split('#');
    return location.pathname === pathname && (!hash || location.hash === `#${hash}`);
  };

  return (
    <nav className="space-y-2" aria-label="Directory links">
      <Link
        to="/projects"
        onClick={onNavigate}
        className={`block rounded-xl border-l-[3px] px-4 py-3 transition ${
          isActive('/projects')
            ? 'border-l-amber-500 bg-warm-100 text-warm-900'
            : 'border-l-transparent text-warm-700 hover:bg-warm-50 hover:text-warm-900'
        }`}
      >
        <span className="text-lg font-bold">Projects</span>
        <span className="mt-1 block text-xs leading-relaxed text-warm-500">开源工具、原型和知识产品。</span>
      </Link>

      <div className="rounded-xl px-4 py-3">
        <Link
          to="/knowledge"
          onClick={onNavigate}
          className={`block transition ${
            location.pathname === '/knowledge' ? 'text-warm-900' : 'text-warm-700 hover:text-warm-900'
          }`}
        >
          <span className="text-lg font-bold">Knowledge</span>
          <span className="mt-1 block text-xs leading-relaxed text-warm-500">文章、Prompt 和 Skills。</span>
        </Link>
        <div className="mt-3 space-y-1 border-l border-warm-200 pl-4">
          {knowledgeItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`block rounded-lg border-l-[3px] px-3 py-2 text-sm font-semibold transition ${
                isActive(item.path)
                  ? 'border-l-amber-500 bg-amber-50 text-amber-700'
                  : 'border-l-transparent text-warm-500 hover:bg-warm-50 hover:text-warm-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <Link
        to="/about"
        onClick={onNavigate}
        className={`block rounded-xl border-l-[3px] px-4 py-3 transition ${
          isActive('/about')
            ? 'border-l-amber-500 bg-warm-100 text-warm-900'
            : 'border-l-transparent text-warm-700 hover:bg-warm-50 hover:text-warm-900'
        }`}
      >
        <span className="text-lg font-bold">About</span>
        <span className="mt-1 block text-xs leading-relaxed text-warm-500">关于 Wise 和社交入口。</span>
      </Link>
    </nav>
  );
}

function SidebarShell({
  collapsed = false,
  onClose,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}) {
  if (collapsed) {
    return (
      <aside className="flex h-dvh flex-col items-center border-r border-warm-200 bg-warm-50 py-5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-warm-500 transition hover:bg-warm-100 hover:text-warm-900"
          aria-label="展开侧边栏"
          title="展开侧边栏"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5h12M7 10h9M10 15h6" strokeLinecap="round" />
          </svg>
        </button>
        <Link
          to="/"
          className="mt-5 [writing-mode:vertical-rl] font-serif text-lg font-bold tracking-tight text-warm-900"
          title="回到首页"
        >
          Wise
        </Link>
      </aside>
    );
  }

  return (
    <aside className="flex h-dvh flex-col border-r border-warm-200 bg-warm-50">
      <div className="border-b border-warm-200 px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/" onClick={onClose} className="font-serif text-2xl font-bold tracking-tight text-warm-900">
              Wise
            </Link>
            <p className="mt-1 text-xs text-warm-400">AI 工作流实验室</p>
          </div>
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded-lg p-2 text-warm-400 transition hover:bg-warm-100 hover:text-warm-900"
              aria-label="收起侧边栏"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M11 4 6 9l5 5M14 4 9 9l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-warm-400 transition hover:bg-warm-100 hover:text-warm-900"
              aria-label="关闭目录"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 5l8 8M13 5l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="mt-8 border-t border-warm-200 pt-7">
          <h2 className="text-base font-bold text-warm-900">About Me</h2>
          <p className="mt-3 text-sm leading-6 text-warm-600">
            AI 产品负责人，开源工作流工具作者。这里是我的项目、知识入口和长期写作索引。
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <DirectoryLinks onNavigate={onClose} />
      </div>

      <div className="border-t border-warm-200 bg-gradient-to-t from-warm-100/50 to-transparent px-6 py-5">
        <h2 className="text-base font-bold text-warm-900">Stay Connected</h2>
        <div className="mt-3 space-y-2 text-sm">
          <a
            href="https://github.com/WiseWong6"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-warm-600 transition hover:text-warm-900"
          >
            GitHub / WiseWong6
          </a>
          <a
            href="https://x.com/killthewhys"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-warm-600 transition hover:text-warm-900"
          >
            X / Twitter
          </a>
          <a
            href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-warm-600 transition hover:text-warm-900"
          >
            小红书
          </a>
        </div>
      </div>
    </aside>
  );
}

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('site-sidebar-collapsed', desktopCollapsed);
    return () => {
      document.documentElement.classList.remove('site-sidebar-collapsed');
    };
  }, [desktopCollapsed]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 hidden lg:block ${desktopCollapsed ? 'w-16' : 'w-72'}`}>
        <SidebarShell
          collapsed={desktopCollapsed}
          onToggleCollapse={() => setDesktopCollapsed((collapsed) => !collapsed)}
        />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-30 border-b border-warm-200 bg-warm-50/95 backdrop-blur lg:hidden">
        <div className="flex items-center px-4 py-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-warm-600 transition hover:border-warm-200 hover:bg-white/80 hover:text-warm-900"
            aria-expanded={sidebarOpen}
            aria-controls="site-sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 4h12M6 9h9M9 14h6" strokeLinecap="round" />
            </svg>
            <span>目录</span>
          </button>

          <Link to="/" className="ml-4 font-serif text-xl font-bold tracking-tight text-warm-900">
            Wise
          </Link>
        </div>
      </nav>

      {sidebarOpen && (
        <div id="site-sidebar" className="fixed inset-y-0 left-0 z-50 w-[min(86vw,360px)] shadow-2xl lg:hidden">
          <SidebarShell onClose={() => setSidebarOpen(false)} />
        </div>
      )}
    </>
  );
}
