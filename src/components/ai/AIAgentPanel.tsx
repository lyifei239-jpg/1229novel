import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Wand2, Sparkles, Copy, Check, Loader2, Send } from 'lucide-react'
import { generateChapterStream } from '@/lib/aiClient'
import { getAIConfig } from '@/lib/aiConfig'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/promptBuilder'

interface AIAgentPanelProps {
  chapterContent: string
  chapterTitle: string
  onInsert: (text: string) => void
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default function AIAgentPanel({ chapterContent, chapterTitle, onInsert }: AIAgentPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleGenerate = async () => {
    const config = getAIConfig()
    if (!config.apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ 请先在设置页面填写 API Key 和模型配置。'
      }])
      return
    }

    setStreaming(true)
    setStreamingText('')
    setMessages(prev => [...prev, { role: 'user', content: instruction }])

    try {
      const systemPrompt = buildSystemPrompt({
        title: '未知标题',
        genre: '',
        description: ''
      })

      const userPrompt = buildUserPrompt({
        novel: { title: '', genre: '', description: '' },
        characters: [],
        recentChapters: chapterContent ? [{ title: chapterTitle, content: chapterContent }] : [],
        outlineContent: '',
        outlineKeyPoints: [],
        userInstruction: instruction
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

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = (text: string) => {
    onInsert(text)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          AI 写作助手
        </h3>
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
                : 'bg-muted'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === 'assistant' && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    复制
                  </button>
                  <button
                    onClick={() => handleInsert(msg.content)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    插入编辑器
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
          onClick={handleGenerate}
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
