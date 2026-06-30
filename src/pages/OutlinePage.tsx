import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Wand2,
  Loader2
} from 'lucide-react'
import type { Outline } from '@/types'
import { generateChapterSimple } from '@/lib/aiClient'
import { getAIConfig } from '@/lib/aiConfig'
import { buildOutlineSuggestionSystemPrompt, buildOutlineSuggestionUserPrompt } from '@/lib/promptBuilder'

interface OutlineSuggestion {
  title: string
  content: string
  keyPoints: string[]
}

export default function OutlinePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { outlines, loadOutlines, createOutline, updateOutline, deleteOutline, currentNovel } = useNovel()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editKeyPoints, setEditKeyPoints] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<OutlineSuggestion | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (id) loadOutlines(id)
  }, [id])

  const handleCreate = async () => {
    if (!id) return
    const order = outlines.length + 1
    await createOutline({
      novel_id: id,
      title: `剧情要点 ${order}`,
      content: '',
      key_points: [],
      order
    })
  }

  const handleAIGenerate = async () => {
    const config = getAIConfig()
    if (!config.apiKey || !id) return
    setAiLoading(true)
    setAiSuggestion(null)
    try {
      const systemPrompt = buildOutlineSuggestionSystemPrompt({
        title: currentNovel?.title || '',
        genre: currentNovel?.genre || '',
        description: currentNovel?.description || ''
      })
      const userPrompt = buildOutlineSuggestionUserPrompt(aiInput)
      const result = await generateChapterSimple(config, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as OutlineSuggestion
        setAiSuggestion(parsed)
      }
    } catch (err) {
      console.error('AI 大纲生成失败', err)
    } finally {
      setAiLoading(false)
    }
  }

  const applyOutlineSuggestion = async () => {
    if (!id || !aiSuggestion) return
    const order = outlines.length + 1
    await createOutline({
      novel_id: id,
      title: aiSuggestion.title,
      content: aiSuggestion.content,
      key_points: aiSuggestion.keyPoints,
      order
    })
    setAiSuggestion(null)
    setAiInput('')
  }

  const startEdit = (outline: Outline) => {
    setEditingId(outline.id)
    setEditTitle(outline.title)
    setEditContent(outline.content)
    setEditKeyPoints((outline.key_points || []).join('\n'))
  }

  const handleSave = async () => {
    if (!editingId) return
    await updateOutline(editingId, {
      title: editTitle,
      content: editContent,
      key_points: editKeyPoints.split('\n').filter(k => k.trim())
    })
    setEditingId(null)
  }

  const handleDelete = async (outlineId: string) => {
    if (confirm('确定删除这条大纲吗？')) {
      await deleteOutline(outlineId)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(`/novel/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-xl font-bold">
              {currentNovel?.title || '加载中...'} - 大纲管理
            </h1>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            新建大纲
          </Button>
        </div>

        {/* AI Outline Suggestion */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              AI 生成大纲
            </h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="输入大纲方向，如：主角初入宗门"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiInput.trim()}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-1" />
                )}
                AI 生成大纲
              </Button>
            </div>

            {aiSuggestion && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-semibold text-sm mb-2">{aiSuggestion.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{aiSuggestion.content}</p>
                {aiSuggestion.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {aiSuggestion.keyPoints.map((kp, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {kp}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={applyOutlineSuggestion}>
                    使用此大纲
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setAiSuggestion(null)}>
                    取消
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {outlines.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>暂无大纲</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleCreate}>
                创建第一条大纲
              </Button>
            </div>
          ) : (
            outlines.map(outline => (
              <div key={outline.id} className="border rounded-lg p-4 bg-card">
                {editingId === outline.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="大纲标题"
                    />
                    <Textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      placeholder="大纲内容"
                      rows={4}
                    />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">关键剧情点（每行一个）</label>
                      <Textarea
                        value={editKeyPoints}
                        onChange={e => setEditKeyPoints(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>保存</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{outline.title}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(outline)}>编辑</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(outline.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{outline.content}</p>
                    {outline.key_points.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {outline.key_points.map((kp, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded">
                            {kp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
