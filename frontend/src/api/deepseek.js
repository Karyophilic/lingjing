// ============================================
// AI 客户端 — 任意 OpenAI 兼容接口（默认 DeepSeek）
// 支持自定义 Base URL / Model，Key 只存在浏览器本地
// ============================================

import { loadConfig, hasApiKey as _hasApiKey, maskKey, saveConfig } from './aiConfig'
import {
  XIAOLINGER_SYSTEM,
  SCOPE_REMINDER,
  OFF_TOPIC_PREFIX,
  sanitizeHistory,
  getLocalOffTopicReply,
} from './prompts'

export const hasApiKey = _hasApiKey

// 兼容旧调用
export function setApiKey(key) {
  saveConfig({ apiKey: key })
}

export function getApiKeyMasked() {
  return maskKey()
}

function makeError(code, detail = '') {
  const err = new Error(detail || code)
  err.code = code
  return err
}

export function friendlyErrorMessage(err) {
  const code = err?.code || err?.message
  const map = {
    NO_API_KEY: '还没有配置 API Key，先去设置里填一个吧。',
    API_KEY_INVALID: 'API Key 无效，请检查是否复制完整。',
    QUOTA_EXCEEDED: '账户额度不足，请到 API 平台充值后再试。',
    RATE_LIMITED: '请求太频繁了，休息几秒再试。',
    TIMEOUT: '请求超时了，检查一下网络再试。',
    NETWORK_ERROR: '网络连接失败，可能是网络不稳定或被浏览器拦截。',
    SERVER_ERROR: 'AI 服务暂时不可用，稍后再试。',
  }
  return map[code] || err?.message || 'AI 调用失败，请稍后再试。'
}

async function apiCall(messages, {
  temperature = 0.7,
  max_tokens = 500,
  model,
  apiKey,
  baseUrl,
  timeoutMs = 60000,
} = {}) {
  const cfg = loadConfig()
  const key = (apiKey ?? cfg.apiKey).trim()
  if (!key) throw makeError('NO_API_KEY')

  const base = (baseUrl ?? cfg.baseUrl).replace(/\/+$/, '')
  const mdl = (model ?? cfg.model).trim()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: mdl,
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
      signal: controller.signal,
    })
  } catch (e) {
    if (e?.name === 'AbortError') throw makeError('TIMEOUT')
    throw makeError('NETWORK_ERROR')
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data?.error?.message || ''
    if (res.status === 401) throw makeError('API_KEY_INVALID', msg)
    if (res.status === 402) throw makeError('QUOTA_EXCEEDED', msg)
    if (res.status === 429) throw makeError('RATE_LIMITED', msg)
    if (res.status >= 500) throw makeError('SERVER_ERROR', msg)
    throw makeError('API_ERROR', msg || `API 请求失败 (${res.status})`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

/** 通用对话 */
export async function chat(messages, options) {
  return apiCall(messages, options)
}

/** 测试连接：用最小请求验证 Key / Base URL / Model */
export async function testConnection({ apiKey, baseUrl, model }) {
  const started = Date.now()
  await apiCall(
    [{ role: 'user', content: '只回复两个字：连接成功' }],
    { apiKey, baseUrl, model, temperature: 0, max_tokens: 10, timeoutMs: 20000 },
  )
  return Date.now() - started
}

function stripCodeFence(text) {
  let s = (text || '').trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '').trim()
  }
  return s
}

/** 小灵儿角色对话 — 严格限定在灵感话题内 */
export async function chatWithXiaolinger(userMessage, history = [], userInspirations = []) {
  const text = (userMessage || '').trim().slice(0, 1000)
  if (!text) return ''

  // 明显越界的请求在本地直接拦截，不消耗 API 额度
  const localReply = getLocalOffTopicReply(text)
  if (localReply) return localReply

  let context = ''
  if (userInspirations.length > 0) {
    const titles = userInspirations.slice(0, 5).map((i) => `"${i.title}"`).join('、')
    context = `\n\n【用户最近记录的灵感】${titles}\n如果相关，可以自然地从这些灵感切入。`
  }

  let safeHistory = sanitizeHistory(history)
  // 调用方可能已经把本轮消息放进 history，避免重复
  const last = safeHistory[safeHistory.length - 1]
  if (last && last.role === 'user' && last.content.trim() === text) {
    safeHistory = safeHistory.slice(0, -1)
  }

  const messages = [
    { role: 'system', content: XIAOLINGER_SYSTEM + context },
    ...safeHistory,
    { role: 'system', content: SCOPE_REMINDER },
    { role: 'user', content: text },
  ]

  const reply = stripCodeFence(
    await apiCall(messages, { temperature: 0.6, max_tokens: 350 }),
  )
  return normalizeScopeReply(reply)
}

/** 保证拒绝格式统一：无关回答必须以固定前缀开头 */
function normalizeScopeReply(reply) {
  if (!reply) return '我刚刚走神了，再说一遍？你最近有什么想做的小东西吗？'
  const idx = reply.indexOf(OFF_TOPIC_PREFIX)
  if (idx > 0) {
    // 模型在前面加了寒暄，截掉，保证前缀在开头
    return reply.slice(idx).trim()
  }
  return reply
}

/** 分析灵感之间的关联 */
export async function analyzeInspirationConnections(inspirations) {
  const inspList = inspirations.map((i, idx) =>
    `${idx + 1}. "${i.title}"（标签：${(i.tags || []).join('、')}）——${(i.content || '').slice(0, 100)}`
  ).join('\n')

  const messages = [
    {
      role: 'system',
      content: `你是灵感分析专家。用户选择了几个灵感，请分析它们之间可能的关联。

要求：
1. 找出共同主题、互补关系或有趣的联系，不要泛泛而谈
2. 语气活泼，像朋友分享发现
3. 提出 1-2 个可执行的结合建议
4. 150 字以内，最多 2 个 emoji
5. 只输出分析正文，不要标题，不要 markdown 列表`,
    },
    { role: 'user', content: `请分析以下灵感之间的关联：\n\n${inspList}` },
  ]

  return apiCall(messages, { temperature: 0.7, max_tokens: 500 })
}

/** AI 自动标签 + 一句话摘要 */
export async function generateTags(title, content) {
  const messages = [
    {
      role: 'system',
      content: `你是内容标签生成器。根据用户提供的灵感标题和内容，生成 3-5 个标签和一句摘要。

规则：
- 标签使用中文，1-3 个字，不要带 # 号
- 标签优先从这些类别选：科技、编程、设计、写作、艺术、音乐、商业、创业、生活、学习、教育、游戏、影视、社交、哲学、心理、健康、美食、旅行、摄影
- 摘要不超过 20 字，概括核心想法，不要复述标题
- 只返回 JSON 对象，不要代码块、不要解释：
{"tags":["标签1","标签2","标签3"],"summary":"一句摘要"}`,
    },
    { role: 'user', content: `标题：${title}\n内容：${content || '(无)'}` },
  ]

  const result = stripCodeFence(await apiCall(messages, { temperature: 0.3, max_tokens: 150 }))
  try {
    const parsed = JSON.parse(result)
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).replace(/^#/, '').trim()).filter(Boolean).slice(0, 5)
      : []
    if (tags.length > 0) {
      return {
        tags,
        summary: (parsed.summary || '').toString().slice(0, 40) || null,
      }
    }
  } catch {
    // 模型偶尔不按 JSON 返回，退化为按分隔符拆
    const parts = result.split(/[、,，\n]/).map((s) => s.replace(/["[\]{}]/g, '').trim()).filter(Boolean)
    if (parts.length > 0) return { tags: parts.slice(0, 5), summary: null }
  }
  return null
}

/** 生成唤醒提示 */
export async function generateWakeupMessage(inspirationTitle) {
  const messages = [
    {
      role: 'system',
      content: `你是灵感唤醒助手。用户几天前记录了一个灵感，现在需要被提醒。
用一句温暖、具体的话（20 字以内）提醒用户回顾这个灵感，可以点出标题里的关键词。
风格：活泼、鼓励、不啰嗦。只输出这一句话，不要引号。`,
    },
    { role: 'user', content: `灵感标题："${inspirationTitle}"——请给我一句唤醒提示` },
  ]

  const reply = await apiCall(messages, { temperature: 0.9, max_tokens: 80 })
  return reply.replace(/^["“]|["”]$/g, '').trim()
}

/** 跨用户灵感匹配分析 */
export async function analyzeUserMatch(myInspirations, otherInspirations) {
  const myList = myInspirations.slice(0, 5).map((i) => `"${i.title}"（${(i.tags || []).join('、')}）`).join('；')
  const otherList = otherInspirations.slice(0, 5).map((i) => `"${i.title}"（${(i.tags || []).join('、')}）`).join('；')

  const messages = [
    {
      role: 'system',
      content: `你是灵感匹配分析师。分析两组的灵感，判断它们的"同频程度"。
只返回 JSON：{"score": 0-100, "reason": "一句话理由(15字以内)", "commonThemes": ["共同主题1"]}
不要代码块，不要其他文字。`,
    },
    { role: 'user', content: `用户A的灵感：${myList}\n\n用户B的灵感：${otherList}` },
  ]

  const result = stripCodeFence(await apiCall(messages, { temperature: 0.4, max_tokens: 150 }))
  try {
    return JSON.parse(result)
  } catch {
    return null
  }
}
