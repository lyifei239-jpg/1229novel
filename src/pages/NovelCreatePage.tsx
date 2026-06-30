import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Sparkles } from 'lucide-react'

const GENRE_OPTIONS = ['玄幻', '武侠', '都市', '修仙', '科幻', '悬疑', '言情', '历史', '游戏', '轻小说']

export default function NovelCreatePage() {
  const navigate = useNavigate()
  const { createNovel } = useNovel()
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const novel = await createNovel({
        title: title.trim(),
        genre: genre || '未分类',
        description: description.trim(),
        cover_url: '',
        status: 'draft',
        word_count: 0,
        char_count: 0,
        volumes: []
      })
      navigate(`/novel/${novel.id}`)
    } catch (err) {
      console.error('创建失败', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">新建小说</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">小说标题 *</label>
            <Input
              placeholder="输入小说标题"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">题材</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(g => (
                <Button
                  key={g}
                  variant={genre === g ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGenre(g)}
                  className="rounded-full"
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">简介</label>
            <Textarea
              placeholder="写一段小说的简介..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
              {saving ? '创建中...' : '开始创作'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
