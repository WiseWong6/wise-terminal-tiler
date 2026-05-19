export interface ChangelogEntry {
  date: string;
  summary: string;
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-05-19',
    summary: 'AI Artifact Desk 独立工具上线，优化黑夜模式显示、加载速度。',
  },
  {
    date: '2026-05-18',
    summary: '新增导出链路，覆盖新窗口预览、HTML 导出、图片复制操作。',
  },
  {
    date: '2026-05-17',
    summary: '新增 Mermaid 图的独立缩放控制。',
  },
  {
    date: '2026-05-16',
    summary: '新增移动端适配。',
  },
  {
    date: '2026-05-15',
    summary: '新增主站内嵌面板打开和主题跟随能力。',
  },
  {
    date: '2026-05-14',
    summary: '新增案例下拉菜单、关于弹窗。',
  },
  {
    date: '2026-05-13',
    summary: '新增富文本复制和截图复制能力。',
  },
  {
    date: '2026-03-28',
    summary: '新增 GitHub Pages 独立访问入口。',
  },
  {
    date: '2026-03-21',
    summary: '发布 mixed-preview 初版。',
  },
];
