import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Download,
  Image as ImageIcon,
  Copy,
  Check,
  PanelLeftClose,
  PanelTopClose,
  PanelTopOpen,
  Sidebar,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Loader2,
} from 'lucide-react';
import ZoomableWrapper from './ZoomableWrapper';
import JSON5 from 'json5';

// Lazy-load mermaid to reduce initial bundle size
let mermaidPromise: Promise<typeof import('mermaid').default> | null = null;

const getMermaid = async () => {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      mod.default.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      });
      return mod.default;
    });
  }
  return mermaidPromise;
};

interface MixedPreviewProps {
  code: string;
  onError: (error: string | null) => void;
  isCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

type ContentType = 'markdown' | 'json' | 'html' | 'mermaid' | 'mixed';

type CopyPayload = {
  html: string;
  plain: string;
  hasEmbeddedImages?: boolean;
};

type InlineStyleOptions = {
  styleProps?: readonly string[];
  inlineImages?: boolean;
};

type HtmlCapture = {
  blob: Blob;
  width: number;
  height: number;
};

type CaptureRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const WECHAT_ARTICLE_WIDTH = 677;
const MAX_INLINE_IMAGE_PIXELS = 4_000_000;
const HTML_CAPTURE_PADDING = 8;
const HTML_PREVIEW_LANGUAGES = new Set(['html', 'html-preview']);
const NON_VISUAL_CAPTURE_TAGS = new Set(['script', 'style', 'template', 'link', 'meta', 'title']);
const MIXED_CAPTURE_VISUAL_TAGS = new Set([
  'img',
  'svg',
  'canvas',
  'video',
  'iframe',
  'table',
  'pre',
  'code',
]);
const HTML_FRAGMENT_TAGS = [
  'article',
  'aside',
  'body',
  'br',
  'button',
  'canvas',
  'div',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'img',
  'main',
  'nav',
  'ol',
  'p',
  'section',
  'span',
  'style',
  'svg',
  'table',
  'ul',
] as const;

const COPY_STYLE_PROPS = [
  'display',
  'box-sizing',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'align-content',
  'align-items',
  'align-self',
  'justify-content',
  'justify-items',
  'justify-self',
  'gap',
  'row-gap',
  'column-gap',
  'grid',
  'grid-area',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-auto-rows',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'grid-template',
  'grid-template-areas',
  'grid-template-columns',
  'grid-template-rows',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'overflow',
  'overflow-x',
  'overflow-y',
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
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-right',
  'border-right-width',
  'border-right-style',
  'border-right-color',
  'border-bottom',
  'border-bottom-width',
  'border-bottom-style',
  'border-bottom-color',
  'border-left',
  'border-left-width',
  'border-left-style',
  'border-left-color',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'background',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
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
  'list-style-position',
  'border-collapse',
  'border-spacing',
  'table-layout',
  'box-shadow',
  'transform',
  'transform-origin',
  'object-fit',
  'object-position',
  'opacity',
  'break-inside',
  'page-break-inside',
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
const PRESERVE_LAYOUT_ATTR = 'data-copy-preserve-layout';

const getReadableText = (element: HTMLElement) =>
  (element.innerText || element.textContent || '').replace(/\n{3,}/g, '\n\n').trim();

const looksLikeHtml = (rawCode: string) => {
  const trimmed = rawCode.trim();
  if (!trimmed) return false;

  if (/^<!doctype\s+html[\s>]/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return true;
  }

  const tagNames = HTML_FRAGMENT_TAGS.join('|');
  const startsWithHtmlTag = new RegExp(`^<(${tagNames})(\\s|>|/)`, 'i').test(trimmed);
  const hasPairedHtmlTag = new RegExp(`<(${tagNames})(\\s|>)[\\s\\S]*<\\/\\1>`, 'i').test(trimmed);

  return startsWithHtmlTag || hasPairedHtmlTag;
};

const hasMultipleFencedCodeBlocks = (rawCode: string) => {
  const codeBlockMatches = rawCode.trim().match(/```[a-zA-Z]/g);
  return Boolean(codeBlockMatches && codeBlockMatches.length >= 2);
};

const imageToDataUrl = (image: HTMLImageElement, quality = 0.82) => {
  try {
    if (!image.naturalWidth || !image.naturalHeight) {
      return image.currentSrc || image.src;
    }
    if (image.naturalWidth * image.naturalHeight > MAX_INLINE_IMAGE_PIXELS) {
      return image.currentSrc || image.src;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      return image.currentSrc || image.src;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.warn('Image data URL fallback:', err);
    return image.currentSrc || image.src;
  }
};

const appendInlineStyles = (source: Element, target: Element, options: InlineStyleOptions = {}) => {
  const view = source.ownerDocument.defaultView;
  const computedStyle = view?.getComputedStyle(source);
  const targetStyle = (target as HTMLElement | SVGElement).style;
  const styleProps = options.styleProps ?? COPY_STYLE_PROPS;
  const inlineImages = options.inlineImages ?? true;

  if (computedStyle && targetStyle) {
    styleProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop);
      if (value) {
        targetStyle.setProperty(prop, value);
      }
    });
  }

  const sourceTagName = source.tagName.toLowerCase();
  const targetTagName = target.tagName.toLowerCase();

  if (inlineImages && sourceTagName === 'img' && targetTagName === 'img') {
    (target as HTMLImageElement).src = imageToDataUrl(source as HTMLImageElement);
  }

  if (sourceTagName === 'li' && targetTagName === 'li' && view) {
    const beforeContent = view.getComputedStyle(source, '::before').content;
    if (beforeContent && beforeContent !== 'none' && beforeContent !== 'normal') {
      const cleanContent = beforeContent.replace(/^["']|["']$/g, '').trim();
      if (cleanContent) {
        target.insertBefore(document.createTextNode(`${cleanContent} `), target.firstChild);
      }
    }
  }

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children[index];
    if (targetChild) {
      appendInlineStyles(sourceChild, targetChild, options);
    }
  });
};

const cleanupPortableHtml = (root: HTMLElement) => {
  root.querySelectorAll('[data-copy-remove="true"], script').forEach((element) => {
    element.remove();
  });

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];
  const preserveLayoutElements = new WeakSet<HTMLElement>();
  elements.forEach((element) => {
    if (element.closest(`[${PRESERVE_LAYOUT_ATTR}="true"]`)) {
      preserveLayoutElements.add(element);
    }
  });

  elements.forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-copy-')) {
        element.removeAttribute(attr.name);
      }
    });
    element.removeAttribute('class');
    element.removeAttribute('id');
    element.removeAttribute('contenteditable');

    const tagName = element.tagName.toLowerCase();
    const preserveLayout = preserveLayoutElements.has(element);

    if (!preserveLayout && FLOW_TEXT_TAGS.has(tagName)) {
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
      element.style.setProperty('max-width', '100%');
      element.style.setProperty('height', 'auto');
      element.style.setProperty('vertical-align', 'top');

      if (!preserveLayout) {
        element.style.setProperty('display', 'block');
        element.style.setProperty('width', '100%');
        element.style.setProperty('margin', '16px auto');
        element.style.setProperty('border', '0');
      }
    }

    if (!preserveLayout && tagName === 'table') {
      element.style.setProperty('width', '100%');
      element.style.setProperty('max-width', '100%');
      element.style.setProperty('border-collapse', 'collapse');
      element.style.setProperty('table-layout', 'auto');
    }

    if (!preserveLayout && tagName === 'pre') {
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

const saveCurrentSelection = () => {
  const mainSelection = window.getSelection();
  const savedRanges = mainSelection
    ? Array.from({ length: mainSelection.rangeCount }, (_, index) =>
        mainSelection.getRangeAt(index).cloneRange(),
      )
    : [];

  return { mainSelection, savedRanges };
};

const restoreSelection = (
  mainSelection: Selection | null,
  savedRanges: Range[],
  activeSelection?: Selection | null,
) => {
  activeSelection?.removeAllRanges();
  mainSelection?.removeAllRanges();
  savedRanges.forEach((range) => mainSelection?.addRange(range));
};

const copyRichHtmlViaDocumentSelection = (html: string) => {
  const { mainSelection, savedRanges } = saveCurrentSelection();
  const tempContainer = document.createElement('div');
  tempContainer.setAttribute('contenteditable', 'true');
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
    mainSelection?.removeAllRanges();
    mainSelection?.addRange(range);

    if (!document.execCommand('copy')) {
      throw new Error('document.execCommand("copy") returned false');
    }
  } finally {
    restoreSelection(mainSelection, savedRanges);
    document.body.removeChild(tempContainer);
  }
};

const copyRichHtmlViaIframeSelection = (html: string) => {
  const { mainSelection, savedRanges } = saveCurrentSelection();
  const iframe = document.createElement('iframe');
  iframe.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${WECHAT_ARTICLE_WIDTH}px`,
    'height:1px',
    'border:0',
    'opacity:0.01',
    'pointer-events:none',
    'background:#ffffff',
    'z-index:-1',
  ].join(';');

  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    const frameWindow = iframe.contentWindow;
    if (!doc || !frameWindow) {
      throw new Error('Failed to create rich copy iframe');
    }

    doc.open();
    doc.write(
      [
        '<!doctype html>',
        '<html>',
        '<head>',
        '<meta charset="UTF-8">',
        '<style>',
        'html,body{margin:0;padding:0;background:#fff;}',
        `body{width:${WECHAT_ARTICLE_WIDTH}px;color:#1f2937;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;}`,
        'img,svg,canvas,video{max-width:100%;}',
        '</style>',
        '</head>',
        '<body>',
        html,
        '</body>',
        '</html>',
      ].join(''),
    );
    doc.close();

    const selection = frameWindow.getSelection();
    const range = doc.createRange();
    range.selectNodeContents(doc.body);
    selection?.removeAllRanges();
    selection?.addRange(range);
    frameWindow.focus();

    if (!doc.execCommand('copy')) {
      throw new Error('document.execCommand("copy") returned false');
    }
  } finally {
    restoreSelection(mainSelection, savedRanges, iframe.contentWindow?.getSelection());
    document.body.removeChild(iframe);
  }
};

const copyRichHtmlViaSelection = (html: string) => {
  try {
    copyRichHtmlViaIframeSelection(html);
  } catch (err) {
    console.warn('Iframe selection rich copy failed, falling back to document selection:', err);
    copyRichHtmlViaDocumentSelection(html);
  }
};

const copyRichHtml = async (
  html: string,
  plain: string,
  options: { preferSelection?: boolean } = {},
) => {
  if (!html.trim()) return;

  const writeClipboardItem = async () => {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      throw new Error('ClipboardItem rich copy is not available');
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      }),
    ]);
  };

  if (options.preferSelection) {
    try {
      copyRichHtmlViaSelection(html);
      return;
    } catch (err) {
      console.warn('Selection rich copy failed, falling back to ClipboardItem:', err);
    }

    await writeClipboardItem();
    return;
  }

  let clipboardError: unknown = null;
  try {
    await writeClipboardItem();
    return;
  } catch (err) {
    clipboardError = err;
    console.warn('navigator.clipboard.write failed, falling back to selection copy:', err);
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
  if (hasMultipleFencedCodeBlocks(trimmed)) {
    return 'mixed';
  }

  // Pure HTML documents or fragments
  if (looksLikeHtml(trimmed)) {
    return 'html';
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
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = Math.max(1, Math.ceil(img.naturalWidth || img.width || nativeWidth || 1));
      sourceCanvas.height = Math.max(1, Math.ceil(img.naturalHeight || img.height || nativeHeight || 1));

      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceContext) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      sourceContext.drawImage(img, 0, 0, sourceCanvas.width, sourceCanvas.height);

      const bounds = getCanvasContentBounds(sourceCanvas, 16);
      const canvas = document.createElement('canvas');
      const targetWidth = 2500;
      let scale = 3;
      if (bounds.width < targetWidth) {
        scale = targetWidth / bounds.width;
      }
      scale = Math.min(scale, 10);
      canvas.width = Math.ceil(bounds.width * scale);
      canvas.height = Math.ceil(bounds.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        sourceCanvas,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

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

const escapeHtmlAttribute = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const createResponsiveImageHtml = (src: string, alt: string) =>
  `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}" style="display:block;width:100%;max-width:${WECHAT_ARTICLE_WIDTH}px;height:auto;margin:16px auto;border:0;vertical-align:top;" />`;

const createEmbeddedPreviewImageHtml = (
  src: string,
  alt: string,
  dimensions?: { width: number; height: number },
) => {
  const width = dimensions ? Math.round(dimensions.width) : null;
  const height = dimensions ? Math.round(dimensions.height) : null;
  const sizeAttributes = width && height ? ` width="${width}" height="${height}"` : '';
  const widthStyle = width ? `width:${width}px;` : 'width:auto;';

  return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}"${sizeAttributes} style="display:block;${widthStyle}max-width:100%;height:auto;margin:0 auto;border:0;vertical-align:top;" />`;
};

const getCanvasContentBounds = (canvas: HTMLCanvasElement, padding = 0): CaptureRect => {
  const fallback = {
    x: 0,
    y: 0,
    width: Math.max(1, canvas.width),
    height: Math.max(1, canvas.height),
  };

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || canvas.width === 0 || canvas.height === 0) return fallback;

  try {
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const alpha = data[offset + 3];
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const isVisibleContent =
          alpha > 8 && (alpha < 245 || red < 248 || green < 248 || blue < 248);

        if (isVisibleContent) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < 0 || maxY < 0) return fallback;

    const left = Math.max(0, minX - padding);
    const top = Math.max(0, minY - padding);
    const right = Math.min(width, maxX + 1 + padding);
    const bottom = Math.min(height, maxY + 1 + padding);

    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  } catch (err) {
    console.warn('Failed to inspect canvas pixels for cropping:', err);
    return fallback;
  }
};

const cropCanvasToContent = (canvas: HTMLCanvasElement, padding = 0) => {
  const bounds = getCanvasContentBounds(canvas, padding);
  if (
    bounds.x === 0 &&
    bounds.y === 0 &&
    bounds.width === canvas.width &&
    bounds.height === canvas.height
  ) {
    return canvas;
  }

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = bounds.width;
  croppedCanvas.height = bounds.height;

  const context = croppedCanvas.getContext('2d');
  if (!context) return canvas;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);
  context.drawImage(
    canvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height,
  );

  return croppedCanvas;
};

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

const createHtmlBodyCopySection = (body: HTMLElement, margin: string) => {
  const bodyClone = body.cloneNode(true) as HTMLElement;
  appendInlineStyles(body, bodyClone);

  const section = document.createElement('section');
  const bodyStyle = bodyClone.getAttribute('style');
  section.setAttribute(PRESERVE_LAYOUT_ATTR, 'true');
  section.style.cssText = [
    bodyStyle ?? '',
    'width:100%',
    `max-width:${WECHAT_ARTICLE_WIDTH}px`,
    `margin:${margin}`,
    'box-sizing:border-box',
    'background:#ffffff',
  ]
    .filter(Boolean)
    .join(';');

  while (bodyClone.firstChild) {
    section.appendChild(bodyClone.firstChild);
  }

  return section;
};

const createHtmlSourceCopySection = (html: string, margin: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return createHtmlBodyCopySection(doc.body, margin);
};

const waitForIframeReady = (iframe: HTMLIFrameElement, timeoutMs = 1500) =>
  new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      iframe.removeEventListener('load', finish);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const isReady = () => {
      try {
        const doc = iframe.contentDocument;
        return Boolean(doc?.body && doc.readyState !== 'loading');
      } catch {
        return true;
      }
    };
    const timeoutId = window.setTimeout(finish, timeoutMs);

    if (isReady()) {
      finish();
      return;
    }

    iframe.addEventListener('load', finish, { once: true });
  });

const waitForHtmlPreviewFrames = async (sourceRoot: HTMLElement) => {
  const frames = Array.from(
    sourceRoot.querySelectorAll<HTMLIFrameElement>('[data-copy-role="html-preview"] iframe'),
  );
  await Promise.all(frames.map((frame) => waitForIframeReady(frame)));
};

const waitForHtmlDocumentAssets = async (doc: Document, timeoutMs = 2500) => {
  const view = doc.defaultView;
  const images = Array.from(doc.images);
  const imagePromises = images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (typeof image.decode === 'function') {
      return image.decode().catch(() => undefined);
    }
    return new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
  });

  const fontPromise = doc.fonts?.ready.catch(() => undefined) ?? Promise.resolve();
  const paintPromise = new Promise<void>((resolve) => {
    (view?.requestAnimationFrame ?? window.requestAnimationFrame)(() => resolve());
  });

  await Promise.race([
    Promise.all([...imagePromises, fontPromise, paintPromise]),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
};

const isVisibleCaptureElement = (element: Element) => {
  if (NON_VISUAL_CAPTURE_TAGS.has(element.tagName.toLowerCase())) {
    return false;
  }

  const view = element.ownerDocument.defaultView;
  const computedStyle = view?.getComputedStyle(element);
  if (
    computedStyle?.display === 'none' ||
    computedStyle?.visibility === 'hidden' ||
    computedStyle?.opacity === '0'
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const parseCssPixel = (value: string | null | undefined) => {
  const parsed = Number.parseFloat(value ?? '0');
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseRgbCssColor = (value: string) => {
  const match = value.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return null;

  const parts = match[1].split(/[,\s/]+/).filter(Boolean);
  const [red, green, blue] = parts.slice(0, 3).map((part) => Number.parseFloat(part));
  const alpha = parts[3] === undefined ? 1 : Number.parseFloat(parts[3]);

  if (![red, green, blue, alpha].every(Number.isFinite)) return null;
  return { red, green, blue, alpha };
};

const isTransparentCssColor = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'transparent') return true;

  const rgb = parseRgbCssColor(normalized);
  return Boolean(rgb && rgb.alpha <= 0.01);
};

const isPlainWhiteCssColor = (value: string) => {
  const rgb = parseRgbCssColor(value);
  return Boolean(
    rgb &&
      rgb.alpha > 0.01 &&
      rgb.red >= 248 &&
      rgb.green >= 248 &&
      rgb.blue >= 248,
  );
};

const hasVisibleBorder = (style: CSSStyleDeclaration, prefix: 'border' | 'outline') => {
  if (prefix === 'outline') {
    return (
      parseCssPixel(style.outlineWidth) > 0 &&
      !['none', 'hidden'].includes(style.outlineStyle) &&
      !isTransparentCssColor(style.outlineColor)
    );
  }

  return ['Top', 'Right', 'Bottom', 'Left'].some((side) => {
    const sideName = side.toLowerCase();
    const styleValue = style.getPropertyValue(`border-${sideName}-style`);
    const widthValue = style.getPropertyValue(`border-${sideName}-width`);
    const colorValue = style.getPropertyValue(`border-${sideName}-color`);

    return (
      parseCssPixel(widthValue) > 0 &&
      !['none', 'hidden'].includes(styleValue) &&
      !isTransparentCssColor(colorValue)
    );
  });
};

const hasMixedCaptureDecoration = (element: Element, style: CSSStyleDeclaration) => {
  const tagName = element.tagName.toLowerCase();
  if (MIXED_CAPTURE_VISUAL_TAGS.has(tagName)) return true;

  const backgroundColor = style.backgroundColor;
  const hasNonWhiteBackground =
    backgroundColor &&
    !isTransparentCssColor(backgroundColor) &&
    !isPlainWhiteCssColor(backgroundColor);
  const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';

  return Boolean(
    hasNonWhiteBackground ||
      hasBackgroundImage ||
      hasVisibleBorder(style, 'border') ||
      hasVisibleBorder(style, 'outline') ||
      (style.boxShadow && style.boxShadow !== 'none'),
  );
};

const getTextCaptureRects = (root: HTMLElement) => {
  const rects: DOMRect[] = [];
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;

      const parent = node.parentElement;
      if (
        !parent ||
        parent.closest('[data-copy-remove="true"]') ||
        !isVisibleCaptureElement(parent)
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(walker.currentNode);
    rects.push(
      ...Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0),
    );
    range.detach();
  }

  return rects;
};

const getMixedPreviewCaptureRect = (root: HTMLElement) => {
  const rootRect = root.getBoundingClientRect();
  const rootStyle = window.getComputedStyle(root);
  const maxRootWidth = Math.max(root.scrollWidth, root.clientWidth, Math.ceil(rootRect.width));
  const maxRootHeight = Math.max(root.scrollHeight, root.clientHeight, Math.ceil(rootRect.height));
  const rects = getTextCaptureRects(root);

  Array.from(root.querySelectorAll<Element>('*')).forEach((element) => {
    if (element.closest('[data-copy-remove="true"]') || !isVisibleCaptureElement(element)) return;

    const view = element.ownerDocument.defaultView;
    const style = view?.getComputedStyle(element);
    if (!style || !hasMixedCaptureDecoration(element, style)) return;

    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      rects.push(rect);
    }
  });

  if (rects.length === 0) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, maxRootWidth),
      height: Math.max(1, maxRootHeight),
    };
  }

  const leftPadding = Math.max(parseCssPixel(rootStyle.paddingLeft), HTML_CAPTURE_PADDING);
  const rightPadding = Math.max(parseCssPixel(rootStyle.paddingRight), HTML_CAPTURE_PADDING);
  const topPadding = Math.max(parseCssPixel(rootStyle.paddingTop), HTML_CAPTURE_PADDING);
  const bottomPadding = Math.max(parseCssPixel(rootStyle.paddingBottom), HTML_CAPTURE_PADDING);

  const left = Math.max(
    0,
    Math.floor(Math.min(...rects.map((rect) => rect.left)) - rootRect.left - leftPadding),
  );
  const top = Math.max(
    0,
    Math.floor(Math.min(...rects.map((rect) => rect.top)) - rootRect.top - topPadding),
  );
  const right = Math.min(
    maxRootWidth || Number.POSITIVE_INFINITY,
    Math.ceil(Math.max(...rects.map((rect) => rect.right)) - rootRect.left + rightPadding),
  );
  const bottom = Math.min(
    maxRootHeight || Number.POSITIVE_INFINITY,
    Math.ceil(Math.max(...rects.map((rect) => rect.bottom)) - rootRect.top + bottomPadding),
  );

  return {
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
};

const getHtmlDocumentCaptureRect = (doc: Document) => {
  const html = doc.documentElement;
  const body = doc.body;

  const contentElements = Array.from(body.children).filter(isVisibleCaptureElement);
  const rects = (contentElements.length ? contentElements : [body])
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);

  if (rects.length === 0) {
    return {
      x: 0,
      y: 0,
      width: Math.max(1, Math.min(WECHAT_ARTICLE_WIDTH, html.clientWidth || body.clientWidth || 1)),
      height: Math.max(1, body.scrollHeight || html.scrollHeight || 1),
    };
  }

  const maxDocumentWidth = Math.max(html.scrollWidth, body.scrollWidth, html.clientWidth, body.clientWidth);
  const maxDocumentHeight = Math.max(
    html.scrollHeight,
    body.scrollHeight,
    html.clientHeight,
    body.clientHeight,
  );

  const left = Math.max(
    0,
    Math.floor(Math.min(...rects.map((rect) => rect.left)) - HTML_CAPTURE_PADDING),
  );
  const top = Math.max(
    0,
    Math.floor(Math.min(...rects.map((rect) => rect.top)) - HTML_CAPTURE_PADDING),
  );
  const right = Math.min(
    maxDocumentWidth || Number.POSITIVE_INFINITY,
    Math.ceil(Math.max(...rects.map((rect) => rect.right)) + HTML_CAPTURE_PADDING),
  );
  const bottom = Math.min(
    maxDocumentHeight || Number.POSITIVE_INFINITY,
    Math.ceil(Math.max(...rects.map((rect) => rect.bottom)) + HTML_CAPTURE_PADDING),
  );

  return {
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
};

const captureHtmlFrameScreenshot = async (iframe: HTMLIFrameElement): Promise<HtmlCapture> => {
  await waitForIframeReady(iframe);
  const doc = iframe.contentDocument;
  if (!doc?.body) throw new Error('HTML preview is not ready');

  await waitForHtmlDocumentAssets(doc);

  const html2canvas = (await import('html2canvas')).default;
  const { x, y, width, height } = getHtmlDocumentCaptureRect(doc);
  const computedBodyStyle = doc.defaultView?.getComputedStyle(doc.body);
  const backgroundColor =
    computedBodyStyle?.backgroundColor && computedBodyStyle.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ? computedBodyStyle.backgroundColor
      : '#ffffff';

  const canvas = await html2canvas(doc.documentElement, {
    backgroundColor,
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 5000,
    x,
    y,
    width,
    height,
    windowWidth: Math.max(width, doc.documentElement.clientWidth, WECHAT_ARTICLE_WIDTH),
    windowHeight: Math.max(height, doc.documentElement.clientHeight),
    scrollX: 0,
    scrollY: 0,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          blob,
          width,
          height,
        });
      }
      else reject(new Error('Failed to create blob'));
    }, 'image/png');
  });
};

const capturePreviewElementScreenshot = async (element: HTMLElement): Promise<HtmlCapture> => {
  await waitForHtmlPreviewFrames(element);

  const html2canvas = (await import('html2canvas')).default;
  const { x, y, width, height } = getMixedPreviewCaptureRect(element);
  const scale = 2;
  const windowWidth = Math.max(width + x, element.scrollWidth, element.clientWidth);
  const windowHeight = Math.max(height + y, element.scrollHeight, element.clientHeight);

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    imageTimeout: 5000,
    x,
    y,
    width,
    height,
    windowWidth,
    windowHeight,
    scrollX: 0,
    scrollY: 0,
  });
  const outputCanvas = cropCanvasToContent(canvas, HTML_CAPTURE_PADDING * scale);
  const outputWidth = Math.max(1, Math.ceil(outputCanvas.width / scale));
  const outputHeight = Math.max(1, Math.ceil(outputCanvas.height / scale));

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => {
      if (blob) {
        resolve({
          blob,
          width: outputWidth,
          height: outputHeight,
        });
      }
      else reject(new Error('Failed to create blob'));
    }, 'image/png');
  });
};

const expandHtmlPreviews = async (sourceRoot: HTMLElement, cloneRoot: HTMLElement) => {
  const sourceFrames = Array.from(
    sourceRoot.querySelectorAll<HTMLIFrameElement>('[data-copy-role="html-preview"] iframe'),
  );
  const cloneFrames = Array.from(
    cloneRoot.querySelectorAll<HTMLIFrameElement>('[data-copy-role="html-preview"] iframe'),
  );

  await Promise.all(
    sourceFrames.map(async (sourceFrame, index) => {
      const cloneFrame = cloneFrames[index];
      const frameBody = sourceFrame.contentDocument?.body;
      if (!cloneFrame) return;

      const sourceHtml = sourceFrame.srcdoc || sourceFrame.getAttribute('srcdoc') || '';
      const replacement = frameBody
        ? createHtmlBodyCopySection(frameBody, '16px 0')
        : createHtmlSourceCopySection(sourceHtml, '16px 0');
      const copyBlock = cloneFrame.closest('[data-copy-role="html-preview"]');
      const replaceTarget =
        copyBlock?.parentElement?.tagName.toLowerCase() === 'pre'
          ? copyBlock.parentElement
          : copyBlock;
      replaceTarget?.replaceWith(replacement);
    }),
  );
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
  await waitForHtmlPreviewFrames(sourceRoot);
  const clone = sourceRoot.cloneNode(true) as HTMLElement;
  appendInlineStyles(sourceRoot, clone);
  await expandHtmlPreviews(sourceRoot, clone);
  const hasEmbeddedImages = await replaceMermaidBlocksWithImages(clone);
  cleanupPortableHtml(clone);

  return {
    html: wrapArticleHtml(clone.innerHTML, sourceRoot),
    plain: getReadableText(clone),
    hasEmbeddedImages,
  };
};

// A component to render a single Mermaid diagram with independent zoom controls
const MermaidDiagram: React.FC<{
  code: string;
  onSvgReady?: (svg: string) => void;
}> = ({ code, onSvgReady }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const clampScale = (v: number) => Math.max(0.5, Math.min(3, v));

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const mermaid = await getMermaid();
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
            cleanedSvg = cleanedSvg.replace(
              /width="[^"]*"/,
              `width="100%"`,
            );
            cleanedSvg = cleanedSvg.replace(
              /<svg /,
              `<svg style="height:auto;" `,
            );
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
    // Defer Mermaid rendering to yield main thread for loading animation
    const scheduleRender = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => renderDiagram(), { timeout: 300 });
      } else {
        window.setTimeout(renderDiagram, 0);
      }
    };
    scheduleRender();
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

  const handleDownloadPNG = async () => {
    if (!svgContent) return;

    try {
      const blob = await svgToPngBlob(svgContent);
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `mermaid-diagram-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
    } catch (err) {
      console.error('Failed to download Mermaid PNG:', err);
    }
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
        className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between"
        data-copy-remove="true"
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => clampScale(s + 0.1))}
            disabled={scale >= 3}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-700"
            title="放大"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setScale((s) => clampScale(s - 0.1))}
            disabled={scale <= 0.5}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors text-slate-700"
            title="缩小"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-700"
            title="重置"
          >
            <RotateCcw size={12} />
          </button>
          <span className="text-xs text-slate-600 font-mono min-w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadSVG}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors border border-slate-200"
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
        <div className="p-2 bg-red-50 text-red-700 font-mono text-sm rounded-t border border-red-200 border-b-0">
          JSON Parse Error: {error}
        </div>
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          className="!m-0 !rounded-t-none !rounded-b"
          customStyle={{ fontSize: '14px' }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="my-4 rounded border border-slate-200 shadow-sm" data-copy-role="json-block">
      <div
        className="bg-slate-800 px-4 py-1 text-sm text-slate-400 font-mono flex items-center"
        data-copy-remove="true"
      >
        <span>JSON</span>
      </div>
      <SyntaxHighlighter
        language="json"
        style={vscDarkPlus}
        className="!m-0 !rounded-none"
        customStyle={{ fontSize: '14px' }}
        wrapLongLines
      >
        {formatted}
      </SyntaxHighlighter>
    </div>
  );
};

// Script injected into HtmlPreview iframe to report content height via postMessage.
// Uses a unique ID (replaced at injection time) so multiple previews on one page don't collide.
const HEIGHT_REPORTER_SCRIPT = (id: string) => `
<script>
(function() {
  var reportHeight = function() {
    var body = document.body;
    var html = document.documentElement;
    if (!body || !html) return;
    var h = Math.max(
      body.scrollHeight, html.scrollHeight,
      body.getBoundingClientRect().height,
      html.getBoundingClientRect().height,
      200
    );
    parent.postMessage({ type: 'html-preview-height', id: '${id}', height: h }, '*');
  };
  var ro = new ResizeObserver(reportHeight);
  ro.observe(document.body);
  ro.observe(document.documentElement);
  reportHeight();
  [100, 300, 800, 1500, 2500].forEach(function(ms) {
    setTimeout(reportHeight, ms);
  });
})();
</script>`;

// Wrap user HTML with resource isolation
const wrapHtmlPreview = (rawCode: string, id: string): string => {
  const trimmed = rawCode.trim();
  const hasDocType = /^<!doctype\s+html/i.test(trimmed);
  const hasHtmlTag = /^<html[\s>]/i.test(trimmed);
  const reporter = HEIGHT_REPORTER_SCRIPT(id);

  if (hasDocType || hasHtmlTag) {
    let result = trimmed;
    if (/<head[\s>]/i.test(result)) {
      result = result.replace(/(<head[^>]*>)/i, '$1<base href="about:blank">');
    } else {
      result = result.replace(/(<html[^>]*>)/i, '$1<head><base href="about:blank"></head>');
    }
    // Inject height reporter before </body>
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, reporter + '</body>');
    } else {
      result += reporter;
    }
    return result;
  }

  return `<!DOCTYPE html><html><head><base href="about:blank"><meta charset="UTF-8"></head><body>${rawCode}${reporter}</body></html>`;
};

// A component to render HTML in an isolated iframe.
// Height is reported by the iframe content via postMessage — no contentDocument access needed,
// so we can keep the sandbox restrictive (no allow-same-origin).
// Each instance gets a stable random ID so multiple previews on one page don't collide.
const HtmlPreview: React.FC<{ code: string }> = ({ code }) => {
  const id = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const [iframeHeight, setIframeHeight] = useState(400);
  const wrappedCode = useMemo(() => wrapHtmlPreview(code, id), [code, id]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'html-preview-height' && e.data.id === id && typeof e.data.height === 'number') {
        setIframeHeight(Math.min(Math.ceil(e.data.height), 8000));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id]);

  return (
    <div
      className="my-4 rounded border border-slate-200 shadow-sm bg-white flex flex-col"
      data-copy-role="html-preview"
    >
      <div
        className="bg-slate-800 px-4 py-1 text-sm text-slate-400 font-mono flex items-center shrink-0"
        data-copy-remove="true"
      >
        <span>HTML Preview</span>
      </div>
      <iframe
        srcDoc={wrappedCode}
        sandbox="allow-scripts allow-popups-to-escape-sandbox"
        className="w-full border-none bg-white"
        style={{ height: `${iframeHeight}px` }}
      />
    </div>
  );
};

const MixedPreview: React.FC<MixedPreviewProps> = ({
  code,
  onError,
  isCollapsed = false,
  isMobile,
  onToggleSidebar,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedImages, setCopiedImages] = useState(false);
  const [copiedScreenshot, setCopiedScreenshot] = useState(false);
  const [mermaidCount, setMermaidCount] = useState(0);
  const [isRendering, setIsRendering] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const contentType = detectContentType(code);
  const mermaidSvgRef = useRef<string>('');
  const jsonFormattedRef = useRef<string>('');
  const renderTimeoutRef = useRef<number | null>(null);

  const refreshMermaidCount = useCallback(() => {
    window.requestAnimationFrame(() => {
      setMermaidCount(previewRef.current ? getMermaidSvgs(previewRef.current).length : 0);
    });
  }, []);

  const copyLabel = useMemo(() => {
    switch (contentType) {
      case 'json':
        return '复制 JSON';
      case 'mermaid':
        return '复制富文本';
      default:
        return '复制富文本';
    }
  }, [contentType]);
  const canCopyRichText = contentType !== 'html' && contentType !== 'mixed';
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

    if (hasMultipleFencedCodeBlocks(trimmed)) {
      return input;
    }

    // Check if pure HTML document or fragment
    if (looksLikeHtml(trimmed)) {
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

  // Show loading immediately when content changes, hide after render settles
  useEffect(() => {
    setIsRendering(true);
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    // Allow browser to paint loading state before heavy rendering
    renderTimeoutRef.current = window.setTimeout(() => {
      // Double rAF to ensure React has painted content
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsRendering(false);
        });
      });
    }, 80);
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [processedCode]);

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
          return;
        }
        case 'mixed': {
          return;
        }
        case 'mermaid':
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

  const handleCopyMixedScreenshot = async () => {
    if (!previewRef.current) return;
    try {
      const capture = await capturePreviewElementScreenshot(previewRef.current);
      const { blob, width, height } = capture;
      const imageUrl = await blobToDataUrl(blob);
      const html = createEmbeddedPreviewImageHtml(imageUrl, 'Mixed preview screenshot', {
        width,
        height,
      });

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob(['Mixed preview screenshot'], { type: 'text/plain' }),
          }),
        ]);
      } catch (err) {
        console.warn(
          'navigator.clipboard.write mixed screenshot failed, falling back to rich HTML image:',
          err,
        );
        await copyRichHtml(html, 'Mixed preview screenshot', { preferSelection: true });
      }

      setCopiedImages(true);
      setTimeout(() => setCopiedImages(false), 2000);
    } catch (err) {
      console.error('Failed to copy mixed preview screenshot:', err);
    }
  };

  const handleCopyScreenshot = async () => {
    if (!previewRef.current) return;
    try {
      const iframe = previewRef.current.querySelector('iframe');
      if (!iframe) throw new Error('HTML preview is not ready');

      const capture = await captureHtmlFrameScreenshot(iframe);
      const { blob, width, height } = capture;
      const imageUrl = await blobToDataUrl(blob);
      const html = createEmbeddedPreviewImageHtml(imageUrl, 'HTML preview screenshot', {
        width,
        height,
      });

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob(['HTML preview screenshot'], { type: 'text/plain' }),
          }),
        ]);
      } catch (err) {
        console.warn(
          'navigator.clipboard.write HTML screenshot failed, falling back to rich HTML image:',
          err,
        );
        await copyRichHtml(html, 'HTML preview screenshot', { preferSelection: true });
      }

      setCopiedScreenshot(true);
      setTimeout(() => setCopiedScreenshot(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML screenshot:', err);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <div
        className="flex h-12 shrink-0 items-center justify-between px-4 bg-slate-100 border-b border-slate-200 z-10 shadow-sm overflow-hidden"
      >
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-7 h-7 rounded text-xs font-medium transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title={isCollapsed ? '展开编辑器' : '收起编辑器'}
            >
              {isMobile
                ? (isCollapsed ? <PanelTopOpen size={14} /> : <PanelTopClose size={14} />)
                : (isCollapsed ? <Sidebar size={14} /> : <PanelLeftClose size={14} />)}
            </button>
          )}
          <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canCopyRichText && (
            <button
              onClick={handleCopy}
              disabled={!processedCode || copied || (contentType === 'mermaid' && mermaidCount === 0)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                copied
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={copied ? '已复制' : copyLabel}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden md:inline">{copied ? '已复制' : copyLabel}</span>
            </button>
          )}
          {contentType === 'mixed' && (
            <button
              onClick={handleCopyMixedScreenshot}
              disabled={copiedImages}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                copiedImages
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title={copiedImages ? '已复制图片' : '复制混合预览为图片'}
            >
              {copiedImages ? <Check size={14} /> : <Camera size={14} />}
              <span className="hidden md:inline">{copiedImages ? '已复制图片' : '复制图片'}</span>
            </button>
          )}
          {contentType !== 'mixed' && mermaidCount > 0 && (
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
              <span className="hidden md:inline">{copiedImages ? '已复制图片' : '复制图片'}</span>
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
              <span className="hidden md:inline">{copiedScreenshot ? '已复制图片' : '复制图片'}</span>
            </button>
          )}
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="relative min-h-0 flex-1 overflow-auto"
      >
        {isRendering && processedCode && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm transition-opacity">
            <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
            <span className="text-sm text-slate-500 font-medium">渲染中...</span>
          </div>
        )}
        <div className="w-full p-8">
          <div
            ref={previewRef}
            className="prose prose-slate w-full max-w-none overflow-x-auto rounded-xl border border-slate-200 bg-white p-8 shadow-sm prose-strong:font-bold prose-strong:text-slate-900"
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
                    const language = match ? match[1].toLowerCase() : '';
                    const content = String(children).replace(/\n$/, '');

                    // If it has a language match, it's a code block. Otherwise, treat as inline code.
                    // (react-markdown v9+ removed the 'inline' prop)
                    const isBlock = Boolean(match);

                    if (isBlock && language === 'mermaid') {
                      return (
                        <MermaidDiagram
                          code={content}
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

                    if (isBlock && HTML_PREVIEW_LANGUAGES.has(language)) {
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
