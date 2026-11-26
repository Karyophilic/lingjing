// ============================================
// AI 配置中心 — API Key / Base URL / Model
// 全部保存在浏览器本地，不上传服务器
// ============================================

const CONFIG_KEY = 'lingjing_ai_config'
const LEGACY_KEY = 'lingjing_deepseek_key'

// 构建时注入的站点默认接口（VITE_DEFAULT_AI_*），用户可随时在设置里换成自己的
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {}

export const BUILTIN_CONFIG = {
  apiKey: (ENV.VITE_DEFAULT_AI_KEY || '').trim(),
  baseUrl: (ENV.VITE_DEFAULT_AI_BASE_URL || 'https://api.deepseek.com/v1').trim(),
  model: (ENV.VITE_DEFAULT_AI_MODEL || 'deepseek-chat').trim(),
}

export const DEFAULT_CONFIG = { ...BUILTIN_CONFIG }

export function hasBuiltinApi() {
  return BUILTIN_CONFIG.apiKey.length > 0
}

export function isUsingBuiltin() {
  if (!hasBuiltinApi()) return false
  const cfg = loadConfig()
  return cfg.apiKey === BUILTIN_CONFIG.apiKey
}

const PRESETS = [
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: '自定义', baseUrl: '', model: '' },
]

export function getPresets() {
  return PRESETS
}

function safeGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* 隐私模式等场景忽略 */ }
}

function normalizeBaseUrl(url) {
  const v = (url || '').trim().replace(/\/+$/, '')
  return v || DEFAULT_CONFIG.baseUrl
}

export function loadConfig() {
  let cfg = { ...DEFAULT_CONFIG }
  try {
    const raw = safeGet(CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      cfg = {
        // 留空时回退到站点内置接口
        apiKey: (parsed.apiKey || '').trim() || BUILTIN_CONFIG.apiKey,
        baseUrl: normalizeBaseUrl(parsed.baseUrl),
        model: (parsed.model || '').trim() || DEFAULT_CONFIG.model,
      }
    } else {
      // 迁移旧版本单独存储的 Key（直接写入，避免递归调用 loadConfig）
      const legacy = safeGet(LEGACY_KEY)
      if (legacy) {
        cfg.apiKey = legacy.trim()
        safeSet(CONFIG_KEY, JSON.stringify(cfg))
      }
    }
  } catch {
    cfg = { ...DEFAULT_CONFIG }
  }
  return cfg
}

export function saveConfig(patch) {
  const next = { ...loadConfig(), ...patch }
  next.apiKey = (next.apiKey || '').trim() || BUILTIN_CONFIG.apiKey
  next.baseUrl = normalizeBaseUrl(next.baseUrl)
  next.model = (next.model || '').trim() || DEFAULT_CONFIG.model
  safeSet(CONFIG_KEY, JSON.stringify(next))
  return next
}

export function clearConfig() {
  // 清空后回到站点内置接口（如果没有内置接口则为未配置）
  safeSet(CONFIG_KEY, JSON.stringify({ ...DEFAULT_CONFIG }))
  try { localStorage.removeItem(LEGACY_KEY) } catch { /* ignore */ }
}

export function getApiKey() {
  return loadConfig().apiKey
}

export function hasApiKey() {
  return getApiKey().length > 0
}

export function maskKey(key) {
  const v = (key || getApiKey()).trim()
  if (!v) return ''
  if (v.length <= 8) return '****'
  return v.slice(0, 4) + '****' + v.slice(-4)
}

export function getConfigSummary() {
  const cfg = loadConfig()
  return {
    configured: !!cfg.apiKey,
    builtin: hasBuiltinApi(),
    usingBuiltin: hasBuiltinApi() && cfg.apiKey === BUILTIN_CONFIG.apiKey,
    masked: maskKey(cfg.apiKey),
    baseUrl: cfg.baseUrl,
    model: cfg.model,
  }
}
