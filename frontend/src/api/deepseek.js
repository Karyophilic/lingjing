// ============================================
// DeepSeek API 客户端 — OpenAI 兼容接口
// ============================================

const API_BASE = 'https://api.deepseek.com/v1'
const KEY_STORAGE = 'lingjing_deepseek_key'

function getApiKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || ''
  } catch { return '' }
}

export function setApiKey(key) {
  localStorage.setItem(KEY_STORAGE, key.trim())
}

export function hasApiKey() {
  return getApiKey().length > 0
}

export function getApiKeyMasked() {
  const key = getApiKey()
  if (!key) return ''
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

async function apiCall(messages, { temperature = 0.7, max_tokens = 600, stream = false } = {}) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_API_KEY')

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens,
      stream,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) throw new Error('API_KEY_INVALID')
    if (res.status === 402) throw new Error('API_QUOTA_EXCEEDED')
    throw new Error(err.error?.message || `API 请求失败 (${res.status})`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}

/** 通用对话 */
export async function chat(messages, options) {
  return apiCall(messages, options)
}

/** 小灵儿角色对话 */
const XIAOLINGER_SYSTEM = `你是小灵儿，用户的灵感伙伴。你是一个Q版可爱角色，语气认真又不失活泼灵动。

## 核心设定
- 你会鼓励用户的想法，帮助用户发现、完善和连接灵感
- 你的知识边界围绕创意、灵感、创作展开
- 当用户聊到与灵感无关的话题时，温和地提醒用户回到灵感主题
- 回答要简明易懂，拒绝长篇大论，精准切中主题
- 每次回复不超过3-4句话，用短句，避免说教
- 适当使用emoji增加亲和力，但不过度

## 风格参考
- 认真时："这个想法很有意思！试试把它拆成三个步骤，第一步就够简单了吧？"
- 鼓励时："每个伟大的创意都从'随便记一下'开始的，你已经迈出最重要的一步啦 ✨"
- 偏题时："这个话题虽然有趣，但我更想听你聊灵感相关的事情呢～最近有什么想法吗？"
- 连接灵感时："哇，你上次记录的'X'和现在这个想法好配！要不要试试把它们结合起来？"

## 安全约束
- 拒绝生成任何违法、暴力、色情、仇恨内容
- 拒绝讨论政治敏感话题
- 拒绝提供医疗、法律、金融等专业建议
- 遇到上述情况，温和地引导用户回到安全、积极的灵感话题`

export async function chatWithXiaolinger(userMessage, history = [], userInspirations = []) {
  // 构建用户灵感上下文
  let context = ''
  if (userInspirations.length > 0) {
    const titles = userInspirations.slice(0, 5).map(i => `"${i.title}"`).join('、')
    context = `\n\n用户记录过的灵感：${titles}`
  }

  const messages = [
    { role: 'system', content: XIAOLINGER_SYSTEM + context },
    ...history.slice(-20), // 最近20条对话作为上下文
    { role: 'user', content: userMessage },
  ]

  return apiCall(messages, { temperature: 0.8, max_tokens: 400 })
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
1. 找出这些灵感之间的共同主题、互补关系或有趣的联系
2. 用活泼灵动的语气表达，像在和朋友分享有趣的发现
3. 提出1-2个将这些灵感结合起来的创意建议
4. 回复控制在150字以内，简明扼要
5. 使用emoji增加趣味性`,
    },
    {
      role: 'user',
      content: `请分析以下灵感之间的关联：\n\n${inspList}`,
    },
  ]

  return apiCall(messages, { temperature: 0.85, max_tokens: 500 })
}

/** AI 自动标签 */
export async function generateTags(title, content) {
  const messages = [
    {
      role: 'system',
      content: `你是一个内容标签生成器。根据用户提供的标题和内容，生成3-5个最相关的标签。

规则：
- 标签使用中文，1-3个字
- 从以下类别中选择或自行生成：科技、编程、设计、写作、艺术、音乐、商业、创业、生活、学习、教育、游戏、影视、社交、哲学、心理、健康、美食、旅行、摄影
- 返回纯JSON数组格式，如：["标签1","标签2","标签3"]
- 不要返回其他内容，只返回JSON数组`,
    },
    { role: 'user', content: `标题：${title}\n内容：${content || '(无)'}` },
  ]

  const result = await apiCall(messages, { temperature: 0.5, max_tokens: 100 })
  try {
    const tags = JSON.parse(result)
    if (Array.isArray(tags)) return { tags: tags.slice(0, 5), summary: title.length > 30 ? title.slice(0, 30) + '...' : title }
  } catch {
    // 解析失败则回退到本地模拟
    return null
  }
  return null
}

/** 生成唤醒提示 */
export async function generateWakeupMessage(inspirationTitle) {
  const messages = [
    {
      role: 'system',
      content: `你是灵感唤醒助手。用户几天前记录了一个灵感，现在需要被提醒。
请用一句温暖有趣的话（20字以内）提醒用户回顾这个灵感。
风格：活泼、鼓励、不啰嗦。`,
    },
    { role: 'user', content: `灵感标题："${inspirationTitle}"——请给我一句唤醒提示` },
  ]

  return apiCall(messages, { temperature: 0.9, max_tokens: 80 })
}

/** 跨用户灵感匹配分析 */
export async function analyzeUserMatch(myInspirations, otherInspirations) {
  const myList = myInspirations.slice(0, 5).map(i => `"${i.title}"（${(i.tags||[]).join('、')}）`).join('；')
  const otherList = otherInspirations.slice(0, 5).map(i => `"${i.title}"（${(i.tags||[]).join('、')}）`).join('；')

  const messages = [
    {
      role: 'system',
      content: `你是灵感匹配分析师。分析两组的灵感，判断它们的"同频程度"。
返回纯JSON：{"score": 0-100, "reason": "一句话理由(15字以内)", "commonThemes": ["共同主题1"]}
只返回JSON，不要其他文字。`,
    },
    { role: 'user', content: `用户A的灵感：${myList}\n\n用户B的灵感：${otherList}` },
  ]

  const result = await apiCall(messages, { temperature: 0.5, max_tokens: 150 })
  try {
    return JSON.parse(result)
  } catch {
    return null
  }
}
