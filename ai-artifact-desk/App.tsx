import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Code, Coffee, Github, Layers, ArrowLeft, Home } from 'lucide-react';
import Editor from './components/Editor';
import ArtifactPreview from './components/ArtifactPreview';
import AboutModal from './components/AboutModal';
import { useDebounce } from './hooks/useDebounce';
import {
  SAMPLE_MERMAID,
  SAMPLE_MIXED,
  SAMPLE_JSON,
  SAMPLE_MARKDOWN,
  SAMPLE_HTML,
} from './constants';

const MIN_SIDEBAR_WIDTH = 280;
const DEFAULT_SIDEBAR_WIDTH = 420;

const App: React.FC = () => {
  const [code, setCode] = useState<string>(SAMPLE_MIXED);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return Math.max(MIN_SIDEBAR_WIDTH, Math.round(window.innerWidth * 0.35));
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);
  const [activeSample, setActiveSample] = useState<string>('Mixed');
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isMobileEditorCollapsed, setIsMobileEditorCollapsed] = useState(false);

  const ref = typeof document !== 'undefined' ? document.referrer : '';
  const host = typeof location !== 'undefined' ? location.hostname : '';
  const isInternal = ref && (ref.includes(host) || ref.includes('wisewong.com') || ref.includes('localhost'));
  const isInIframe = typeof window !== 'undefined' && window.parent !== window;
  const isFromMainSite = isInternal || isInIframe;
  const isDragging = useRef(false);
  const sampleMenuRef = useRef<HTMLDivElement>(null);

  const [debouncedCode, flushCode] = useDebounce(code, 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCollapsed = (!isMobile && sidebarWidth === 0) || (isMobile && isMobileEditorCollapsed);

  const toggleSidebar = useCallback(() => {
    setSidebarWidth(prev => prev === 0 ? DEFAULT_SIDEBAR_WIDTH : 0);
  }, []);

  const toggleMobileEditor = useCallback(() => {
    setIsMobileEditorCollapsed(prev => !prev);
  }, []);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth || DEFAULT_SIDEBAR_WIDTH;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth < MIN_SIDEBAR_WIDTH) {
        setSidebarWidth(0);
      } else {
        setSidebarWidth(newWidth);
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  const loadSample = (label: string, sample: string) => {
    setCode(sample);
    flushCode(sample);
    setActiveSample(label);
    setError(null);
    setIsSampleMenuOpen(false);
  };

  useEffect(() => {
    if (!isSampleMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(e.target as Node)) {
        setIsSampleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isSampleMenuOpen]);


  return (
    <div className="flex h-screen min-h-0 w-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center space-x-3">
          {(!isInIframe || isMobile) && (
            <a
              href={isFromMainSite ? '/' : 'https://www.wisewong.com/'}
              onClick={(e) => {
                if (isFromMainSite) {
                  e.preventDefault();
                  if (isInIframe) {
                    window.parent.postMessage({ type: 'close-tab' }, '*');
                  } else if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/';
                  }
                }
              }}
              title={isFromMainSite ? '返回' : '返回主站'}
              aria-label={isFromMainSite ? '返回' : '返回主站'}
              className="flex items-center justify-center w-8 h-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              {isFromMainSite ? <ArrowLeft size={18} /> : <Home size={18} />}
            </a>
          )}
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Code className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-slate-900 leading-tight">AI文档渲染</h1>
            <span className="text-[11px] text-slate-500 leading-tight mt-0.5">一个窗口解决html、markdown、mermaid、json渲染及复制问题</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block relative" ref={sampleMenuRef}>
            <button
              onClick={() => setIsSampleMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Layers size={14} />
              案例
            </button>

            {isSampleMenuOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                {[
                  ['Mixed', SAMPLE_MIXED],
                  ['Markdown', SAMPLE_MARKDOWN],
                  ['HTML', SAMPLE_HTML],
                  ['JSON', SAMPLE_JSON],
                  ['Mermaid', SAMPLE_MERMAID],
                ].map(([label, sample]) => (
                  <button
                    key={label}
                    onClick={() => loadSample(label, sample)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeSample === label
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href="https://github.com/WiseWong6/wise-labs/tree/main/ai-artifact-desk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            title="源码"
          >
            <Github size={14} />
            源码
          </a>

          <button
            onClick={() => setIsAboutOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
            title="关于"
          >
            <Coffee size={14} />
            关于
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row min-h-0 flex-1 overflow-hidden">
        <div
          className={`flex ${isMobile && isMobileEditorCollapsed ? 'h-0' : 'h-[45vh]'} md:h-full min-h-0 flex-shrink-0 flex-col overflow-hidden`}
          style={isMobile ? undefined : { width: isCollapsed ? 0 : sidebarWidth }}
        >
          <Editor
            value={code}
            onChange={setCode}
            error={error}
          />
        </div>

        {/* Drag handle */}
        <div
          className={`hidden md:block relative flex-shrink-0 w-1 group cursor-col-resize transition-colors ${
            isCollapsed ? 'bg-transparent' : 'bg-transparent hover:bg-indigo-400'
          }`}
          onMouseDown={startDrag}
        />

        <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-slate-50">
          <ArtifactPreview code={debouncedCode} onError={setError} isCollapsed={isCollapsed} isMobile={isMobile} onToggleSidebar={isMobile ? toggleMobileEditor : toggleSidebar} />
        </div>
      </main>

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export default App;