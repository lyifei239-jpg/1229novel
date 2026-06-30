import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

export function countWords(text: string): number {
  const cleaned = stripHtml(text)
  // Count Chinese characters + English words
  const chineseChars = (cleaned.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = cleaned
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0).length
  return chineseChars + englishWords
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
