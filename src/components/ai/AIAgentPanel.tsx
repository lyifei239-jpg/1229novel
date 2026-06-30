import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Wand2, Sparkles, Copy, Check, Loader2, Send, RefreshCw, CheckCheck } from 'lucide-react'
import { generateChapterStream } from '@/lib/aiClient'
import { getAIConfig } from '@/lib/aiConfig'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/promptBuilder'

interface AIAgentPanelProps {
  chapterContent: string
  chapterTitle: string
  onInsert: (text: string) => void
  onReplace?: (text: string) => void
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const PRESET_PROMPTS = [
  { label: '生成下一章', prompt: '请续写下一章内容，保持风格连贯，情节自然推进。' },
  { label: '润色本章', prompt: '请润色优化本章内容，改进语言表达、语句流畅度和文字质感，保留原有情节不变。' },
  { label: '扩写本章', prompt: '请扩写本章内容，增加环境描写、心理活动、动作细节和对话，使内容更加丰富生动。' },
  { label: '生成人物对话', prompt: '请为本章生成更多人物对话，通过对话展现角色性格，推动情节发展。' },
]

export default function AIAgentPanel({ chapterContent, chapterTitle, onInsert, onReplace }: AIAgentPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [lastInstruction, setLastInstruction] = useState('')
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleGenerate = async (customInstruction?: string) => {
    const config = getAIConfig()
    if (!config.apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ 请先在设置页面填写 API Key 和模型配置。'
      }])
      return
    }

    const instr = customInstruction || instruction
    if (!instr.trim()) return

    setStreaming(true)
    setStreamingText('')
    setSelectedVersion(null)
    setLastInstruction(instr)
    setMessages(prev => [...prev, { role: 'user', content: instr }])

    try {
      const systemPrompt = buildSystemPrompt({
        title: chapterTitle || '未知标题',
        genre: '',
        description: ''
      })

      const userPrompt = buildUserPrompt({
        novel: { title: chapterTitle || '', genre: '', description: '' },
        characters: [],
        recentChapters: chapterContent ? [{ title: chapterTitle, content: chapterContent }] : [],
        outlineContent: '',
        outlineKeyPoints: [],
        userInstruction: instr
      })

      let fullText = ''
      await generateChapterStream(
        config,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        (chunk) => {
          fullText += chunk
          setStreamingText(fullText)
        },
        (finalText) => {
          setMessages(prev => [...prev, { role: 'assistant', content: finalText }])
          setStreamingText('')
          setStreaming(false)
        },
        (err) => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ 生成失败：${err.message}`
          }])
          setStreamingText('')
          setStreaming(false)
        }
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : '生成失败'
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${msg}` }])
      setStreaming(false)
    }

    setInstruction('')
  }

  const handlePresetClick = (prompt: string) => {
    setInstruction(prompt)
  }

  const handleCopy = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInsert = (text: string) => {
    onInsert(text)
  }

  const handleRegenerate = () => {
    if (lastInstruction) {
      handleGenerate(lastInstruction)
    }
  }

  const handleUseVersion = (index: number) => {
    setSelectedVersion(index)
    const msg = messages[index]
    if (msg && msg.role === 'assistant' && onReplace) {
      onReplace(msg.content)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          AI 写作助手
        </h3>
      </div>

      {/* Preset Prompts */}
      <div className="px-4 py-2 border-b bg-muted/20">
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePresetClick(preset.prompt)}
              className="text-xs px-2 py-1 rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>输入写作要求</p>
            <p className="text-xs">AI 将为你生成章节内容</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : selectedVersion === i ? 'bg-primary/10 border border-primary/30' : 'bg-muted'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleCopy(msg.content, i)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedId === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    复制
                  </button>
                  <button
                    onClick={() => handleInsert(msg.content)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    插入编辑器
                  </button>
                  <button
                    onClick={() => handleUseVersion(i)}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="h-3 w-3" />
                    使用此版本
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    重新生成
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {streaming && streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-3 text-sm bg-muted">
              <p className="whitespace-pre-wrap">{streamingText}</p>
              <span className="ai-cursor" />
            </div>
          </div>
        )}

        {streaming && !streamingText && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            placeholder="输入本章写作要求..."
            className="min-h-[60px] text-sm resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate()
              }
            }}
          />
        </div>
        <Button
          className="w-full mt-2"
          size="sm"
          onClick={() => handleGenerate()}
          disabled={streaming || !instruction.trim()}
        >
          {streaming ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              生成
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
