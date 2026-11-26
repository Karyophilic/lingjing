// ============================================
// 灵境 AI 代理 — Vercel Serverless Function
// 站点内置 Key 只存在服务端环境变量里，不下发到浏览器
// 路径：/api/v1/chat/completions（与 OpenAI 接口同形）
// ============================================

const UPSTREAM = (process.env.AI_UPSTREAM_URL || 'https://api.deepseek.com/v1')
  .replace(/\/+$/, '')
const MODEL = process.env.AI_MODEL || 'deepseek-chat'
const API_KEY = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || ''

const ALLOWED_ORIGIN =
  /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^https:\/\/karyophilic\.github\.io$|^http:\/\/localhost(:\d+)?$/i

// 简单的进程内限流：每个实例独立，只作为兜底
const buckets = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const recent = (buckets.get(ip) || []).filter((t) => now - t < 60_000)
  if (recent.length >= 30) {
    buckets.set(ip, recent)
    return true
  }
  recent.push(now)
  buckets.set(ip, recent)
  if (buckets.size > 5000) buckets.clear()
  return false
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(-20)
    .filter((m) => m && typeof m === 'object')
    .map((m) => ({
      role: ['system', 'user', 'assistant'].includes(m.role) ? m.role : 'user',
      content: String(m.content ?? '').slice(0, 4000),
    }))
    .filter((m) => m.content.length > 0)
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (origin && ALLOWED_ORIGIN.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()

  // 健康检查
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, model: MODEL, configured: !!API_KEY })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: { message: '站点内置 API Key 未配置（AI_API_KEY / DEEPSEEK_API_KEY）' },
    })
  }

  const ip =
    String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  if (rateLimited(ip)) {
    return res.status(429).json({ error: { message: '请求太频繁了，请稍后再试' } })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const messages = sanitizeMessages(body.messages)
  if (messages.length === 0) {
    return res.status(400).json({ error: { message: 'messages 不能为空' } })
  }

  const temperature = Number(body.temperature)
  const maxTokens = Number(body.max_tokens)

  const payload = {
    model: MODEL,
    messages,
    temperature: Number.isFinite(temperature) ? Math.min(Math.max(temperature, 0), 1.2) : 0.7,
    max_tokens: Number.isFinite(maxTokens) ? Math.min(Math.max(maxTokens, 1), 600) : 500,
    stream: false,
  }

  try {
    const upstream = await fetch(`${UPSTREAM}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const text = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    return res.send(text)
  } catch {
    return res.status(502).json({ error: { message: '上游 AI 服务暂时不可用' } })
  }
}
