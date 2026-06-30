import type { AIConfig } from '@/types'

/**
 * Stream chapter generation from OpenAI-compatible API.
 * Returns a ReadableStream<string> of text chunks.
 */
export async function generateChapterStream(
  config: AIConfig,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  onChunk?: (text: string) => void,
  onDone?: (fullText: string) => void,
  onError?: (err: Error) => void
): Promise<string> {
  const { apiUrl, apiKey, model, temperature, maxTokens } = config

  if (!apiKey) {
    throw new Error('请先在设置页面填写 API Key')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error')
    throw new Error(`API 请求失败 (${response.status}): ${errText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('浏览器不支持流式读取')
  }

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content || ''
          if (content) {
            fullText += content
            onChunk?.(content)
          }
        } catch {
          // JSON parse error - skip malformed chunks
        }
      }
    }
    onDone?.(fullText)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    onError?.(error)
    throw error
  }

  return fullText
}

/**
 * Non-streaming fallback for chapter generation.
 */
export async function generateChapterSimple(
  config: AIConfig,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const { apiUrl, apiKey, model, temperature, maxTokens } = config

  if (!apiKey) {
    throw new Error('请先在设置页面填写 API Key')
  }

  const response = await fetch(`${apiUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error')
    throw new Error(`API 请求失败 (${response.status}): ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
