import { useEffect, useState } from 'react'
import {
  Settings, Key, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, Trash2, ExternalLink, X,
} from 'lucide-react'
import {
  loadConfig, saveConfig, clearConfig, getPresets, maskKey,
  DEFAULT_CONFIG, BUILTIN_CONFIG, hasBuiltinApi, isUsingBuiltin,
} from '../api/aiConfig'
import { testConnection, friendlyErrorMessage } from '../api/deepseek'

export default function ApiSettingsModal({ open, onClose, onSaved }) {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState(DEFAULT_CONFIG.baseUrl)
  const [model, setModel] = useState(DEFAULT_CONFIG.model)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // { ok, text }
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    if (!open) return
    const cfg = loadConfig()
    setApiKey(cfg.apiKey)
    setBaseUrl(cfg.baseUrl)
    setModel(cfg.model)
    setShowKey(false)
    setTesting(false)
    setTestResult(null)
    setSavedMsg('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const presets = getPresets()
  const hasKey = apiKey.trim().length > 0
  const builtinAvailable = hasBuiltinApi()
  const useBuiltin = builtinAvailable && apiKey.trim() === BUILTIN_CONFIG.apiKey
  const canSave = (hasKey || builtinAvailable) && /^https?:\/\/.+/i.test(baseUrl.trim())

  const applyPreset = (p) => {
    if (!p.baseUrl) return
    setBaseUrl(p.baseUrl)
    setModel(p.model)
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!hasKey && !builtinAvailable) {
      setTestResult({ ok: false, text: '先填入 API Key 再测试。' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const ms = await testConnection({
        apiKey: apiKey.trim() || undefined,
        baseUrl,
        model,
      })
      setTestResult({ ok: true, text: `连接成功，耗时 ${ms}ms` })
    } catch (e) {
      setTestResult({ ok: false, text: friendlyErrorMessage(e) })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    saveConfig({ apiKey, baseUrl, model })
    onSaved?.()
    setSavedMsg('已保存')
    setTimeout(() => onClose?.(), 300)
  }

  const handleClear = () => {
    if (!window.confirm('确定清除本地保存的 API Key 吗？')) return
    clearConfig()
    setApiKey('')
    setTestResult(null)
    onSaved?.()
    setSavedMsg('已清除')
  }

  // 支持绝对地址或同源相对路径（如站点代理 /api/v1）
  const urlOk = /^(https?:\/\/.+|\/.+)$/i.test(baseUrl.trim())

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="AI 接口设置"
    >
      <div
        className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Settings size={18} /> AI 接口设置
          </h3>
          <button onClick={onClose} className="p-1 -mr-1 rounded-lg hover:bg-gray-100" aria-label="关闭">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          支持任何 OpenAI 兼容接口。不填则使用站点内置接口；自己填写的 Key 只保存在本机浏览器。
        </p>

        {useBuiltin && (
          <div className="mb-3 p-3 rounded-xl bg-green-50 text-xs text-green-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            正在使用站点内置接口（{BUILTIN_CONFIG.model}），开箱即用
          </div>
        )}

        {/* 预设 */}
        <div className="flex gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                p.baseUrl && baseUrl === p.baseUrl
                  ? 'bg-primary-50 border-primary-200 text-primary-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-primary-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* API Key */}
        <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="ai-key">
          API Key
        </label>
        <div className="relative mb-3">
          <input
            id="ai-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestResult(null) }}
            placeholder={builtinAvailable ? '留空则使用站点内置接口' : 'sk-...'}
            autoComplete="off"
            spellCheck={false}
            className="input text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
            aria-label={showKey ? '隐藏 Key' : '显示 Key'}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Base URL */}
        <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="ai-base">
          Base URL
        </label>
        <input
          id="ai-base"
          type="url"
          value={baseUrl}
          onChange={(e) => { setBaseUrl(e.target.value); setTestResult(null) }}
          placeholder="https://api.deepseek.com/v1"
          spellCheck={false}
          className={`input text-sm mb-1 ${urlOk ? '' : 'border-red-300'}`}
        />
        {!urlOk && <p className="text-[11px] text-red-400 mb-2">需要以 http(s):// 开头，或填以 / 开头的同源路径</p>}

        {/* Model */}
        <label className="block text-xs font-medium text-gray-600 mb-1.5 mt-2" htmlFor="ai-model">
          Model
        </label>
        <input
          id="ai-model"
          type="text"
          value={model}
          onChange={(e) => { setModel(e.target.value); setTestResult(null) }}
          placeholder="deepseek-chat"
          spellCheck={false}
          className="input text-sm mb-3"
        />

        {/* 状态 */}
        {testResult && (
          <div className={`mb-3 p-3 rounded-xl text-xs flex items-start gap-2 ${
            testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {testResult.ok
              ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
              : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
            <span>{testResult.text}</span>
          </div>
        )}

        {savedMsg && (
          <div className="mb-3 p-3 rounded-xl text-xs bg-primary-50 text-primary-600">
            {savedMsg}
          </div>
        )}

        {/* 操作 */}
        <div className="flex gap-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="btn-ghost text-sm flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="btn-primary text-sm flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <a
            href="https://platform.deepseek.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-400 hover:text-primary-500 inline-flex items-center gap-1"
          >
            获取 DeepSeek Key <ExternalLink size={10} />
          </a>
          {hasKey && !useBuiltin && (
            <button
              onClick={handleClear}
              className="text-[11px] text-gray-400 hover:text-red-500 inline-flex items-center gap-1"
            >
              <Trash2 size={10} /> {builtinAvailable ? '恢复默认接口' : '清除 Key'}
            </button>
          )}
        </div>

        {hasKey && (
          <p className="text-[10px] text-gray-300 mt-2 text-center">
            当前：{useBuiltin ? '站点内置 Key' : maskKey(apiKey)} · {model || '未填模型'}
          </p>
        )}
      </div>
    </div>
  )
}
