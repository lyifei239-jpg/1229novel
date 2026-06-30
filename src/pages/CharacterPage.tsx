import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Trash2,
  Users
} from 'lucide-react'
import type { Character } from '@/types'

const ROLE_OPTIONS = [
  { value: 'protagonist', label: '主角' },
  { value: 'supporter', label: '配角' },
  { value: 'antagonist', label: '反派' },
  { value: 'other', label: '其他' }
]

const STATUS_OPTIONS = [
  { value: 'alive', label: '存活' },
  { value: 'dead', label: '已故' },
  { value: 'unknown', label: '未知' }
]

const TRAIT_PRESETS = ['勇敢', '机智', '善良', '冷酷', '幽默', '孤僻', '热血', '冷静', '神秘', '忠诚']

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { characters, loadCharacters, createCharacter, updateCharacter, deleteCharacter, currentNovel } = useNovel()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', gender: '', age: '', appearance: '', personality: '',
    background: '', role: 'protagonist' as Character['role'],
    traits: [] as string[], status: 'alive' as Character['status'], notes: ''
  })

  useEffect(() => {
    if (id) loadCharacters(id)
  }, [id])

  const resetForm = () => {
    setForm({ name: '', gender: '', age: '', appearance: '', personality: '',
      background: '', role: 'protagonist', traits: [], status: 'alive', notes: '' })
    setEditingId(null)
  }

  const handleCreate = async () => {
    if (!id || !form.name.trim()) return
    await createCharacter({ novel_id: id, ...form })
    resetForm()
  }

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return
    await updateCharacter(editingId, form)
    resetForm()
  }

  const startEdit = (char: Character) => {
    setEditingId(char.id)
    setForm({
      name: char.name,
      gender: char.gender,
      age: char.age,
      appearance: char.appearance,
      personality: char.personality,
      background: char.background,
      role: char.role,
      traits: char.traits,
      status: char.status,
      notes: char.notes
    })
  }

  const handleDelete = async (charId: string) => {
    if (confirm('确定删除该角色吗？')) {
      await deleteCharacter(charId)
    }
  }

  const toggleTrait = (trait: string) => {
    setForm(prev => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter(t => t !== trait)
        : [...prev.traits, trait]
    }))
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(`/novel/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-xl font-bold">
              {currentNovel?.title || '加载中...'} - 人物管理
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character List */}
          <div className="lg:col-span-2 space-y-3">
            {characters.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground col-span-2">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>暂无角色</p>
                <p className="text-xs mt-1">在右侧添加第一个角色</p>
              </div>
            ) : (
              characters.map(char => (
                <div key={char.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {char.name}
                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                          {ROLE_OPTIONS.find(r => r.value === char.role)?.label}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          char.status === 'alive' ? 'bg-green-500/10 text-green-500' :
                          char.status === 'dead' ? 'bg-red-500/10 text-red-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {STATUS_OPTIONS.find(s => s.value === char.status)?.label}
                        </span>
                      </h3>
                      {char.personality && (
                        <p className="text-sm text-muted-foreground mt-1">{char.personality}</p>
                      )}
                      {char.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {char.traits.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(char)}>编辑</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(char.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Edit/Create Form */}
          <div className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold mb-4">{editingId ? '编辑角色' : '添加角色'}</h3>
            <div className="space-y-3">
              <Input
                placeholder="角色名 *"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="性别"
                  value={form.gender}
                  onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                />
                <Input
                  placeholder="年龄"
                  value={form.age}
                  onChange={e => setForm(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <Textarea
                placeholder="外貌描述"
                value={form.appearance}
                onChange={e => setForm(prev => ({ ...prev, appearance: e.target.value }))}
                rows={2}
              />
              <Textarea
                placeholder="性格特征"
                value={form.personality}
                onChange={e => setForm(prev => ({ ...prev, personality: e.target.value }))}
                rows={2}
              />
              <Textarea
                placeholder="背景故事"
                value={form.background}
                onChange={e => setForm(prev => ({ ...prev, background: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value as Character['role'] }))}
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value as Character['status'] }))}
                  className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">特质</label>
                <div className="flex flex-wrap gap-1">
                  {TRAIT_PRESETS.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTrait(t)}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${
                        form.traits.includes(t)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="备注"
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2 pt-2">
                {editingId ? (
                  <>
                    <Button size="sm" className="flex-1" onClick={handleUpdate}>保存</Button>
                    <Button size="sm" variant="outline" onClick={resetForm}>取消</Button>
                  </>
                ) : (
                  <Button size="sm" className="w-full" onClick={handleCreate} disabled={!form.name.trim()}>
                    添加角色
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
