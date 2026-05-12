export interface KnowledgeTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  articles: string[];
  pathHint: string;
  tags: string[];
}

export const knowledgeTopics: KnowledgeTopic[] = [
  {
    id: 'ai-product',
    title: 'AI 产品',
    category: 'Product Manager',
    description: '从产品经理视角解释 AI 产品的底层原理、工程化、评测体系和普通人的时代变化。',
    articles: ['AI底层原理知识', 'AI产品工程化扫盲', 'AI产品评测体系'],
    pathHint: '01-Product Manager-AI 产品',
    tags: ['产品方法论', '工程化', '评测体系'],
  },
  {
    id: 'model-review',
    title: '模型测评',
    category: 'Model & App',
    description: '跟踪最新模型发布、实战测评和能力边界，沉淀面向真实工作的判断标准。',
    articles: ['OpenAI Codex 桌面版', 'GLM5.0 Agentic Engineering', 'Kimi K2.5 极限测试'],
    pathHint: '05-Model-模型测评解读',
    tags: ['模型能力', '实战测评', 'Agent'],
  },
  {
    id: 'prompt-skills',
    title: 'Prompt / Skills',
    category: 'AI Workflow',
    description: '把提示词、Skills 和工作流封装成可以复用、可以交给 AI 助手执行的能力单元。',
    articles: ['歪斯原创or改良的提示词', 'PPT提示词收藏', '高质量杂志风网站'],
    pathHint: '03-Prompt-提示词',
    tags: ['Prompt', 'Skills', '内容创作'],
  },
  {
    id: 'ai-coding',
    title: 'AI Coding',
    category: 'Developer Workflow',
    description: '围绕原型、开发、部署、MCP、Agent 和本地工具的 AI 编程实践。',
    articles: ['AI Coding README', 'MCP / Skills 工作流', '开发者工具实验'],
    pathHint: '04-AI Coding-AI编程',
    tags: ['Vibe Coding', 'MCP', 'Developer Tools'],
  },
  {
    id: 'efficiency-tools',
    title: '效率工具',
    category: 'Productivity',
    description: '记录那些拿来能用的小工具、小自动化和个人工作流改造。',
    articles: ['Efficiency README', '平民 AI 教程', '顺手做的冷门免费工具'],
    pathHint: '02-Efficiency-效率工具',
    tags: ['自动化', '工作流', '工具箱'],
  },
];
