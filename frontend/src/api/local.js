// ============================================
// 本地存储引擎 — 无后端 + DeepSeek AI
// P3: DeepSeek集成、手机/邮箱注册、游客模式、私信、多轮对话
// ============================================

import { chatWithXiaolinger, generateTags, generateWakeupMessage, analyzeUserMatch, hasApiKey } from './deepseek'

const STORAGE_KEY = 'lingjing_data'
const SEED_VERSION = 3

function loadDB() {
  let db
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    db = raw ? JSON.parse(raw) : { _seedVersion: 0 }
  } catch (e) {
    console.warn('数据解析失败，已重置', e)
    db = { _seedVersion: 0 }
  }
  db = migrateDB(db)
  if (!db._seedVersion || db._seedVersion < SEED_VERSION) {
    seedData(db)
    db._seedVersion = SEED_VERSION
    saveDB(db)
  }
  return db
}

function migrateDB(db) {
  // P1 → P2: single user → users map
  if (db.user && !db.users) {
    const u = db.user
    db.users = { [u.username]: { id: u.id, username: u.username, passwordHash: simpleHash('lingjing'), createdAt: u.createdAt } }
    db.currentUserId = u.id
    if (!db.profile) db.profile = {}
    db.profile[u.id] = db.profile[u.id] || { bio: '', avatar: '' }
    if (db.inspirations) db.inspirations.forEach(i => { if (!i.user_id) i.user_id = u.id; i.is_ai_generated = false; i.is_archived = false })
  }
  // P2 → P3: users gain phone/email, aiChats becomes conversation-based, add messages
  if (!db.users) db.users = {}
  Object.values(db.users).forEach(u => {
    if (u.phone === undefined) u.phone = ''
    if (u.email === undefined) u.email = ''
  })
  // Convert old flat aiChats to conversation-based
  if (db.aiChats) {
    for (const [uid, msgs] of Object.entries(db.aiChats)) {
      if (Array.isArray(msgs) && msgs.length > 0 && !msgs[0]?.role) {
        // Already converted (conversation-based)
      } else if (Array.isArray(msgs)) {
        db.aiChats[uid] = [{
          chatId: uid(),
          title: '历史对话',
          messages: msgs,
          createdAt: msgs[0]?.time || now(),
          updatedAt: msgs[msgs.length - 1]?.time || now(),
        }]
      }
    }
  }
  if (!db.currentUserId) db.currentUserId = null
  if (!db.profile) db.profile = {}
  if (!db.inspirations) db.inspirations = []
  if (!db.likes) db.likes = {}
  if (!db.comments) db.comments = {}
  if (!db.wakeupChecks) db.wakeupChecks = {}
  if (!db.aiChats) db.aiChats = {}
  if (!db.archived) db.archived = {}
  if (!db.messages) db.messages = []
  db.inspirations.forEach(i => {
    if (i.is_ai_generated === undefined) i.is_ai_generated = false
    if (i.is_archived === undefined) i.is_archived = false
    if (i.content_type === undefined) i.content_type = 'text'
    if (i.image_data === undefined) i.image_data = null
    if (i.voice_data === undefined) i.voice_data = null
    if (i.voice_duration === undefined) i.voice_duration = 0
  })
  return db
}

function saveDB(db) { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) }
function now() { return new Date().toISOString() }
function simpleHash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }; return 'h' + Math.abs(h).toString(36) }

// ===== AI Users & Seed Inspirations =====
const AI_USERS = [
  { username: 'AI灵感助手', bio: '🤖 我是AI灵感助手，每天自动生成创意灵感，供大家参考碰撞' },
  { username: 'AI创意官', bio: '🎨 专注创意领域，分享设计、艺术、写作灵感' },
  { username: 'AI造梦师', bio: '🌙 用想象力生成各种有趣的想法，激发你的创造力' },
]

const SEED_INSPIRATIONS = [
  { title: '用AI生成个性化早安播报', content: '每天早上根据天气、日程、心情生成一段30秒的语音播报，像私人电台一样。', tags: ['科技', '创意'], username: 'AI灵感助手' },
  { title: '碎片化学习App：把知识变成短视频卡片', content: '把一本书的核心知识点拆成15秒短视频卡片，刷视频的过程不知不觉学完一门课。', tags: ['科技', '教育', '创业'], username: 'AI创意官' },
  { title: '城市里的"发呆亭"——给打工人一个放空的空间', content: '在写字楼密集区设置小型隔音空间，白噪音+柔和灯光+舒服椅子，专门让人发呆10分钟。', tags: ['生活', '创业', '心理'], username: 'AI造梦师' },
  { title: '悬浮透明图书馆——梦中场景的概念设计', content: '梦见悬浮在空中的透明图书馆，书页会发光。想画下来做成概念设计。', tags: ['设计', '艺术', '创意'], username: 'AI创意官' },
  { title: '反向社交App：只展示你和别人的不同点', content: '现在的社交软件强调共同兴趣，但如果有App只展示不同点呢？反而引发好奇心。', tags: ['社交', '创业', '哲学'], username: 'AI灵感助手' },
  { title: '把厨房改造成实验室：分子料理入门', content: '用液氮、胶化剂、泡沫机做菜。不只是吃，更是体验科学的魔法。', tags: ['生活', '创意'], username: 'AI造梦师' },
  { title: '写给十年后的自己的一封信', content: '写下现在最困扰的问题、最珍惜的人、最怕失去的东西。十年后打开看看。', tags: ['写作', '哲学', '生活'], username: 'AI灵感助手' },
  { title: '开源一个"情绪日记"Notion模板', content: '记录每天情绪波动+数据可视化，发现自己的情绪规律。', tags: ['心理', '写作', '设计'], username: 'AI创意官' },
  { title: '建立一个"灵感交换"线下聚会', content: '每人带3个自己放弃的灵感来交换，别人可能会帮你实现。灵感不该烂在备忘录里。', tags: ['社交', '创业', '创意'], username: 'AI造梦师' },
  { title: '用乐高搭建公司组织架构图', content: '每个部门一个颜色，每个员工一个小人偶，比PPT里的方框好看一万倍。', tags: ['设计', '创意', '商业'], username: 'AI灵感助手' },
  { title: '做一本只属于自己的杂志', content: '每季度排版印刷一本杂志，全是自己这三个月的好想法、好照片、好文章。', tags: ['写作', '设计', '生活'], username: 'AI创意官' },
  { title: '开发一个"关键词碰撞器"', content: '随机抽取两个不相关的词（火锅×宇宙），强迫自己想一个结合它们的创意。', tags: ['科技', '创意', '编程'], username: 'AI造梦师' },
  { title: '把通勤时间变成冥想时间', content: '闭眼深呼吸，用想象力把地铁噪音变成海浪声。每天1小时=365小时/年的修炼。', tags: ['心理', '生活', '哲学'], username: 'AI灵感助手' },
  { title: '用Git管理你的写作版本', content: '写长文用Git做版本管理，每章节一个branch，改稿就是merge，还能回退。', tags: ['写作', '编程', '创意'], username: 'AI创意官' },
  { title: '城市声音地图：记录一个城市的声音', content: '每个角落录1分钟环境音标注在地图上。雨天的巷子、早市的热闹、公园的鸟叫。', tags: ['艺术', '音乐', '生活'], username: 'AI造梦师' },
  { title: '设计一个"反效率"日程表', content: '不是安排好每一分钟，而是故意留出"无事可做"的时间块。灵感往往从无聊中冒出来。', tags: ['哲学', '心理', '生活'], username: 'AI灵感助手' },
  { title: '把旧手机改造成智能家居中控', content: '淘汰的旧手机刷个轻量系统装Home Assistant，挂墙上当中控屏，成本0元。', tags: ['科技', '编程', '生活'], username: 'AI创意官' },
  { title: '每个月学一个"无用技能"', content: '口哨吹一首歌、认出10种云的名字、用硬币变魔术。不需要有用，只需要有趣。', tags: ['生活', '学习', '创意'], username: 'AI造梦师' },
]

function seedData(db) {
  AI_USERS.forEach(u => {
    if (!db.users[u.username]) {
      const id = uid()
      db.users[u.username] = { id, username: u.username, passwordHash: simpleHash('ai_seed'), createdAt: now() }
      db.profile[id] = { bio: u.bio, avatar: '' }
    }
  })
  const existingSeeds = db.inspirations.filter(i => i.is_ai_generated).length
  if (existingSeeds >= 18) return
  SEED_INSPIRATIONS.forEach((seed, i) => {
    if (db.inspirations.some(ins => ins.title === seed.title && ins.is_ai_generated)) return
    const aiUser = db.users[seed.username]
    if (!aiUser) return
    const daysAgo = Math.floor(Math.random() * 30)
    const created = new Date(Date.now() - daysAgo * 86400000 - i * 3600000).toISOString()
    db.inspirations.unshift({
      id: uid(), user_id: aiUser.id, username: seed.username,
      title: seed.title, content: seed.content, content_type: 'text',
      image_data: null, voice_data: null, voice_duration: 0,
      tags: seed.tags, is_public: true, is_pinned: i < 3,
      is_ai_generated: true, is_archived: false,
      ai_summary: seed.title.slice(0, 30), created_at: created, updated_at: created,
    })
  })
}

// ===== Auth =====
export const localAuth = {
  register(username, password, opts = {}) {
    const db = loadDB()
    if (db.users[username]) return { success: false, message: '用户名已存在' }
    const id = uid()
    db.users[username] = {
      id, username, passwordHash: simpleHash(password),
      phone: opts.phone || '', email: opts.email || '',
      createdAt: now(),
    }
    db.profile[id] = { bio: '', avatar: '' }
    db.currentUserId = id
    saveDB(db)
    return { success: true, data: { user: { id, username, phone: opts.phone || '', email: opts.email || '', createdAt: db.users[username].createdAt } } }
  },
  login(username, password) {
    const db = loadDB()
    const user = db.users[username]
    if (!user) return { success: false, message: '用户不存在' }
    if (user.passwordHash !== simpleHash(password)) return { success: false, message: '密码错误' }
    db.currentUserId = user.id
    saveDB(db)
    return { success: true, data: { user: { id: user.id, username: user.username, phone: user.phone || '', email: user.email || '', createdAt: user.createdAt } } }
  },
  loginAsGuest() {
    const db = loadDB()
    const guestNum = Object.keys(db.users).filter(k => k.startsWith('guest_')).length + 1
    const username = `guest_${guestNum}_${Date.now().toString(36).slice(-4)}`
    const id = uid()
    db.users[username] = {
      id, username, passwordHash: '', phone: '', email: '',
      createdAt: now(), isGuest: true,
    }
    db.profile[id] = { bio: '👋 游客用户', avatar: '' }
    db.currentUserId = id
    saveDB(db)
    return { success: true, data: { user: { id, username, isGuest: true, createdAt: db.users[username].createdAt } } }
  },
  getCurrentUser() {
    const db = loadDB()
    if (!db.currentUserId) return null
    for (const un of Object.keys(db.users)) {
      if (db.users[un].id === db.currentUserId) return { id: db.users[un].id, username: un, phone: db.users[un].phone || '', email: db.users[un].email || '', isGuest: !!db.users[un].isGuest, createdAt: db.users[un].createdAt }
    }
    return null
  },
  logout() { const db = loadDB(); db.currentUserId = null; saveDB(db) },
  getProfile() {
    const db = loadDB(); const u = this.getCurrentUser()
    if (!u) return { success: false, message: '未登录' }
    const p = db.profile[u.id] || { bio: '', avatar: '' }; return { success: true, data: { ...u, ...p } }
  },
  updateProfile(data) {
    const db = loadDB(); const u = this.getCurrentUser()
    if (!u) return { success: false }
    db.profile[u.id] = Object.assign(db.profile[u.id] || {}, data)
    if (data.username && data.username !== u.username) {
      const oldUser = db.users[u.username]
      db.users[data.username] = { ...oldUser, username: data.username }
      delete db.users[u.username]
    }
    if (data.phone !== undefined || data.email !== undefined) {
      const curName = Object.keys(db.users).find(k => db.users[k].id === u.id)
      if (curName) {
        if (data.phone !== undefined) db.users[curName].phone = data.phone
        if (data.email !== undefined) db.users[curName].email = data.email
      }
    }
    saveDB(db); return { success: true, data: { ...u, ...db.profile[u.id] } }
  },
  getStats() {
    const db = loadDB(); const u = this.getCurrentUser()
    if (!u) return { success: false }
    const archivedIds = db.archived[u.id] || []
    const mine = db.inspirations.filter(i => i.user_id === u.id && !archivedIds.includes(i.id))
    const tc = {}; mine.forEach(i => (i.tags || []).forEach(t => { tc[t] = (tc[t] || 0) + 1 }))
    let likes = 0; mine.forEach(i => { likes += (db.likes[i.id] || []).length })
    const hc = {}; mine.forEach(i => { const h = new Date(i.created_at).getHours(); hc[h] = (hc[h] || 0) + 1 })
    const best = Object.entries(hc).sort((a, b) => b[1] - a[1])[0]
    return { success: true, data: { total: mine.length, publicCount: mine.filter(i => i.is_public).length, pinnedCount: mine.filter(i => i.is_pinned).length, archivedCount: (db.archived[u.id] || []).length, totalLikes: likes, topTags: Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count })), bestHour: best ? parseInt(best[0]) : null, joinedAt: u.createdAt } }
  },
}

// ===== AI Tagging =====
const TAG_RULES = [
  { keywords: ['代码','编程','算法','前端','后端','ai','api','app','软件','程序','开发','python','react','js','node','git'], tags: ['科技','编程'] },
  { keywords: ['设计','ui','ux','界面','颜色','配色','排版','海报','logo','图标','插画','动画','绘图','画'], tags: ['设计','创意'] },
  { keywords: ['写作','小说','故事','文章','诗','文案','剧本','日记','散文','读书','阅读','写','字'], tags: ['写作','文学'] },
  { keywords: ['音乐','歌','曲','吉他','钢琴','唱歌','乐队','编曲','旋律','节奏','和弦','声音','录音'], tags: ['音乐','艺术'] },
  { keywords: ['画画','绘画','素描','水彩','油画','涂鸦','漫画'], tags: ['艺术','绘画'] },
  { keywords: ['创业','商业','赚钱','营销','品牌','产品','市场','用户','融资','电商','公司'], tags: ['商业','创业'] },
  { keywords: ['生活','日常','美食','旅行','健身','穿搭','家居','宠物','植物','咖啡','厨房','通勤','城市'], tags: ['生活'] },
  { keywords: ['学习','考试','考研','英语','读书','笔记','复习','记忆','课程','教育','技能','知识'], tags: ['学习','教育'] },
  { keywords: ['游戏','电竞','手游','端游','关卡','角色','玩法','机制'], tags: ['游戏','娱乐'] },
  { keywords: ['电影','视频','vlog','剪辑','拍摄','镜头','导演','剧情','短视频'], tags: ['影视','创作'] },
  { keywords: ['社交','社区','朋友','聊天','匹配','约会','聚会','交流'], tags: ['社交'] },
  { keywords: ['哲学','思考','人生','意义','存在','自由','真理','冥想','无聊'], tags: ['哲学','思考'] },
  { keywords: ['心理','情绪','焦虑','抑郁','疗愈','正念','发呆','心情','日记'], tags: ['心理','健康'] },
]

function simulateAITag(title, content) {
  const text = (title + ' ' + content).toLowerCase(); const matched = new Set()
  for (const r of TAG_RULES) { for (const kw of r.keywords) { if (text.includes(kw)) { r.tags.forEach(t => matched.add(t)); break } } }
  if (matched.size === 0) matched.add('灵感')
  return { tags: Array.from(matched).slice(0, 5), summary: title.length > 30 ? title.slice(0, 30) + '...' : title }
}

async function aiTag(title, content) {
  if (hasApiKey()) {
    try {
      const result = await generateTags(title, content)
      if (result && result.tags?.length > 0) return result
    } catch (e) { /* fallback */ }
  }
  return simulateAITag(title, content)
}

// ===== Fallback Chat (无 DeepSeek 时使用) =====
function simulateChatResponse(userMessage, inspirationContext) {
  const msg = userMessage.toLowerCase()
  const intents = [
    { keys: ['无聊','没灵感','不知道','想不出','空白','卡住','没有想法'], responses: [
      '试试换个环境——去没去过的咖啡馆坐坐，或绕一条从没走过的路散步。灵感不太会在盯着屏幕时出现，它更喜欢在你分心时悄悄冒出来。',
      '来玩个游戏：随便翻本书到第42页第5行第一个词，把它作为你下一个创意的起点。',
      '灵感不是等来的，是"撞"出来的。试试把两个完全无关的东西强行组合！',
    ]},
    { keys: ['回忆','忘记','想不起来','遗忘','记不住'], responses: [
      '闭上眼睛，想一下昨天洗澡时脑子里闪过的那个念头——它还在，只是需要你往回走两步。',
      '翻翻相册找到最近一张随手拍的照片——当时你在想什么？那条线索可能还连着一段没被记录的灵感。',
    ]},
    { keys: ['灵感','想法','点子','创意','念头'], responses: [
      '好想法往往是你"偷"来的——不是抄袭，而是把别人的思路嫁接到自己的土壤上。最近有没有看到让你"哇"的东西？',
      '好灵感像种子：今天埋下去，过几天浇水，过几周发芽。别急着让它今天就完美，先记下来让时间发酵。',
    ]},
    { keys: ['焦虑','压力','放弃','不行','做不好','失败'], responses: [
      '每个创作者都有"我的想法好垃圾"的时刻。这不是你，是创作的自然阶段。先写下来再说~',
      '给自己"烂作品配额"：允许自己每月做出3个烂东西。当不再害怕做烂东西，灵感反而来得更快。',
    ]},
    { keys: ['帮助','帮我','建议','怎么办','怎么开始'], responses: [
      '先做一件事：把脑子里所有想法倒出来，不要整理不要判断好坏，全倒出来。然后我们再一起挑。',
      '从最小的一步开始。不是"做App"而是"打开备忘录写三行字"。先动起来。',
    ]},
  ]
  let best = null
  for (const intent of intents) { for (const kw of intent.keys) { if (msg.includes(kw)) { best = intent; break } } if (best) break }
  const pool = best ? best.responses : ['有意思！展开说说？', '这个想法不错！放大10倍会怎样？', '有趣。想过这个想法的"反面"吗？', '你正在酝酿一些东西。别急着下结论。', '灵感像猫，越追越跑。不如先做点别的。']
  let prefix = ''
  if (inspirationContext?.length > 0 && Math.random() > 0.5) {
    const ri = inspirationContext[Math.floor(Math.random() * inspirationContext.length)]
    prefix = `💡 说起来，你记录过"${ri.title}"——这个想法和现在的你可能已经不一样了。\n\n`
  }
  return prefix + pool[Math.floor(Math.random() * pool.length)]
}

// ===== AI Chat (conversation-based) =====
export const localAI = {
  /** 获取当前用户的所有对话列表 */
  getChatList() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return []
    const chats = db.aiChats[u.id] || []
    return chats.map(c => ({
      chatId: c.chatId,
      title: c.title || '新对话',
      preview: c.messages?.length > 0 ? c.messages[c.messages.length - 1].content.slice(0, 30) : '',
      messageCount: c.messages?.length || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  },

  /** 获取某个对话的消息 */
  getChat(chatId) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return null
    const chats = db.aiChats[u.id] || []
    return chats.find(c => c.chatId === chatId) || null
  },

  /** 开始新对话 */
  startNewChat() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return null
    if (!db.aiChats[u.id]) db.aiChats[u.id] = []
    const chat = { chatId: uid(), title: '新对话', messages: [], createdAt: now(), updatedAt: now() }
    db.aiChats[u.id].unshift(chat)
    saveDB(db)
    return chat
  },

  /** 发送消息（DeepSeek 优先，回退模拟） */
  async sendChatMessage(chatId, content) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: false, message: '未登录' }
    if (!db.aiChats[u.id]) db.aiChats[u.id] = []

    let chat = db.aiChats[u.id].find(c => c.chatId === chatId)
    if (!chat) {
      chat = { chatId, title: content.slice(0, 20) || '新对话', messages: [], createdAt: now(), updatedAt: now() }
      db.aiChats[u.id].unshift(chat)
    }

    const userMsg = { role: 'user', content, time: now() }
    chat.messages.push(userMsg)
    chat.updatedAt = now()

    // 更新标题（用第一条用户消息）
    if (chat.messages.filter(m => m.role === 'user').length === 1 && content.length <= 20) {
      chat.title = content
    }

    // 尝试 DeepSeek
    let aiContent = null
    if (hasApiKey()) {
      try {
        const myInsp = db.inspirations.filter(i => i.user_id === u.id && !i.is_archived)
        const history = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        aiContent = await chatWithXiaolinger(content, history, myInsp.slice(0, 5))
      } catch (e) {
        console.warn('DeepSeek 调用失败，使用本地模拟', e)
      }
    }

    // 回退到本地模拟
    if (!aiContent) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800))
      const myInsp = db.inspirations.filter(i => i.user_id === u.id && !i.is_archived)
      aiContent = simulateChatResponse(content, myInsp.slice(0, 5))
    }

    const aiMsg = { role: 'assistant', content: aiContent, time: now() }
    chat.messages.push(aiMsg)
    chat.updatedAt = now()
    saveDB(db)
    return { success: true, data: { chatId: chat.chatId, userMsg, aiMsg } }
  },

  /** 获取旧版扁平历史（兼容） */
  getChatHistory() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return []
    const chats = db.aiChats[u.id] || []
    // 返回当前活跃对话的消息，若没有则返回空
    if (chats.length === 0) return []
    return chats[0].messages || []
  },

  /** 删除对话 */
  deleteChat(chatId) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: false }
    if (!db.aiChats[u.id]) return { success: true }
    db.aiChats[u.id] = db.aiChats[u.id].filter(c => c.chatId !== chatId)
    saveDB(db)
    return { success: true }
  },

  clearChatHistory() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: false }
    db.aiChats[u.id] = []
    saveDB(db)
    return { success: true }
  },

  generateSuggestion() {
    const prompts = [
      { title: '今天看到的最触动你的东西', hint: '路上的一棵树、手机里的一句话、或陌生人的一个微笑' },
      { title: '如果钱和时间都不是问题，你最想做什么', hint: '不用考虑现实性，让想象力飞' },
      { title: '你最近反复出现的同一个念头', hint: '那个总在不经意间冒出来的想法，可能是信号' },
      { title: '什么事情让你不爽了很久', hint: '不爽的背后往往藏着一个值得解决的问题' },
      { title: '你最想和10年前的自己说什么', hint: '踩过的坑、学会的道理、后悔没做的事' },
      { title: '如果只能教别人一件事，你会教什么', hint: '每个人都有自己的独门绝技' },
    ]; return prompts[Math.floor(Math.random() * prompts.length)]
  },

  async getWakeup() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: true, data: { items: [] } }
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    const lastCheck = db.wakeupChecks[u.id]
    const candidates = db.inspirations.filter(i => i.user_id === u.id && !i.is_archived && new Date(i.created_at) < new Date(threeDaysAgo)).filter(i => !lastCheck || new Date(i.created_at) > new Date(lastCheck)).slice(0, 5)
    db.wakeupChecks[u.id] = now(); saveDB(db)

    // 尝试 DeepSeek 生成个性化唤醒消息
    const msgs = ['💡 还记得这个想法吗？','⏰ 几天前记下的灵感，回来看看？','🌟 被遗忘的念头在发光','🧠 这个灵感可能比想象中更有价值','🔔 灵感库存里有宝贝等你重新发现']
    const items = []
    for (let i = 0; i < candidates.length; i++) {
      let msg = msgs[Math.floor(Math.random() * 5)]
      if (hasApiKey()) {
        try {
          const aiMsg = await generateWakeupMessage(candidates[i].title)
          if (aiMsg) msg = aiMsg
        } catch (e) { /* use fallback */ }
      }
      items.push({ reminder_id: uid(), inspiration_id: candidates[i].id, title: candidates[i].title, message: msg, remind_at: now() })
    }
    return { success: true, data: { items } }
  },

  getRelated(inspirationId) {
    const db = loadDB(); const cur = db.inspirations.find(i => i.id === inspirationId)
    if (!cur) return { success: true, data: { items: [] } }
    return { success: true, data: { items: db.inspirations.filter(i => i.id !== cur.id && (i.tags || []).some(t => (cur.tags || []).includes(t))).slice(0, 3).map(i => ({ inspiration_id: i.id, title: i.title, connection: `共享标签：${i.tags.filter(t => cur.tags.includes(t)).slice(0, 2).join('、')}`, created_at: i.created_at, username: i.username })) } }
  },

  getMatches() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: true, data: { items: [], totalCount: 0 } }
    const mine = db.inspirations.filter(i => i.user_id === u.id && !i.is_archived)
    if (mine.length < 2) return { success: true, data: { items: [], totalCount: mine.length } }
    const pairs = []; for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) { const a = mine[i], b = mine[j]; const ta = new Set(a.tags || []), tb = new Set(b.tags || []); const c = [...ta].filter(t => tb.has(t)); const un = new Set([...ta, ...tb]); const s = Math.round((un.size > 0 ? c.length / un.size : 0) * 100); if (s > 0) pairs.push({ pair_id: `${a.id}_${b.id}`, inspiration_a: { id: a.id, title: a.title, tags: a.tags, created_at: a.created_at }, inspiration_b: { id: b.id, title: b.title, tags: b.tags, created_at: b.created_at }, match_score: s, common_tags: c, match_reason: c.length > 0 ? `共享标签：${c.slice(0, 3).join('、')}` : '微妙关联' }) }
    pairs.sort((a, b) => b.match_score - a.match_score)
    const tc = {}; mine.forEach(i => (i.tags || []).forEach(t => { tc[t] = (tc[t] || 0) + 1 }))
    return { success: true, data: { items: pairs.slice(0, 10), totalCount: mine.length, dominantTags: Object.entries(tc).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t), mode: 'single_player' } }
  },

  /** 跨用户匹配 */
  matchWithOthers() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: true, data: { items: [] } }
    const myInspirations = db.inspirations.filter(i => i.user_id === u.id && !i.is_archived && i.is_public)
    if (myInspirations.length === 0) return { success: true, data: { items: [], message: '还没有公开的灵感' } }

    const myTags = new Set()
    myInspirations.forEach(i => (i.tags || []).forEach(t => myTags.add(t)))

    // 找其他用户的公开灵感
    const otherUsers = {}
    db.inspirations.filter(i => i.is_public && i.user_id !== u.id).forEach(i => {
      if (!otherUsers[i.user_id]) otherUsers[i.user_id] = { userId: i.user_id, username: i.username, inspirations: [], tags: new Set() }
      otherUsers[i.user_id].inspirations.push(i)
      ;(i.tags || []).forEach(t => otherUsers[i.user_id].tags.add(t))
    })

    // 计算每个用户的匹配分数
    const matches = Object.values(otherUsers).map(other => {
      const commonTags = [...other.tags].filter(t => myTags.has(t))
      const union = new Set([...myTags, ...other.tags])
      const score = union.size > 0 ? Math.round((commonTags.length / union.size) * 100) : 0
      return {
        userId: other.userId,
        username: other.username,
        matchScore: score,
        commonTags: commonTags.slice(0, 5),
        theirInspirations: other.inspirations.slice(0, 3).map(i => ({ id: i.id, title: i.title, tags: i.tags })),
        myInspirations: myInspirations.slice(0, 3).map(i => ({ id: i.id, title: i.title, tags: i.tags })),
      }
    }).filter(m => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore)

    return { success: true, data: { items: matches.slice(0, 20) } }
  },
}

// ===== Private Messages =====
export const localMessages = {
  sendMessage(toUserId, content) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: false, message: '未登录' }
    if (u.isGuest) return { success: false, message: '游客不能发送私信' }
    if (!db.messages) db.messages = []
    const msg = { id: uid(), fromUserId: u.id, fromUsername: u.username, toUserId, content, timestamp: now(), read: false }
    db.messages.push(msg)
    saveDB(db)
    return { success: true, data: msg }
  },

  getConversations() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return []
    const msgs = db.messages || []
    const relevant = msgs.filter(m => m.fromUserId === u.id || m.toUserId === u.id)

    // 按对方用户聚合
    const convMap = {}
    relevant.forEach(m => {
      const otherId = m.fromUserId === u.id ? m.toUserId : m.fromUserId
      const otherName = m.fromUserId === u.id ? (() => {
        const uid = m.toUserId
        for (const un of Object.keys(db.users)) { if (db.users[un].id === uid) return un }
        return '未知用户'
      })() : m.fromUsername
      if (!convMap[otherId] || new Date(m.timestamp) > new Date(convMap[otherId].lastTime)) {
        convMap[otherId] = {
          userId: otherId,
          username: otherName,
          lastMessage: m.content.slice(0, 50),
          lastTime: m.timestamp,
          unread: m.toUserId === u.id && !m.read,
        }
      }
    })

    return Object.values(convMap).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
  },

  getMessages(withUserId) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return []
    const msgs = db.messages || []
    const conversation = msgs.filter(m =>
      (m.fromUserId === u.id && m.toUserId === withUserId) ||
      (m.fromUserId === withUserId && m.toUserId === u.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // 标记已读
    let changed = false
    conversation.forEach(m => {
      if (m.toUserId === u.id && !m.read) { m.read = true; changed = true }
    })
    if (changed) saveDB(db)
    return conversation
  },

  getUnreadCount() {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return 0
    return (db.messages || []).filter(m => m.toUserId === u.id && !m.read).length
  },
}

// ===== Inspirations CRUD =====
export const localInspirations = {
  create(data) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    const ai = simulateAITag(data.title, data.content)
    const insp = { id: uid(), user_id: u?.id, username: u?.username || '匿名', title: data.title, content: data.content || '', content_type: data.content_type || 'text', image_data: data.image_data || null, voice_data: data.voice_data || null, voice_duration: data.voice_duration || 0, tags: ai.tags, is_public: data.is_public || false, is_pinned: false, is_ai_generated: false, is_archived: false, ai_summary: ai.summary, created_at: now(), updated_at: now() }
    db.inspirations.unshift(insp); saveDB(db)

    // 异步尝试 DeepSeek 标签（不阻塞返回）
    if (hasApiKey()) {
      aiTag(data.title, data.content).then(result => {
        if (result && result.tags?.length > 0) {
          const db2 = loadDB()
          const idx = db2.inspirations.findIndex(x => x.id === insp.id)
          if (idx !== -1) {
            db2.inspirations[idx].tags = result.tags
            db2.inspirations[idx].ai_summary = result.summary
            saveDB(db2)
          }
        }
      }).catch(() => {})
    }

    return { success: true, data: { inspiration: insp, tags: ai.tags, ai_summary: ai.summary } }
  },
  getMyList(page = 1, limit = 20) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: true, data: { items: [], page, limit } }
    const archivedIds = db.archived[u.id] || []
    let items = db.inspirations.filter(i => i.user_id === u.id && !archivedIds.includes(i.id)).sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at))
    const offset = (page - 1) * limit; items = items.slice(offset, offset + limit).map(i => ({ ...i, like_count: (db.likes[i.id] || []).length, comment_count: (db.comments[i.id] || []).length }))
    return { success: true, data: { items, page, limit } }
  },
  getArchivedList(page = 1, limit = 20) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: true, data: { items: [], page, limit } }
    const archivedIds = db.archived[u.id] || []
    let items = db.inspirations.filter(i => i.user_id === u.id && archivedIds.includes(i.id)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const offset = (page - 1) * limit; items = items.slice(offset, offset + limit).map(i => ({ ...i, like_count: (db.likes[i.id] || []).length, comment_count: (db.comments[i.id] || []).length }))
    return { success: true, data: { items, page, limit } }
  },
  getDetail(id) { const db = loadDB(); const i = db.inspirations.find(x => x.id === id); if (!i) return { success: false, message: '不存在' }; return { success: true, data: { ...i, like_count: (db.likes[i.id] || []).length, comment_count: (db.comments[i.id] || []).length } } },
  update(id, data) {
    const db = loadDB(); const idx = db.inspirations.findIndex(x => x.id === id)
    if (idx === -1) return { success: false, message: '不存在' }
    if (data.title || data.content) { const insp = db.inspirations[idx]; const ai = simulateAITag(data.title || insp.title, data.content !== undefined ? data.content : insp.content); data.tags = ai.tags; data.ai_summary = ai.summary }
    Object.assign(db.inspirations[idx], data, { updated_at: now() }); saveDB(db); return { success: true, data: db.inspirations[idx] }
  },
  togglePin(id) { const db = loadDB(); const idx = db.inspirations.findIndex(x => x.id === id); if (idx === -1) return { success: false }; db.inspirations[idx].is_pinned = !db.inspirations[idx].is_pinned; db.inspirations[idx].updated_at = now(); saveDB(db); return { success: true, data: db.inspirations[idx] } },
  toggleArchive(id) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!u) return { success: false }; const insp = db.inspirations.find(x => x.id === id)
    if (!insp) return { success: false }
    if (!db.archived[u.id]) db.archived[u.id] = []
    const ai = db.archived[u.id].indexOf(id)
    if (ai > -1) { db.archived[u.id].splice(ai, 1); insp.is_archived = false; saveDB(db); return { success: true, message: '已取消存档', archived: false } }
    else { db.archived[u.id].push(id); insp.is_archived = true; saveDB(db); return { success: true, message: '已存档', archived: true } }
  },
  delete(id) { const db = loadDB(); db.inspirations = db.inspirations.filter(x => x.id !== id); delete db.likes[id]; delete db.comments[id]; saveDB(db); return { success: true } },
  getSquare(tag, page = 1, limit = 20) {
    const db = loadDB()
    let items = db.inspirations.filter(i => i.is_public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (tag) items = items.filter(i => (i.tags || []).includes(tag))
    const offset = (page - 1) * limit; items = items.slice(offset, offset + limit).map(i => ({ ...i, like_count: (db.likes[i.id] || []).length, comment_count: (db.comments[i.id] || []).length }))
    return { success: true, data: { items, page, limit } }
  },
  search(query) {
    const db = loadDB(); const q = query.toLowerCase()
    let items = db.inspirations.filter(i => i.is_public).filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || (i.tags || []).some(t => t.toLowerCase().includes(q))).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    items = items.map(i => ({ ...i, like_count: (db.likes[i.id] || []).length, comment_count: (db.comments[i.id] || []).length }))
    return { success: true, data: { items } }
  },
  like(inspirationId) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!db.likes[inspirationId]) db.likes[inspirationId] = []
    const idx = db.likes[inspirationId].indexOf(u.id)
    if (idx > -1) { db.likes[inspirationId].splice(idx, 1); saveDB(db); return { success: true, message: '已取消点赞' } }
    else { db.likes[inspirationId].push(u.id); saveDB(db); return { success: true, message: '已点赞' } }
  },
  getComments(inspirationId) { const db = loadDB(); return { success: true, data: { items: db.comments[inspirationId] || [] } } },
  createComment(inspirationId, content) {
    const db = loadDB(); const u = localAuth.getCurrentUser()
    if (!db.comments[inspirationId]) db.comments[inspirationId] = []
    const comment = { id: uid(), user_id: u?.id, username: u?.username || '', inspiration_id: inspirationId, content, created_at: now() }
    db.comments[inspirationId].push(comment); saveDB(db); return { success: true, data: comment }
  },
}
