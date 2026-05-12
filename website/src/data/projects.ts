export type ProjectStatus = 'Open Source' | 'Prototype' | 'Coming Soon';

export interface ProjectLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  category: 'AI Coding' | 'AI Skills' | 'Content Systems' | 'Knowledge Products';
  stage: string;
  oneLiner: string;
  description: string;
  problem: string;
  icon: string;
  tags: string[];
  path?: string;
  links: ProjectLink[];
  featured: boolean;
  order: number;
}

export const projects: Project[] = [
  {
    id: 'mixed-preview',
    name: 'Mixed Preview',
    status: 'Open Source',
    category: 'Content Systems',
    stage: '可在线使用',
    oneLiner: '一个编辑器里写 Markdown、Mermaid、JSON、HTML，并实时预览。',
    description: '混合内容实时预览编辑器，面向技术文档、结构化内容和 AI 生成内容的快速校验。',
    problem: '写技术内容时，经常要在 Markdown 预览、Mermaid、JSON 格式化、HTML 沙盒之间来回切换。',
    icon: 'FileCode',
    tags: ['React', 'Mermaid', 'JSON5', 'Markdown'],
    path: '/mixed-preview',
    links: [
      { label: '打开工具', href: '/mixed-preview' },
      { label: 'GitHub', href: 'https://github.com/WiseWong6/wise-labs/tree/main/mixed-preview', external: true },
    ],
    featured: true,
    order: 1,
  },
  {
    id: 'terminal-tiler',
    name: 'Terminal Tiler',
    status: 'Open Source',
    category: 'AI Coding',
    stage: 'macOS 工具',
    oneLiner: '用一个快捷键整理散乱的 iTerm2、Terminal、Ghostty 窗口。',
    description: '为 Claude Code、Codex、OpenClaw 等多终端工作流设计的 macOS 窗口平铺工具。',
    problem: 'AI Coding 时经常开出多个独立终端窗口，手动拖拽会打断思路，显示器切换后也容易乱。',
    icon: 'LayoutGrid',
    tags: ['Swift', 'AppleScript', 'Shell', 'macOS'],
    path: '/terminal-tiler',
    links: [
      { label: '项目详情', href: '/terminal-tiler' },
      { label: 'GitHub', href: 'https://github.com/WiseWong6/wise-labs/tree/main/terminal-tiler', external: true },
    ],
    featured: true,
    order: 2,
  },
  {
    id: 'wise-skills',
    name: 'Wise Skills',
    status: 'Open Source',
    category: 'AI Skills',
    stage: '持续更新',
    oneLiner: '把飞书、提示词、内容创作等日常工作封装成可复用 Skills。',
    description: '一组面向 AI 助手的开源技能集合，让模型可以连接真实工作平台与个人工作流。',
    problem: '很多 AI 工作流停留在提示词层，缺少可复用、可分发、能连接业务工具的能力单元。',
    icon: 'Puzzle',
    tags: ['Claude Skills', 'Lark', 'Prompt', 'Workflow'],
    path: '/skills',
    links: [
      { label: 'Skills 目录', href: '/skills' },
      { label: 'GitHub', href: 'https://github.com/WiseWong6/wise-skills', external: true },
    ],
    featured: true,
    order: 3,
  },
  {
    id: 'swiss-editorial',
    name: 'Swiss Editorial',
    status: 'Coming Soon',
    category: 'Content Systems',
    stage: '计划开源',
    oneLiner: '面向 AI 生成图文内容的 Swiss editorial 组件风格目录。',
    description: '把封面、流程、矩阵、图表等高密度表达沉淀成可复用的视觉组件目录。',
    problem: 'AI 生成内容经常有信息但缺表达结构，需要一套稳定、可复用、可预览的图文版式系统。',
    icon: 'Newspaper',
    tags: ['Editorial', 'Visual System', 'AI Content'],
    links: [{ label: '计划开源', href: '/projects' }],
    featured: true,
    order: 4,
  },
  {
    id: 'celebrity-knowledge-base',
    name: '名人知识库',
    status: 'Prototype',
    category: 'Knowledge Products',
    stage: '早期多维表格产品',
    oneLiner: '围绕科技领袖、商业大师、产品思想家的结构化第二大脑。',
    description: '把人物、文章、观点、标签和写作场景组织成可检索的知识产品。',
    problem: '做 AI 产品分析和内容创作时，需要快速找到可靠观点、人物脉络和可引用素材。',
    icon: 'BrainCircuit',
    tags: ['Second Brain', 'Knowledge Base', 'Writing'],
    links: [{ label: '了解知识主题', href: '/knowledge' }],
    featured: true,
    order: 5,
  },
  {
    id: 'reading-system',
    name: '阅读系统',
    status: 'Prototype',
    category: 'Knowledge Products',
    stage: '早期多维表格产品',
    oneLiner: '把阅读、摘录、标签和输出选题串成一套个人研究系统。',
    description: '面向长期阅读和内容生产的结构化输入系统，服务于 AI 产品、模型测评和工作流研究。',
    problem: '单篇收藏很难变成长期资产，需要把阅读材料和输出场景持续连接起来。',
    icon: 'BookOpen',
    tags: ['Reading', 'Research', 'Database'],
    links: [{ label: '了解知识主题', href: '/knowledge' }],
    featured: false,
    order: 6,
  },
];

export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);

export const projectCategories = ['全部', 'AI Coding', 'AI Skills', 'Content Systems', 'Knowledge Products'] as const;
