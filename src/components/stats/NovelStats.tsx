import { Progress } from '@/components/ui/progress'
import type { Chapter } from '@/types'

interface NovelStatsProps {
  chapters: Chapter[]
}

export default function NovelStats({ chapters }: NovelStatsProps) {
  const totalChapters = chapters.length
  const totalWords = chapters.reduce((sum, c) => sum + (c.word_count || 0), 0)
  const draftChapters = chapters.filter(c => c.status === 'draft').length

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        统计
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">章节</span>
          <p className="font-semibold">{totalChapters}</p>
        </div>
        <div>
          <span className="text-muted-foreground">字数</span>
          <p className="font-semibold">{totalWords.toLocaleString()}</p>
        </div>
      </div>
      {totalChapters > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>完成进度</span>
            <span>{Math.round(((totalChapters - draftChapters) / totalChapters) * 100)}%</span>
          </div>
          <Progress value={((totalChapters - draftChapters) / totalChapters) * 100} className="h-1.5" />
        </div>
      )}
    </div>
  )
}
