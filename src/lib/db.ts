/**
 * Database operations with Supabase backend and offline fallback.
 */

type CollectionName = 'novels' | 'characters' | 'outlines' | 'chapters' | 'volumes'

// ===== Offline store fallback =====
const memoryStore: Record<string, Record<string, unknown>[]> = {
  novels: [],
  characters: [],
  outlines: [],
  chapters: [],
  volumes: []
}

let useOffline = false

export function isOffline() {
  return useOffline
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}

function tableName(name: CollectionName): string {
  return name
}

// ===== Supabase CRUD =====

async function withSupabase<T>(action: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  const { isSupabaseReady } = await import('./supabase')
  if (!useOffline && isSupabaseReady()) {
    try {
      return await action()
    } catch (err) {
      console.warn('Supabase 操作失败，降级到离线模式', err)
      useOffline = true
    }
  }
  return await fallback()
}

export async function getCollection<T>(name: CollectionName): Promise<T[]> {
  return withSupabase<T[]>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { data, error } = await getSupabase()
        .from(tableName(name))
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as T[]
    },
    () => [...memoryStore[name]] as T[]
  )
}

export async function getDocument<T>(name: CollectionName, id: string): Promise<T | null> {
  return withSupabase<T | null>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { data, error } = await getSupabase()
        .from(tableName(name))
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null // not found
        throw error
      }
      return data as T
    },
    () => {
      const doc = memoryStore[name].find(d => d.id === id)
      return doc ? (doc as T) : null
    }
  )
}

export async function addDocument<T>(name: CollectionName, data: Record<string, unknown>): Promise<T> {
  return withSupabase<T>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { data: inserted, error } = await getSupabase()
        .from(tableName(name))
        .insert([data])
        .select()
        .single()
      if (error) throw error
      return inserted as T
    },
    () => {
      const doc = { ...data, id: generateId() } as T
      memoryStore[name].push(doc as unknown as Record<string, unknown>)
      return doc
    }
  )
}

export async function updateDocument<T>(
  name: CollectionName,
  id: string,
  data: Partial<T>
): Promise<T | null> {
  return withSupabase<T | null>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { data: updated, error } = await getSupabase()
        .from(tableName(name))
        .update(data as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return updated as T
    },
    async () => {
      const idx = memoryStore[name].findIndex(d => d.id === id)
      if (idx >= 0) {
        memoryStore[name][idx] = { ...memoryStore[name][idx], ...data as Record<string, unknown> }
        return memoryStore[name][idx] as T
      }
      return null
    }
  ) as Promise<T | null>
}

export async function deleteDocument(name: CollectionName, id: string): Promise<boolean> {
  return withSupabase<boolean>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { error } = await getSupabase()
        .from(tableName(name))
        .delete()
        .eq('id', id)
      if (error) throw error
      return true
    },
    () => {
      const idx = memoryStore[name].findIndex(d => d.id === id)
      if (idx >= 0) {
        memoryStore[name].splice(idx, 1)
        return true
      }
      return false
    }
  )
}

export async function queryDocuments<T>(
  name: CollectionName,
  field: string,
  value: unknown
): Promise<T[]> {
  return withSupabase<T[]>(
    async () => {
      const { getSupabase } = await import('./supabase')
      const { data, error } = await getSupabase()
        .from(tableName(name))
        .select('*')
        .eq(field, value)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as T[]
    },
    () => memoryStore[name].filter(d => d[field] === value) as T[]
  )
}
