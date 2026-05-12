export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  githubUrl: string;
}

export const skills: Skill[] = [
  {
    id: 'image-gen',
    name: 'image-gen',
    description:
      '生成图片支持多提供商：火山 Ark (Doubao Seedream) 或 Gemini 3 Pro Image。支持批量生成、图片编辑、多图合成、自动保存和 Markdown 插入。',
    category: '内容创作',
    githubUrl: 'https://github.com/WiseWong6/wise-skills/tree/main/image-gen',
  },
  {
    id: 'ppt-speech-creator',
    name: 'ppt-speech-creator',
    description:
      '当用户需要创建 PPT 内容并生成配套演讲逐字稿时使用此技能。支持年终总结、项目复盘、产品发布、述职报告等多种场景。',
    category: '内容创作',
    githubUrl: 'https://github.com/WiseWong6/wise-skills/tree/main/ppt-speech-creator',
  },
  {
    id: 'prompt-creator',
    name: 'prompt-creator',
    description:
      'Create new prompts from scratch by analyzing user needs, selecting suitable prompt frameworks, and fusing OmegaPromptForge.',
    category: 'AI 工具',
    githubUrl: 'https://github.com/WiseWong6/wise-skills/tree/main/prompt-creator',
  },
  {
    id: 'prompt-optimizer',
    name: 'prompt-optimizer',
    description:
      '严格变更控制下编辑、版本化并存储提示词。强制版本控制、作者签名，并将版本保存到本地 prompts 目录。',
    category: 'AI 工具',
    githubUrl: 'https://github.com/WiseWong6/wise-skills/tree/main/prompt-optimizer',
  },
];

export const categories = ['全部', '内容创作', 'AI 工具'];
