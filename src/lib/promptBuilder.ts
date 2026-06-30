import type { Character, Novel, Chapter } from '@/types'

interface ChapterContext {
  novel: Pick<Novel, 'title' | 'genre' | 'description'>
  characters: Pick<Character, 'name' | 'role' | 'personality' | 'background'>[]
  recentChapters: Pick<Chapter, 'title' | 'content'>[]
  outlineContent: string
  outlineKeyPoints: string[]
  userInstruction: string
}

export function buildSystemPrompt(novel: ChapterContext['novel']): string {
  return `你是一位专业的小说创作助手。请根据用户提供的小说设定、角色信息和本章大纲，创作出高质量的小说正文。

## 创作要求：
1. 保持文章风格连贯，符合 ${novel.genre} 类型的特点
2. 人物对话自然，符合角色性格设定
3. 情节推进要有节奏感，避免平淡流水账
4. 每章要有明确的起承转合，结尾留有悬念
5. 描写要生动具体，善用感官细节
6. 注意前后文逻辑，不要出现设定矛盾

## 小说信息：
- 标题：${novel.title}
- 类型：${novel.genre}
- 简介：${novel.description}

请直接输出小说正文，不要包含额外的说明或标题。`
}

export function buildUserPrompt(context: ChapterContext): string {
  const parts: string[] = []

  // Role info
  if (context.characters.length > 0) {
    const charDesc = context.characters.map(c =>
      `- ${c.name}（${c.role === 'protagonist' ? '主角' : c.role === 'antagonist' ? '反派' : c.role === 'supporter' ? '配角' : '其他'}）：${c.personality}${c.background ? `。背景：${c.background}` : ''}`
    ).join('\n')
    parts.push(`## 当前角色\n${charDesc}`)
  }

  // Previous context
  if (context.recentChapters.length > 0) {
    const prevSummary = context.recentChapters.map(c =>
      `【${c.title}】\n${c.content.substring(0, 500)}`
    ).join('\n\n')
    parts.push(`## 前情提要\n${prevSummary}`)
  }

  // Outline
  if (context.outlineContent) {
    parts.push(`## 本章大纲\n${context.outlineContent}`)
  }
  if (context.outlineKeyPoints.length > 0) {
    parts.push(`## 关键剧情点\n${context.outlineKeyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`)
  }

  // User instruction
  if (context.userInstruction) {
    parts.push(`## 用户要求\n${context.userInstruction}`)
  }

  const lastLine = `请根据以上信息，创作本章正文。字数建议在 2000-4000 字之间。`

  return parts.length > 0 ? `${parts.join('\n\n')}\n\n${lastLine}` : lastLine
}

// ===== AI 小说建议 =====

export function buildNovelSuggestionSystemPrompt(): string {
  return `你是一位专业的小说创作策划助手。根据用户的简要描述，生成 3 个小说创意方案。
每个方案必须包含：标题、题材、简介。
请以 JSON 数组格式返回，格式如下：
[
  {
    "title": "小说标题",
    "genre": "题材分类",
    "description": "小说简介（50-100字）"
  }
]
只返回 JSON 数组，不要包含其他内容。`
}

export function buildNovelSuggestionUserPrompt(userInput: string): string {
  return `用户想要写的小说方向：${userInput}
请生成 3 个具体的小说创意方案。`
}

// ===== AI 角色建议 =====

export function buildCharacterSuggestionSystemPrompt(novel: { title: string; genre: string; description: string }): string {
  return `你是一位专业的小说角色创作助手。根据已有小说设定和用户描述，生成 3 个角色方案。
每个方案必须包含：姓名、性别、年龄、外貌描述、性格特征、背景故事、角色定位、性格特质。

小说信息：
- 标题：${novel.title}
- 题材：${novel.genre}
- 简介：${novel.description}

请以 JSON 数组格式返回，格式如下：
[
  {
    "name": "角色名",
    "gender": "性别",
    "age": "年龄",
    "appearance": "外貌描述",
    "personality": "性格特征",
    "background": "背景故事",
    "role": "protagonist|supporter|antagonist|other",
    "traits": ["特质1", "特质2", "特质3"]
  }
]
只返回 JSON 数组，不要包含其他内容。`
}

export function buildCharacterSuggestionUserPrompt(userInput: string): string {
  return `用户想要的角色描述：${userInput}
请生成 3 个符合要求的角色方案。`
}

// ===== AI 大纲建议 =====

export function buildOutlineSuggestionSystemPrompt(novel: { title: string; genre: string; description: string }): string {
  return `你是一位专业的小说大纲创作助手。根据已有小说设定和用户要求，生成一条大纲内容。

小说信息：
- 标题：${novel.title}
- 题材：${novel.genre}
- 简介：${novel.description}

请以 JSON 格式返回，格式如下：
{
  "title": "大纲标题",
  "content": "大纲详细内容（200-500字）",
  "keyPoints": ["剧情点1", "剧情点2", "剧情点3", "剧情点4", "剧情点5"]
}
只返回 JSON，不要包含其他内容。`
}

export function buildOutlineSuggestionUserPrompt(userInput: string): string {
  return `用户要求的大纲方向：${userInput}
请根据这个方向生成详细的大纲内容。`
}
