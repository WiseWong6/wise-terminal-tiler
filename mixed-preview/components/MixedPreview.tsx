import React, { useEffect, useRef, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import {
  Download,
  Image as ImageIcon,
  Copy,
  Check,
  PanelLeftOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Camera,
} from 'lucide-react';
import ZoomableWrapper from './ZoomableWrapper';
import JSON5 from 'json5';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
});

interface MixedPreviewProps {
  code: string;
  onError: (error: string | null) => void;
  isCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

// Reusable zoom controls
const ZoomControls: React.FC<{
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit?: () => void;
}> = ({ scale, onZoomIn, onZoomOut, onReset, onFit }) => (
  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md px-2 py-1.5">
    <button
      onClick={onZoomIn}
      disabled={scale >= 3}
      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors text-black"
      title="放大"
    >
      <ZoomIn size={14} />
    </button>
    <button
      onClick={onZoomOut}
      disabled={scale <= 0.5}
      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 transition-colors text-black"
      title="缩小"
    >
      <ZoomOut size={14} />
    </button>
    <button
      onClick={onReset}
      className="p-1 rounded hover:bg-slate-100 transition-colors text-black"
      title="重置"
    >
      <RotateCcw size={12} />
    </button>
    {onFit && (
      <button
        onClick={onFit}
        className="p-1 rounded hover:bg-slate-100 transition-colors text-black"
        title="适配"
      >
        <Maximize2 size={12} />
      </button>
    )}
    <span className="text-xs text-black font-mono min-w-[36px] text-center">
      {Math.round(scale * 100)}%
    </span>
  </div>
);

const useZoom = () => {
  const [scale, setScale] = useState(1);
  const clamp = (v: number) => Math.max(0.5, Math.min(3, v));
  return {
    scale,
    zoomIn: () => setScale((s) => clamp(s + 0.1)),
    zoomOut: () => setScale((s) => clamp(s - 0.1)),
    reset: () => setScale(1),
    setScale: (v: number) => setScale(clamp(v)),
  };
};

type ContentType = 'markdown' | 'json' | 'html' | 'mermaid' | 'mixed';

type CopyPayload = {
  html: string;
  plain: string;
  hasEmbeddedImages?: boolean;
};

const WECHAT_ARTICLE_WIDTH = 677;

const COPY_STYLE_PROPS = [
  'display',
  'box-sizing',
  'max-width',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'background',
  'background-color',
  'color',
  'font',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'line-height',
  'text-align',
  'text-decoration',
  'text-transform',
  'white-space',
  'word-break',
  'overflow-wrap',
  'vertical-align',
  'list-style',
  'list-style-type',
  'border-collapse',
  'table-layout',
  'box-shadow',
] as const;

const FLOW_TEXT_TAGS = new Set([
  'article',
  'section',
  'div',
  'p',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'strong',
  'em',
  'code',
]);

const RESPONSIVE_MEDIA_TAGS = new Set(['img', 'svg', 'canvas', 'video']);

const getReadableText = (element: HTMLElement) =>
  (element.innerText || element.textContent || '').replace(/\n{3,}/g, '\n\n').trim();

const appendInlineStyles = (source: Element, target: Element) => {
  const view = source.ownerDocument.defaultView;
  const computedStyle = view?.getComputedStyle(source);
  const targetStyle = (target as HTMLElement | SVGElement).style;

  if (computedStyle && targetStyle) {
    COPY_STYLE_PROPS.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'auto' && value !== 'normal' && value !== 'none') {
        targetStyle.setProperty(prop, value);
      }
    });
  }

  Array.from(source.childNodes).forEach((sourceChild, index) => {
    const targetChild = target.childNodes[index];
    if (sourceChild instanceof Element && targetChild instanceof Element) {
      appendInlineStyles(sourceChild, targetChild);
    }
  });
};

const cleanupPortableHtml = (root: HTMLElement) => {
  root.querySelectorAll('[data-copy-remove="true"], script').forEach((element) => {
    element.remove();
  });

  root.querySelectorAll<HTMLElement>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-copy-')) {
        element.removeAttribute(attr.name);
      }
    });
    element.removeAttribute('class');
    element.removeAttribute('contenteditable');

    const tagName = element.tagName.toLowerCase();

    if (FLOW_TEXT_TAGS.has(tagName)) {
      element.style.removeProperty('width');
      element.style.removeProperty('min-width');
      element.style.removeProperty('height');
      element.style.removeProperty('min-height');
      element.style.removeProperty('max-height');
      element.style.removeProperty('overflow');
      element.style.removeProperty('overflow-x');
      element.style.removeProperty('overflow-y');
    }

    if (RESPONSIVE_MEDIA_TAGS.has(tagName)) {
      element.removeAttribute('width');
      element.removeAttribute('height');
      element.style.setProperty('display', 'block');
      element.style.setProperty('width', '100%');
      element.style.setProperty('max-width', '100%');
      element.style.setProperty('height', 'auto');
      element.style.setProperty('margin', '16px auto');
      element.style.setProperty('border', '0');
      element.style.setProperty('vertical-align', 'top');
    }

    if (tagName === 'table') {
      element.style.setProperty('width', '100%');
      element.style.setProperty('max-width', '100%');
      element.style.setProperty('border-collapse', 'collapse');
      element.style.setProperty('table-layout', 'auto');
    }

    if (tagName === 'pre') {
      element.style.removeProperty('height');
      element.style.removeProperty('max-height');
      element.style.setProperty('max-width', '100%');
      element.style.setProperty('white-space', 'pre-wrap');
      element.style.setProperty('word-break', 'break-word');
      element.style.setProperty('overflow-wrap', 'anywhere');
    }
  });
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });

const copyPlainText = async (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  try {
    await navigator.clipboard.writeText(trimmed);
    return;
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to selection copy:', err);
  }

  const textarea = document.createElement('textarea');
  textarea.value = trimmed;
  textarea.setAttribute('readonly', 'true');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('document.execCommand("copy") returned false');
    }
  } finally {
    document.body.removeChild(textarea);
  }
};

const copyRichHtmlViaSelection = (html: string) => {
  const selection = window.getSelection();
  const savedRanges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index).cloneRange(),
      )
    : [];
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  tempContainer.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${WECHAT_ARTICLE_WIDTH}px`,
    'background:#ffffff',
    'color:#1f2937',
    'z-index:-1',
  ].join(';');

  document.body.appendChild(tempContainer);

  try {
    const range = document.createRange();
    range.selectNodeContents(tempContainer);
    selection?.removeAllRanges();
    selection?.addRange(range);

    if (!document.execCommand('copy')) {
      throw new Error('document.execCommand("copy") returned false');
    }
  } finally {
    selection?.removeAllRanges();
    savedRanges.forEach((range) => selection?.addRange(range));
    document.body.removeChild(tempContainer);
  }
};

const copyRichHtml = async (
  html: string,
  plain: string,
  options: { preferSelection?: boolean } = {},
) => {
  if (!html.trim()) return;

  let clipboardError: unknown = null;
  if (
    !options.preferSelection &&
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard?.write
  ) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch (err) {
      clipboardError = err;
      console.warn('navigator.clipboard.write failed, falling back to selection copy:', err);
    }
  }

  try {
    copyRichHtmlViaSelection(html);
  } catch (fallbackError) {
    if (clipboardError) {
      console.error('Clipboard rich copy failed before fallback:', clipboardError);
    }
    throw fallbackError;
  }
};

const detectContentType = (rawCode: string): ContentType => {
  const trimmed = rawCode.trim();
  if (!trimmed) return 'markdown';

  // Pure JSON
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON5.parse(trimmed);
      return 'json';
    } catch {
      // fall through
    }
  }

  // Pure HTML
  if (
    trimmed.toLowerCase().startsWith('<!doctype html>') ||
    trimmed.toLowerCase().startsWith('<html')
  ) {
    return 'html';
  }

  // Pure Mermaid
  const mermaidKeywords = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'erDiagram',
    'gantt',
    'pie',
    'journey',
    'mindmap',
    'timeline',
    'gitGraph',
  ];
  const firstWord = trimmed.split(/\s+/)[0];
  if (mermaidKeywords.includes(firstWord)) {
    return 'mermaid';
  }

  // Mixed: contains two or more code blocks
  const codeBlockMatches = trimmed.match(/```[a-zA-Z]/g);
  if (codeBlockMatches && codeBlockMatches.length >= 2) {
    return 'mixed';
  }

  return 'markdown';
};

// Convert SVG string to PNG Blob for clipboard
const svgToPngBlob = (svgContent: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.documentElement;
    svgEl.removeAttribute('style');

    const viewBox = svgEl.getAttribute('viewBox');
    let nativeWidth = 0;
    let nativeHeight = 0;
    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).filter(Boolean);
      if (parts.length >= 4) {
        nativeWidth = parseFloat(parts[2]);
        nativeHeight = parseFloat(parts[3]);
      }
    }
    if (!nativeWidth) nativeWidth = parseFloat(svgEl.getAttribute('width') || '0');
    if (!nativeHeight) nativeHeight = parseFloat(svgEl.getAttribute('height') || '0');
    if (nativeWidth && nativeHeight) {
      svgEl.setAttribute('width', nativeWidth.toString());
      svgEl.setAttribute('height', nativeHeight.toString());
    }

    const serializer = new XMLSerializer();
    const newSvgString = serializer.serializeToString(svgEl);

    const img = new Image();
    const svg64 = btoa(unescape(encodeURIComponent(newSvgString)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('Timed out while rendering SVG image'));
    }, 5000);

    img.onload = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      const canvas = document.createElement('canvas');
      const targetWidth = 2500;
      let scale = 3;
      if (img.width < targetWidth) {
        scale = targetWidth / img.width;
      }
      scale = Math.min(scale, 10);
      canvas.width = Math.ceil(img.width * scale);
      canvas.height = Math.ceil(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(new Error('Failed to load SVG image'));
    };
    img.src = image64;
  });
};

const createResponsiveImageHtml = (src: string, alt: string) =>
  `<img src="${src}" alt="${alt}" style="display:block;width:100%;max-width:${WECHAT_ARTICLE_WIDTH}px;height:auto;margin:16px auto;border:0;vertical-align:top;" />`;

const replaceMermaidBlocksWithImages = async (root: HTMLElement) => {
  const mermaidBlocks = Array.from(
    root.querySelectorAll<HTMLElement>('[data-copy-role="mermaid-block"]'),
  );
  let convertedCount = 0;
  let failedCount = 0;

  await Promise.all(
    mermaidBlocks.map(async (block) => {
      const svg = Array.from(block.querySelectorAll('svg')).find(
        (svg) => !svg.closest('[data-copy-remove="true"]'),
      );
      if (!svg) return;

      try {
        const blob = await svgToPngBlob(svg.outerHTML);
        const imageUrl = await blobToDataUrl(blob);
        block.innerHTML = createResponsiveImageHtml(imageUrl, 'Mermaid diagram');
        convertedCount++;
      } catch (err) {
        console.warn('Failed to convert Mermaid SVG for rich copy:', err);
        failedCount++;
      }
    }),
  );

  if (failedCount > 0) {
    throw new Error('Failed to convert Mermaid diagram to image for rich copy');
  }

  return convertedCount > 0;
};

const getMermaidSvgs = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<SVGElement>('[data-copy-role="mermaid-block"] svg')).filter(
    (svg) => !svg.closest('[data-copy-remove="true"]'),
  );

const buildMermaidImagesPayload = async (sourceRoot: HTMLElement): Promise<CopyPayload> => {
  const svgs = getMermaidSvgs(sourceRoot);
  if (svgs.length === 0) {
    throw new Error('No Mermaid diagrams are ready to copy');
  }

  const imageHtml = await Promise.all(
    svgs.map(async (svg, index) => {
      const blob = await svgToPngBlob(svg.outerHTML);
      const imageUrl = await blobToDataUrl(blob);
      return createResponsiveImageHtml(imageUrl, `Mermaid diagram ${index + 1}`);
    }),
  );

  const wrapper = document.createElement('section');
  wrapper.style.cssText = [
    `max-width:${WECHAT_ARTICLE_WIDTH}px`,
    'margin:0 auto',
    'box-sizing:border-box',
    'background:#ffffff',
  ].join(';');
  wrapper.innerHTML = imageHtml.join('');

  return {
    html: wrapper.outerHTML,
    plain: svgs.length === 1 ? 'Mermaid diagram' : `Mermaid diagrams (${svgs.length})`,
    hasEmbeddedImages: true,
  };
};

const expandHtmlPreviews = (sourceRoot: HTMLElement, cloneRoot: HTMLElement) => {
  const sourceFrames = Array.from(
    sourceRoot.querySelectorAll<HTMLIFrameElement>('[data-copy-role="html-preview"] iframe'),
  );
  const cloneFrames = Array.from(
    cloneRoot.querySelectorAll<HTMLIFrameElement>('[data-copy-role="html-preview"] iframe'),
  );

  sourceFrames.forEach((sourceFrame, index) => {
    const cloneFrame = cloneFrames[index];
    const frameBody = sourceFrame.contentDocument?.body;
    if (!cloneFrame || !frameBody) return;

    const bodyClone = frameBody.cloneNode(true) as HTMLElement;
    appendInlineStyles(frameBody, bodyClone);

    const replacement = document.createElement('section');
    const bodyStyle = bodyClone.getAttribute('style');
    replacement.style.cssText = bodyStyle ? `${bodyStyle};margin:16px 0;` : 'margin:16px 0;';
    while (bodyClone.firstChild) {
      replacement.appendChild(bodyClone.firstChild);
    }

    const copyBlock = cloneFrame.closest('[data-copy-role="html-preview"]');
    copyBlock?.replaceWith(replacement);
  });
};

const wrapArticleHtml = (html: string, source: HTMLElement) => {
  const computedStyle = window.getComputedStyle(source);
  const wrapper = document.createElement('section');
  wrapper.style.cssText = [
    `max-width:${WECHAT_ARTICLE_WIDTH}px`,
    'margin:0 auto',
    'box-sizing:border-box',
    `color:${computedStyle.color}`,
    `font-family:${computedStyle.fontFamily}`,
    `font-size:${computedStyle.fontSize}`,
    `line-height:${computedStyle.lineHeight}`,
    'background:#ffffff',
  ].join(';');
  wrapper.innerHTML = html;
  return wrapper.outerHTML;
};

const buildPreviewCopyPayload = async (sourceRoot: HTMLElement): Promise<CopyPayload> => {
  const clone = sourceRoot.cloneNode(true) as HTMLElement;
  appendInlineStyles(sourceRoot, clone);
  expandHtmlPreviews(sourceRoot, clone);
  const hasEmbeddedImages = await replaceMermaidBlocksWithImages(clone);
  cleanupPortableHtml(clone);

  return {
    html: wrapArticleHtml(clone.innerHTML, sourceRoot),
    plain: getReadableText(clone),
    hasEmbeddedImages,
  };
};

const buildIframeCopyPayload = (doc: Document): CopyPayload => {
  const body = doc.body;
  const bodyClone = body.cloneNode(true) as HTMLElement;
  appendInlineStyles(body, bodyClone);
  cleanupPortableHtml(bodyClone);
  const plain = getReadableText(bodyClone);

  const replacement = document.createElement('section');
  const bodyStyle = bodyClone.getAttribute('style');
  replacement.style.cssText = bodyStyle || 'margin:0;';
  while (bodyClone.firstChild) {
    replacement.appendChild(bodyClone.firstChild);
  }

  return {
    html: replacement.outerHTML,
    plain,
  };
};

const captureHtmlScreenshot = async (iframeBody: HTMLElement): Promise<Blob> => {
  const html2canvas = (await import('html2canvas')).default;
  const iframeDoc = iframeBody.ownerDocument;

  // Copy both <style> and <link rel="stylesheet"> from iframe
  const styles = Array.from(
    iframeDoc.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((el) => el.outerHTML)
    .join('');

  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    `width:${WECHAT_ARTICLE_WIDTH}px`,
    'background:#ffffff',
  ].join(';');
  container.innerHTML = styles + iframeBody.innerHTML;
  document.body.appendChild(container);

  // Wait for all <link> stylesheets and fonts to load
  const linkElements = Array.from(
    container.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  );
  if (linkElements.length > 0) {
    await Promise.all(
      linkElements.map(
        (link) =>
          new Promise<void>((resolve) => {
            link.onload = () => resolve();
            link.onerror = () => resolve();
          }),
      ),
    );
    // Extra delay for webfont rendering
    await new Promise((r) => setTimeout(r, 500));
  }

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
  } finally {
    document.body.removeChild(container);
  }
};

// A component to render a single Mermaid diagram
const MermaidDiagram: React.FC<{
  code: string;
  scale: number;
  onSvgReady?: (svg: string) => void;
}> = ({ code, scale, onSvgReady }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        await mermaid.parse(code);
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          let cleanedSvg = svg.replace(/style="[^"]*max-width:[^"]*"/gi, '');
          // Expand viewBox to prevent CJK text clipping, then normalize width
          const vbMatch = cleanedSvg.match(/viewBox="([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)"/);
          if (vbMatch) {
            const [, vbX, vbY, vbW, vbH] = vbMatch.map(Number);
            const pad = 8;
            cleanedSvg = cleanedSvg.replace(
              /viewBox="[^"]*"/,
              `viewBox="${vbX} ${vbY - pad} ${vbW} ${vbH + pad * 2}"`,
            );
            const renderWidth = Math.round(vbW * 0.79);
            cleanedSvg = cleanedSvg.replace(/width="[^"]*"/, `width="${renderWidth}px"`);
          }
          setSvgContent(cleanedSvg);
          setError(null);
          onSvgReady?.(cleanedSvg);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Syntax error');
        }
      }
    };
    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [code, onSvgReady]);

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.documentElement;

    svgEl.removeAttribute('style');

    const viewBox = svgEl.getAttribute('viewBox');
    let nativeWidth = 0;
    let nativeHeight = 0;

    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).filter(Boolean);
      if (parts.length >= 4) {
        nativeWidth = parseFloat(parts[2]);
        nativeHeight = parseFloat(parts[3]);
      }
    }

    if (!nativeWidth) nativeWidth = parseFloat(svgEl.getAttribute('width') || '0');
    if (!nativeHeight) nativeHeight = parseFloat(svgEl.getAttribute('height') || '0');

    if (nativeWidth && nativeHeight) {
      svgEl.setAttribute('width', nativeWidth.toString());
      svgEl.setAttribute('height', nativeHeight.toString());
    }

    const serializer = new XMLSerializer();
    const newSvgString = serializer.serializeToString(svgEl);

    const img = new Image();
    const svg64 = btoa(unescape(encodeURIComponent(newSvgString)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');

      const targetWidth = 2500;
      let scale = 3;
      if (img.width < targetWidth) {
        scale = targetWidth / img.width;
      }
      scale = Math.min(scale, 10);

      canvas.width = Math.ceil(img.width * scale);
      canvas.height = Math.ceil(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `mermaid-diagram-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = image64;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 font-mono text-xs rounded border border-red-200 overflow-auto">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className="my-4 rounded shadow-sm border border-slate-200 bg-white"
      data-copy-role="mermaid-block"
    >
      <div
        className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-end"
        data-copy-remove="true"
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadSVG}
            className="flex items-center space-x-1 px-2 py-1 bg-white hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors border border-slate-200"
            title="Download SVG"
          >
            <Download size={14} />
            <span>SVG</span>
          </button>
          <button
            onClick={handleDownloadPNG}
            className="flex items-center space-x-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-xs text-indigo-700 transition-colors border border-indigo-200"
            title="Download PNG"
          >
            <ImageIcon size={14} />
            <span>PNG</span>
          </button>
        </div>
      </div>
      <ZoomableWrapper scale={scale} className="mermaid-container flex justify-center p-4">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </ZoomableWrapper>
    </div>
  );
};

// A component to render JSON
const JsonViewer: React.FC<{ code: string; onFormatted?: (formatted: string) => void }> = ({
  code,
  onFormatted,
}) => {
  let parsed: any;
  let formatted = code;
  let error = null;
  try {
    parsed = JSON5.parse(code);
    formatted = JSON.stringify(parsed, null, 2);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Invalid JSON';
  }

  useEffect(() => {
    if (!error) {
      onFormatted?.(formatted);
    }
  }, [formatted, error, onFormatted]);

  if (error) {
    return (
      <div className="my-4">
        <div className="p-2 bg-red-50 text-red-700 font-mono text-xs rounded-t border border-red-200 border-b-0">
          JSON Parse Error: {error}
        </div>
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          className="!m-0 !rounded-t-none !rounded-b"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="my-4 rounded border border-slate-200 shadow-sm" data-copy-role="json-block">
      <div
        className="bg-slate-800 px-4 py-1 text-xs text-slate-400 font-mono flex items-center"
        data-copy-remove="true"
      >
        <span>JSON</span>
      </div>
      <SyntaxHighlighter language="json" style={vscDarkPlus} className="!m-0 !rounded-none">
        {formatted}
      </SyntaxHighlighter>
    </div>
  );
};

// A component to render HTML in an iframe
const HtmlPreview: React.FC<{ code: string }> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const adjustHeight = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          setIframeHeight(height);
        }
      } catch {
        // fallback: keep default height
      }
    };

    iframe.onload = adjustHeight;
    const timer = setTimeout(adjustHeight, 500);
    const timer2 = setTimeout(adjustHeight, 1000);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [code]);

  return (
    <div
      className="my-4 rounded border border-slate-200 shadow-sm bg-white flex flex-col"
      data-copy-role="html-preview"
    >
      <div
        className="bg-slate-800 px-4 py-1 text-xs text-slate-400 font-mono flex items-center shrink-0"
        data-copy-remove="true"
      >
        <span>HTML Preview</span>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={code}
        className="w-full border-none bg-white"
        style={{ minHeight: '200px', height: `${iframeHeight}px` }}
      />
    </div>
  );
};

const MixedPreview: React.FC<MixedPreviewProps> = ({
  code,
  onError,
  isCollapsed = false,
  onToggleSidebar,
}) => {
  const { scale, zoomIn, zoomOut, reset, setScale } = useZoom();
  const [copied, setCopied] = useState(false);
  const [copiedImages, setCopiedImages] = useState(false);
  const [copiedScreenshot, setCopiedScreenshot] = useState(false);
  const [mermaidCount, setMermaidCount] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const savedScrollRatio = useRef(0);
  const naturalContentWidthRef = useRef(0);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const contentType = detectContentType(code);
  const mermaidSvgRef = useRef<string>('');
  const jsonFormattedRef = useRef<string>('');

  const refreshMermaidCount = useCallback(() => {
    window.requestAnimationFrame(() => {
      setMermaidCount(previewRef.current ? getMermaidSvgs(previewRef.current).length : 0);
    });
  }, []);

  const copyLabel = useMemo(() => {
    switch (contentType) {
      case 'json':
        return '复制 JSON';
      case 'html':
        return '复制富文本';
      case 'mermaid':
        return '复制富文本';
      case 'mixed':
        return '复制富文本';
      default:
        return '复制富文本';
    }
  }, [contentType]);
  // Pre-process the code to auto-detect pure JSON or pure Mermaid if not wrapped
  const preprocessCode = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';

    // Check if pure JSON
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        JSON5.parse(trimmed);
        return `\`\`\`json\n${input}\n\`\`\``;
      } catch {
        // Not valid JSON
      }
    }

    // Check if pure HTML document
    if (
      trimmed.toLowerCase().startsWith('<!doctype html>') ||
      trimmed.toLowerCase().startsWith('<html')
    ) {
      return `\`\`\`html-preview\n${input}\n\`\`\``;
    }

    // Check if pure Mermaid
    const mermaidKeywords = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'gantt',
      'pie',
      'journey',
      'mindmap',
      'timeline',
      'gitGraph',
    ];
    const firstWord = trimmed.split(/\s+/)[0];
    if (mermaidKeywords.includes(firstWord)) {
      return `\`\`\`mermaid\n${input}\n\`\`\``;
    }

    return input;
  };

  const processedCode = preprocessCode(code);

  // We clear global error because individual blocks handle their own errors
  useEffect(() => {
    onError(null);
  }, [processedCode, onError]);

  useEffect(() => {
    mermaidSvgRef.current = '';
    setMermaidCount(0);
    const timers = [
      window.setTimeout(refreshMermaidCount, 200),
      window.setTimeout(refreshMermaidCount, 800),
      window.setTimeout(refreshMermaidCount, 1600),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [processedCode, refreshMermaidCount]);

  // Restore scroll position after scale changes
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return;
    el.scrollTop = Math.min(savedScrollRatio.current * maxScroll, maxScroll);
  }, [scale]);

  // Persist scroll ratio on any scroll
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        savedScrollRatio.current = el.scrollTop / maxScroll;
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const handleFit = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const content = previewRef.current;
    if (!content) return;
    const paddingX = 64; // p-8 = 2rem * 2 sides
    const viewWidth = el.clientWidth - paddingX;
    const contentWidth = naturalContentWidthRef.current || content.scrollWidth;
    if (contentWidth <= 0 || viewWidth <= 0) return;
    const target = viewWidth / contentWidth;
    savedScrollRatio.current = 0;
    setScale(target);
  }, [setScale]);

  // Auto-fit on content change: poll until content width stabilizes (handles async Mermaid)
  useEffect(() => {
    setScale(1);
    naturalContentWidthRef.current = 0;

    let attempts = 0;
    let lastWidth = 0;
    let stableCount = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const check = () => {
      const el = scrollContainerRef.current;
      const content = previewRef.current;
      if (!el || !content || attempts >= 12) return;
      attempts++;
      const w = content.scrollWidth;
      if (w > 0 && w === lastWidth) {
        stableCount++;
        if (stableCount >= 2) {
          const viewWidth = el.clientWidth - 64;
          const target = viewWidth / w;
          if (target < 1 && target > 0.2) {
            savedScrollRatio.current = 0;
            setScale(target);
          }
          naturalContentWidthRef.current = w;
          return;
        }
      } else {
        stableCount = 0;
        lastWidth = w;
      }
      timeoutId = setTimeout(check, 300);
    };

    timeoutId = setTimeout(check, 100);

    return () => clearTimeout(timeoutId);
  }, [processedCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    if (!code.trim()) return;
    try {
      switch (contentType) {
        case 'json': {
          if (jsonFormattedRef.current) {
            await copyPlainText(jsonFormattedRef.current);
          }
          break;
        }
        case 'html': {
          const iframe = previewRef.current?.querySelector('iframe');
          const doc = iframe?.contentDocument;
          let payload: CopyPayload;
          if (doc?.body) {
            // Inline computed styles but skip cleanupPortableHtml — it strips
            // width from <section> elements which breaks flex layouts used by
            // 135-editor and similar rich HTML templates.
            const bodyClone = doc.body.cloneNode(true) as HTMLElement;
            appendInlineStyles(doc.body, bodyClone);
            const plain = getReadableText(bodyClone);
            const replacement = document.createElement('section');
            const bodyStyle = bodyClone.getAttribute('style');
            replacement.style.cssText =
              (bodyStyle ? bodyStyle + ';' : '') +
              `max-width:${WECHAT_ARTICLE_WIDTH}px;margin:0 auto;box-sizing:border-box;background:#ffffff;`;
            while (bodyClone.firstChild) {
              replacement.appendChild(bodyClone.firstChild);
            }
            payload = { html: replacement.outerHTML, plain };
          } else {
            console.warn(
              'iframe.contentDocument unavailable, falling back to raw HTML source',
            );
            const fallbackDoc = new DOMParser().parseFromString(
              code,
              'text/html',
            );
            payload = buildIframeCopyPayload(fallbackDoc);
          }
          await copyRichHtml(payload.html, payload.plain);
          break;
        }
        case 'mermaid':
        case 'mixed':
        case 'markdown':
        default: {
          if (!previewRef.current) throw new Error('Preview is not ready');
          const payload = await buildPreviewCopyPayload(previewRef.current);
          await copyRichHtml(payload.html, payload.plain, {
            preferSelection: payload.hasEmbeddedImages,
          });
          break;
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyImages = async () => {
    if (!previewRef.current) return;
    try {
      const svgs = getMermaidSvgs(previewRef.current);
      if (svgs.length === 0) throw new Error('No Mermaid diagrams are ready to copy');

      if (svgs.length === 1) {
        const blob = await svgToPngBlob(svgs[0].outerHTML);
        const imageUrl = await blobToDataUrl(blob);
        const html = createResponsiveImageHtml(imageUrl, 'Mermaid diagram');
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
              'text/html': new Blob([html], { type: 'text/html' }),
              'text/plain': new Blob(['Mermaid diagram'], { type: 'text/plain' }),
            }),
          ]);
        } catch (err) {
          console.warn(
            'navigator.clipboard.write Mermaid image failed, falling back to rich HTML image:',
            err,
          );
          await copyRichHtml(html, 'Mermaid diagram', { preferSelection: true });
        }
      } else {
        const payload = await buildMermaidImagesPayload(previewRef.current);
        await copyRichHtml(payload.html, payload.plain, { preferSelection: true });
      }

      setCopiedImages(true);
      setTimeout(() => setCopiedImages(false), 2000);
    } catch (err) {
      console.error('Failed to copy Mermaid images:', err);
    }
  };

  const handleCopyScreenshot = async () => {
    if (!previewRef.current) return;
    try {
      const iframe = previewRef.current.querySelector('iframe');
      const doc = iframe?.contentDocument;
      if (!doc?.body) throw new Error('HTML preview is not ready');

      const blob = await captureHtmlScreenshot(doc.body);
      const imageUrl = await blobToDataUrl(blob);
      const html = createResponsiveImageHtml(imageUrl, 'HTML preview screenshot');

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob(['HTML preview screenshot'], { type: 'text/plain' }),
        }),
      ]);

      setCopiedScreenshot(true);
      setTimeout(() => setCopiedScreenshot(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML screenshot:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 bg-white border-b border-slate-200 z-10 shrink-0 shadow-sm"
        style={{ minHeight: '45px' }}
      >
        <div className="flex items-center space-x-3">
          {isCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              title="展开编辑器"
            >
              <PanelLeftOpen size={14} />
              <span>展开</span>
            </button>
          )}
          <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Preview
          </span>
          <ZoomControls
            scale={scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={reset}
            onFit={handleFit}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!processedCode || copied || (contentType === 'mermaid' && mermaidCount === 0)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              copied
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={copied ? '已复制' : copyLabel}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? '已复制' : copyLabel}</span>
          </button>
          {mermaidCount > 0 && (
            <button
              onClick={handleCopyImages}
              disabled={copiedImages}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                copiedImages
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title={copiedImages ? '已复制图片' : `复制 ${mermaidCount} 张 Mermaid 图片`}
            >
              {copiedImages ? <Check size={14} /> : <ImageIcon size={14} />}
              <span>{copiedImages ? '已复制图片' : '复制图片'}</span>
            </button>
          )}
          {contentType === 'html' && (
            <button
              onClick={handleCopyScreenshot}
              disabled={copiedScreenshot}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                copiedScreenshot
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={copiedScreenshot ? '已复制图片' : '复制 HTML 页面为图片'}
            >
              {copiedScreenshot ? <Check size={14} /> : <Camera size={14} />}
              <span>{copiedScreenshot ? '已复制图片' : '复制图片'}</span>
            </button>
          )}
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="relative overflow-auto"
        style={{ height: 'calc(100% - 45px)' }}
      >
        <div className="w-full h-full p-8">
          <div
            ref={previewRef}
            className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none prose-strong:font-bold prose-strong:text-slate-900"
            style={{ minWidth: '760px' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={useMemo(
                () => ({
                  p: ({ ...props }: any) => <div className="mb-4 leading-relaxed" {...props} />,
                  div: ({ ...props }: any) => {
                    // If it has a data-html attribute, it's our injected raw HTML
                    if (props['data-html']) {
                      return <div dangerouslySetInnerHTML={{ __html: props['data-html'] }} />;
                    }
                    return <div {...props} />;
                  },
                  code({ className, children, ...props }: any) {
                    const match = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const content = String(children).replace(/\n$/, '');

                    // If it has a language match, it's a code block. Otherwise, treat as inline code.
                    // (react-markdown v9+ removed the 'inline' prop)
                    const isBlock = Boolean(match);

                    if (isBlock && language === 'mermaid') {
                      return (
                        <MermaidDiagram
                          code={content}
                          scale={scaleRef.current}
                          onSvgReady={(svg) => {
                            mermaidSvgRef.current = svg;
                            refreshMermaidCount();
                          }}
                        />
                      );
                    }

                    if (isBlock && language === 'json') {
                      return (
                        <JsonViewer
                          code={content}
                          onFormatted={(formatted) => {
                            jsonFormattedRef.current = formatted;
                          }}
                        />
                      );
                    }

                    if (isBlock && language === 'html-preview') {
                      return <HtmlPreview code={content} />;
                    }

                    return isBlock ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={language}
                        PreTag="div"
                        className="rounded-md !my-4"
                        {...props}
                      >
                        {content}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }),
                [refreshMermaidCount],
              )}
            >
              {processedCode}
            </ReactMarkdown>
            {!processedCode && (
              <div className="text-slate-400 text-center mt-10">
                Enter Markdown, HTML, JSON, or Mermaid syntax...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixedPreview;
