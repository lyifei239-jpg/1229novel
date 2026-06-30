import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TipTapEditor from '@/components/editor/TipTapEditor'
import ChapterTree from '@/components/sidebar/ChapterTree'
import AIAgentPanel from '@/components/ai/AIAgentPanel'
import NovelStats from '@/components/stats/NovelStats'
import {
  ArrowLeft,
  Save,
  Wand2,
  BookOpen,
  ListTree,
  Users,
  Menu,
  X
} from 'lucide-react'
import type { Chapter } from '@/types'
import { countWords } from '@/lib/utils'

export default function NovelEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    currentNovel, chapters, loadNovel,
    updateChapter, createChapter
  } = useNovel()

  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [chapterTitle, setChapterTitle] = useState('')
  const [chapterContent, setChapterContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (id) loadNovel(id)
  }, [id])

  // Auto save
  const saveChapter = useCallback(async () => {
    if (!currentChapter) return
    setSaving(true)
    try {
      const words = countWords(chapterContent)
      await updateChapter(currentChapter.id, {
        title: chapterTitle,
        content: chapterContent,
        word_count: words
      })
    } finally {
      setSaving(false)
    }
  }, [currentChapter, chapterTitle, chapterContent])

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(saveChapter, 3000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [chapterContent, chapterTitle])

  // Select chapter
  const handleSelectChapter = useCallback((chapter: Chapter) => {
    saveChapter().then(() => {
      setCurrentChapter(chapter)
      setChapterTitle(chapter.title)
      setChapterContent(chapter.content)
    })
  }, [saveChapter])

  const handleNewChapter = useCallback(async () => {
    if (!id || !currentNovel) return
    const order = chapters.length + 1
    const chapter = await createChapter({
      novel_id: id,
      volume_id: '',
      volume_name: `第${(currentNovel.volumes?.length || 0) + 1}卷`,
      title: `第${order}章`,
      content: '',
      word_count: 0,
      status: 'draft',
      order
    })
    setCurrentChapter(chapter)
    setChapterTitle(chapter.title)
    setChapterContent('')
  }, [id, currentNovel, chapters, createChapter])

  const handleContentChange = useCallback((content: string) => {
    setChapterContent(content)
  }, [])

  const handleAIInsert = useCallback((text: string) => {
    setChapterContent(prev => prev + '\n\n' + text)
  }, [])

  const handleAIReplace = useCallback((text: string) => {
    setChapterContent(text)
  }, [])

  if (!currentNovel) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        加载中...
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <span className="font-semibold text-sm truncate max-w-[200px]">
            {currentNovel.title}
          </span>
          {saving && <span className="text-xs text-muted-foreground">保存中...</span>}
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/novel/${id}/outline`}>
            <Button variant="ghost" size="sm">
              <ListTree className="h-4 w-4 mr-1" />
              大纲
            </Button>
          </Link>
          <Link to={`/novel/${id}/characters`}>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-1" />
              角色
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            AI
          </Button>
          <Button variant="ghost" size="sm" onClick={saveChapter}>
            <Save className="h-4 w-4 mr-1" />
            保存
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Chapter Tree */}
        {showSidebar && (
          <aside className="w-64 border-r bg-muted/20 flex flex-col">
            <div className="p-3 border-b">
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={handleNewChapter}
              >
                新建章节
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                章节目录
              </h3>
              <ChapterTree
                chapters={chapters}
                currentChapterId={currentChapter?.id}
                onSelect={handleSelectChapter}
              />
            </div>
            <div className="p-3 border-t">
              <NovelStats chapters={chapters} />
            </div>
          </aside>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentChapter ? (
            <>
              <div className="px-6 pt-4">
                <Input
                  value={chapterTitle}
                  onChange={e => setChapterTitle(e.target.value)}
                  className="text-xl font-bold border-none bg-transparent px-0 focus-visible:ring-0"
                  placeholder="章节标题"
                />
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-32">
                <TipTapEditor
                  content={chapterContent}
                  onChange={handleContentChange}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>选择一个章节开始编辑</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleNewChapter}
                >
                  新建章节
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right AI Panel */}
        {showAIPanel && (
          <aside className="w-80 border-l bg-muted/20 flex flex-col">
            <AIAgentPanel
              chapterContent={chapterContent}
              chapterTitle={chapterTitle}
              onInsert={handleAIInsert}
              onReplace={handleAIReplace}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
