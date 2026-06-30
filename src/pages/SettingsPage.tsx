import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAIConfig, saveAIConfig, getPresetModels } from '@/lib/aiConfig'
import type { AIConfig } from '@/types'
import { ArrowLeft, Save, Key, Globe, Sliders } from 'lucide-react'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<AIConfig>(getAIConfig())
  const [saved, setSaved] = useState(false)

  const presets = getPresetModels()

  const applyPreset = (preset: typeof presets[0]) => {
    setConfig(prev => ({
      ...prev,
      apiUrl: preset.apiUrl,
      model: preset.model
    }))
  }

  const handleSave = () => {
    saveAIConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <Sliders className="h-6 w-6" />
          AI 模型配置
        </h1>

        <div className="space-y-6">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                快速选择模型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <Button
                    key={p.label}
                    variant={config.apiUrl === p.apiUrl ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(p)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Manual Config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                手动配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API 地址</label>
                <Input
                  placeholder="https://api.deepseek.com/v1"
                  value={config.apiUrl}
                  onChange={e => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  支持所有兼容 OpenAI API 格式的服务
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={config.apiKey}
                  onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Key 仅保存在浏览器的 localStorage 中，不会上传到服务器
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">模型名称</label>
                <Input
                  placeholder="deepseek-chat"
                  value={config.model}
                  onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">温度 (Temperature)</label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={config.temperature}
                    onChange={e => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.8 }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    较低=更确定，较高=更有创意
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">最大 Token</label>
                  <Input
                    type="number"
                    min={256}
                    max={16384}
                    step={256}
                    value={config.maxTokens}
                    onChange={e => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 4096 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? '已保存 ✓' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  )
}
