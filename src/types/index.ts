// ===== Novel Types (Supabase compatible) =====

export interface Novel {
  id: string
  title: string
  genre: string
  description: string
  cover_url: string
  status: 'draft' | 'writing' | 'completed'
  word_count: number
  char_count: number
  volumes: string[]
  created_at: string
  updated_at: string
}

export interface Volume {
  id: string
  novel_id: string
  title: string
  description: string
  order: number
  chapter_count: number
  created_at: string
}

export interface Chapter {
  id: string
  novel_id: string
  volume_id: string
  volume_name: string
  title: string
  content: string
  word_count: number
  status: 'draft' | 'completed' | 'revised'
  order: number
  outline_id?: string
  generation_prompt?: string
  created_at: string
  updated_at: string
}

export interface Outline {
  id: string
  novel_id: string
  chapter_id?: string
  title: string
  content: string
  key_points: string[]
  order: number
  created_at: string
}

export interface Character {
  id: string
  novel_id: string
  name: string
  gender: string
  age: string
  appearance: string
  personality: string
  background: string
  role: 'protagonist' | 'supporter' | 'antagonist' | 'other'
  traits: string[]
  status: 'alive' | 'dead' | 'unknown'
  notes: string
  created_at: string
}

// ===== AI Config =====

export interface AIConfig {
  apiUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

// ===== Stats =====

export interface NovelStats {
  totalChapters: number
  completedChapters: number
  totalWords: number
  totalVolumes: number
}
