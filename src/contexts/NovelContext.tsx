import { createContext, useContext, useState, useCallback } from 'react'
import type { Novel, Chapter, Character, Outline } from '@/types'
import * as db from '@/lib/db'

interface NovelContextType {
  novels: Novel[]
  currentNovel: Novel | null
  loadNovels: () => Promise<void>
  loadNovel: (id: string) => Promise<void>
  createNovel: (data: Record<string, unknown>) => Promise<Novel>
  updateNovel: (id: string, data: Partial<Novel>) => Promise<void>
  deleteNovel: (id: string) => Promise<void>

  chapters: Chapter[]
  loadChapters: (novelId: string) => Promise<void>
  createChapter: (data: Record<string, unknown>) => Promise<Chapter>
  updateChapter: (id: string, data: Partial<Chapter>) => Promise<void>
  deleteChapter: (id: string) => Promise<void>

  characters: Character[]
  loadCharacters: (novelId: string) => Promise<void>
  createCharacter: (data: Record<string, unknown>) => Promise<Character>
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>

  outlines: Outline[]
  loadOutlines: (novelId: string) => Promise<void>
  createOutline: (data: Record<string, unknown>) => Promise<Outline>
  updateOutline: (id: string, data: Partial<Outline>) => Promise<void>
  deleteOutline: (id: string) => Promise<void>

  loading: boolean
  error: string | null
}

const NovelContext = createContext<NovelContextType | null>(null)

export function NovelProvider({ children }: { children: React.ReactNode }) {
  const [novels, setNovels] = useState<Novel[]>([])
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [outlines, setOutlines] = useState<Outline[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Novels
  const loadNovels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await db.getCollection<Novel>('novels')
      setNovels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadNovel = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const novel = await db.getDocument<Novel>('novels', id)
      setCurrentNovel(novel)
      if (novel) {
        await Promise.all([
          loadChapters(id),
          loadCharacters(id),
          loadOutlines(id)
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载小说失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const createNovel = useCallback(async (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const novel = await db.addDocument<Novel>('novels', {
      ...data,
      word_count: 0,
      char_count: 0,
      volumes: [],
      status: 'draft',
      created_at: now,
      updated_at: now
    })
    setNovels(prev => [...prev, novel])
    return novel
  }, [])

  const updateNovel = useCallback(async (id: string, data: Partial<Novel>) => {
    const updated = await db.updateDocument<Novel>('novels', id, {
      ...data,
      updated_at: new Date().toISOString()
    })
    if (updated) {
      setNovels(prev => prev.map(n => n.id === id ? updated : n))
      setCurrentNovel(prev => prev?.id === id ? updated : prev)
    }
  }, [])

  const deleteNovel = useCallback(async (id: string) => {
    await db.deleteDocument('novels', id)
    setNovels(prev => prev.filter(n => n.id !== id))
    setCurrentNovel(prev => prev?.id === id ? null : prev)
  }, [])

  // Chapters
  const loadChapters = useCallback(async (novelId: string) => {
    const data = await db.queryDocuments<Chapter>('chapters', 'novel_id', novelId)
    setChapters(data.sort((a, b) => a.order - b.order))
  }, [])

  const createChapter = useCallback(async (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const chapter = await db.addDocument<Chapter>('chapters', { ...data, created_at: now, updated_at: now })
    setChapters(prev => [...prev, chapter].sort((a, b) => a.order - b.order))
    return chapter
  }, [])

  const updateChapter = useCallback(async (id: string, data: Partial<Chapter>) => {
    const updated = await db.updateDocument<Chapter>('chapters', id, {
      ...data,
      updated_at: new Date().toISOString()
    })
    if (updated) {
      setChapters(prev => prev.map(c => c.id === id ? updated : c))
    }
  }, [])

  const deleteChapter = useCallback(async (id: string) => {
    await db.deleteDocument('chapters', id)
    setChapters(prev => prev.filter(c => c.id !== id))
  }, [])

  // Characters
  const loadCharacters = useCallback(async (novelId: string) => {
    const data = await db.queryDocuments<Character>('characters', 'novel_id', novelId)
    setCharacters(data)
  }, [])

  const createCharacter = useCallback(async (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const character = await db.addDocument<Character>('characters', { ...data, created_at: now })
    setCharacters(prev => [...prev, character])
    return character
  }, [])

  const updateCharacter = useCallback(async (id: string, data: Partial<Character>) => {
    const updated = await db.updateDocument<Character>('characters', id, data)
    if (updated) {
      setCharacters(prev => prev.map(c => c.id === id ? updated : c))
    }
  }, [])

  const deleteCharacter = useCallback(async (id: string) => {
    await db.deleteDocument('characters', id)
    setCharacters(prev => prev.filter(c => c.id !== id))
  }, [])

  // Outlines
  const loadOutlines = useCallback(async (novelId: string) => {
    const data = await db.queryDocuments<Outline>('outlines', 'novel_id', novelId)
    setOutlines(data.sort((a, b) => a.order - b.order))
  }, [])

  const createOutline = useCallback(async (data: Record<string, unknown>) => {
    const now = new Date().toISOString()
    const outline = await db.addDocument<Outline>('outlines', { ...data, created_at: now })
    setOutlines(prev => [...prev, outline])
    return outline
  }, [])

  const updateOutline = useCallback(async (id: string, data: Partial<Outline>) => {
    const updated = await db.updateDocument<Outline>('outlines', id, data)
    if (updated) {
      setOutlines(prev => prev.map(o => o.id === id ? updated : o))
    }
  }, [])

  const deleteOutline = useCallback(async (id: string) => {
    await db.deleteDocument('outlines', id)
    setOutlines(prev => prev.filter(o => o.id !== id))
  }, [])

  return (
    <NovelContext.Provider value={{
      novels,
      currentNovel,
      loadNovels,
      loadNovel,
      createNovel,
      updateNovel,
      deleteNovel,
      chapters,
      loadChapters,
      createChapter,
      updateChapter,
      deleteChapter,
      characters,
      loadCharacters,
      createCharacter,
      updateCharacter,
      deleteCharacter,
      outlines,
      loadOutlines,
      createOutline,
      updateOutline,
      deleteOutline,
      loading,
      error
    }}>
      {children}
    </NovelContext.Provider>
  )
}

export function useNovel() {
  const ctx = useContext(NovelContext)
  if (!ctx) throw new Error('useNovel must be used within NovelProvider')
  return ctx
}
