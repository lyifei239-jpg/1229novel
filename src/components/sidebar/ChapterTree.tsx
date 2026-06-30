import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Chapter } from '@/types'

interface ChapterTreeProps {
  chapters: Chapter[]
  currentChapterId?: string
  onSelect: (chapter: Chapter) => void
}

export default function ChapterTree({ chapters, currentChapterId, onSelect }: ChapterTreeProps) {
  return (
    <div className="space-y-0.5">
      {chapters.map(chapter => (
        <button
          key={chapter.id}
          onClick={() => onSelect(chapter)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left',
            'hover:bg-muted',
            currentChapterId === chapter.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-foreground'
          )}
        >
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
          <span className="truncate">{chapter.title}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {chapter.word_count > 0 ? `${(chapter.word_count / 1000).toFixed(1)}k` : ''}
          </span>
        </button>
      ))}
      {chapters.length === 0 && (
        <p className="text-xs text-muted-foreground px-3 py-4 text-center">
          暂无章节
        </p>
      )}
    </div>
  )
}
