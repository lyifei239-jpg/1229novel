import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNovel } from '@/contexts/NovelContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BookOpen, Settings, Trash2 } from 'lucide-react'

export default function NovelListPage() {
  const { novels, loadNovels, deleteNovel, loading } = useNovel()
  const navigate = useNavigate()

  useEffect(() => {
    loadNovels()
  }, [])

  const handleCreate = () => {
    navigate('/novel/new')
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('确定要删除这部小说吗？此操作不可撤销。')) {
      await deleteNovel(id)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">1229Novel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              新建小说
            </Button>
          </div>
        </div>

        {/* Novel Grid */}
        {loading && novels.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            加载中...
          </div>
        ) : novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookOpen className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg mb-4">还没有小说，开始创作你的第一部作品吧</p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              新建小说
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {novels.map(novel => (
              <Card
                key={novel.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/novel/${novel.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1">
                    {novel.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => handleDelete(e, novel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {novel.description || '暂无简介'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 bg-muted rounded">{novel.genre || '未分类'}</span>
                    <span>{novel.word_count.toLocaleString()} 字</span>
                    <span>{novel.status === 'draft' ? '草稿' : novel.status === 'writing' ? '连载中' : '已完成'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
