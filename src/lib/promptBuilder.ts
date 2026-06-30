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
