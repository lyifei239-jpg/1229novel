import type { AIConfig } from '@/types'

const AI_CONFIG_KEY = '1229novel-ai-config'

const PRESET_MODELS = [
  { label: 'DeepSeek', apiUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'OpenAI', apiUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'SiliconFlow', apiUrl: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3' },
  { label: '通义千问', apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { label: 'Kimi', apiUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
]

function defaultConfig(): AIConfig {
  return {
    apiUrl: PRESET_MODELS[0].apiUrl,
    apiKey: '',
    model: PRESET_MODELS[0].model,
    temperature: 0.8,
    maxTokens: 4096
  }
}

export function getAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return defaultConfig()
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config))
}

export function getPresetModels() {
  return PRESET_MODELS
}

export { PRESET_MODELS }
