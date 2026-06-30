import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'
import EditorToolbar from './EditorToolbar'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  editable?: boolean
}

export default function TipTapEditor({ content, onChange, editable = true }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[400px]',
      },
    },
  })

  const handleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const handleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const handleHeading = useCallback((level: 1 | 2 | 3) => {
    editor?.chain().focus().toggleHeading({ level }).run()
  }, [editor])

  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run()
  }, [editor])

  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run()
  }, [editor])

  return (
    <div className="border rounded-lg bg-card">
      <EditorToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        onHeading={handleHeading}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <EditorContent editor={editor} className="px-1" />
    </div>
  )
}
