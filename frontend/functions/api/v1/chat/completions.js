// ============================================
// 灵境 AI 代理 — Cloudflare Pages Function
// 路径：/api/v1/chat/completions（与 OpenAI 接口同形）
// 站点 Key 只存在 Pages 环境变量里，不下发到浏览器
// ============================================

const ALLOWED_ORIGIN =
  /^https:\/\/([a-z0-9-]+\.)*pages\.dev$|^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^https:\/\/karyophilic\.github\.io$|^http:\/\/localhost(:\d+)?$/i

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

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

export async function onRequest(context) {
  const { request, env } = context
  const origin = request.headers.get('Origin') || ''
  const cors = {}
  if (origin && ALLOWED_ORIGIN.test(origin)) {
    cors['Access-Control-Allow-Origin'] = origin
    cors['Vary'] = 'Origin'
  }
  cors['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  cors['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const UPSTREAM = (env.AI_UPSTREAM_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
  const MODEL = env.AI_MODEL || 'deepseek-chat'
  const API_KEY = env.AI_API_KEY || env.DEEPSEEK_API_KEY || ''

  if (request.method === 'GET') {
    return json({ ok: true, model: MODEL, configured: !!API_KEY }, 200, cors)
  }

  if (request.method !== 'POST') {
    return json({ error: { message: 'Method not allowed' } }, 405, cors)
  }

  if (!API_KEY) {
    return json(
      { error: { message: '站点内置 API Key 未配置（AI_API_KEY / DEEPSEEK_API_KEY）' } },
      500,
      cors,
    )
  }

  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'unknown'
  if (rateLimited(ip)) {
    return json({ error: { message: '请求太频繁了，请稍后再试' } }, 429, cors)
  }

  const body = await request.json().catch(() => null)
  const messages = sanitizeMessages(body?.messages)
  if (messages.length === 0) {
    return json({ error: { message: 'messages 不能为空' } }, 400, cors)
  }

  const temperature = Number(body?.temperature)
  const maxTokens = Number(body?.max_tokens)

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
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...cors,
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return json({ error: { message: '上游 AI 服务暂时不可用' } }, 502, cors)
  }
}
