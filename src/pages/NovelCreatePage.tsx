import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Loader2, Wand2 } from 'lucide-react'
import { generateChapterSimple } from '@/lib/aiClient'
import { getAIConfig } from '@/lib/aiConfig'
import { buildNovelSuggestionSystemPrompt, buildNovelSuggestionUserPrompt } from '@/lib/promptBuilder'

interface NovelSuggestion {
  title: string
  genre: string
  description: string
}

const GENRE_OPTIONS = ['玄幻', '武侠', '都市', '修仙', '科幻', '悬疑', '言情', '历史', '游戏', '轻小说']

export default function NovelCreatePage() {
  const navigate = useNavigate()
  const { createNovel } = useNovel()
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<NovelSuggestion[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const handleAIGenerate = async () => {
    const config = getAIConfig()
    if (!config.apiKey) {
      return
    }
    setAiLoading(true)
    setAiSuggestions([])
    try {
      const systemPrompt = buildNovelSuggestionSystemPrompt()
      const userPrompt = buildNovelSuggestionUserPrompt(aiInput)
      const result = await generateChapterSimple(config, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])
      // Try to parse JSON from the response
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as NovelSuggestion[]
        setAiSuggestions(parsed.slice(0, 3))
      }
    } catch (err) {
      console.error('AI 生成失败', err)
    } finally {
      setAiLoading(false)
    }
  }

  const applySuggestion = (suggestion: NovelSuggestion) => {
    setTitle(suggestion.title)
    setGenre(suggestion.genre)
    setDescription(suggestion.description)
    setAiSuggestions([])
    setAiInput('')
  }

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

          {/* AI Suggestion Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              让 AI 帮你构思
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="输入小说方向，如：写一本修仙小说"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiInput.trim()}
                variant="secondary"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-1" />
                )}
                AI 帮我生成
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {aiSuggestions.map((s, i) => (
                  <Card
                    key={i}
                    className="cursor-pointer hover:border-primary/60 transition-colors"
                    onClick={() => applySuggestion(s)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
                      <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded inline-block mb-2">
                        {s.genre}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-3">{s.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
