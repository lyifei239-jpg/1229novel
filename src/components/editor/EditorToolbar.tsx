import { Button } from '@/components/ui/button'
import { Bold, Italic, Heading1, Heading2, Heading3, Undo, Redo } from 'lucide-react'

interface EditorToolbarProps {
  onBold: () => void
  onItalic: () => void
  onHeading: (level: 1 | 2 | 3) => void
  onUndo: () => void
  onRedo: () => void
}

export default function EditorToolbar({ onBold, onItalic, onHeading, onUndo, onRedo }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b bg-muted/30 rounded-t-lg">
      <Button variant="ghost" size="sm" onClick={onBold} title="加粗">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onItalic} title="斜体">
        <Italic className="h-4 w-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-1" />
      <Button variant="ghost" size="sm" onClick={() => onHeading(1)} title="标题1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onHeading(2)} title="标题2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onHeading(3)} title="标题3">
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="w-px h-5 bg-border mx-1" />
      <Button variant="ghost" size="sm" onClick={onUndo} title="撤销">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onRedo} title="重做">
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}
