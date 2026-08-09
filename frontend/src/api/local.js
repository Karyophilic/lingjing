// ============================================
// 本地存储引擎 — 无后端 + 模拟 AI
// 所有数据存储在 localStorage，AI 功能用本地算法模拟
// ============================================

const STORAGE_KEY = 'lingjing_data'

// --- 初始化/加载 ---
function loadDB() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  const fresh = {
    user: null,
    profile: {},       // { [userId]: { bio, avatar } }
    inspirations: [],
    likes: {},         // { inspirationId: [userId] }
    comments: {},      // { inspirationId: [{id, userId, username, content, createdAt}] }
    wakeupChecks: {},  // { userId: lastCheckTime }
  }
  saveDB(fresh)
  return fresh
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now() {
  return new Date().toISOString()
}

// ============================================
// 用户
// ============================================
export const localAuth = {
  register(username) {
    const db = loadDB()
    const user = { id: uid(), username, createdAt: now() }
    db.user = user
    saveDB(db)
    return { success: true, data: { user } }
  },

  login(username) {
    const db = loadDB()
    // 检查是否存在该用户名
    if (db.user && db.user.username === username) {
      return { success: true, data: { user: db.user } }
    }
    // 新用户
    const user = { id: uid(), username, createdAt: now() }
    db.user = user
    saveDB(db)
    return { success: true, data: { user } }
  },

  getCurrentUser() {
    const db = loadDB()
    return db.user
  },

  logout() {
    const db = loadDB()
    db.user = null
    saveDB(db)
  },

  getProfile() {
    const db = loadDB()
    if (!db.user) return { success: false, message: '未登录' }
    const profile = db.profile[db.user.id] || { bio: '', avatar: '' }
    return { success: true, data: { ...db.user, ...profile } }
  },

  updateProfile(data) {
    const db = loadDB()
    if (!db.user) return { success: false, message: '未登录' }
    if (!db.profile[db.user.id]) db.profile[db.user.id] = {}
    Object.assign(db.profile[db.user.id], data)
    if (data.username) {
      db.user.username = data.username
    }
    saveDB(db)
    return { success: true, data: { ...db.user, ...db.profile[db.user.id] } }
  },

  getStats() {
    const db = loadDB()
    if (!db.user) return { success: false }
    const userId = db.user.id
    const myInspirations = db.inspirations.filter(i => i.user_id === userId)
    const publicCount = myInspirations.filter(i => i.is_public).length
    const pinnedCount = myInspirations.filter(i => i.is_pinned).length

    // 标签统计
    const tagCounts = {}
    myInspirations.forEach(i => {
      (i.tags || []).forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1
      })
    })
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    // 收到的赞
    let totalLikes = 0
    myInspirations.forEach(i => {
      totalLikes += (db.likes[i.id] || []).length
    })

    // 创作时间段分析
    const hourCounts = {}
    myInspirations.forEach(i => {
      const hour = new Date(i.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      success: true,
      data: {
        total: myInspirations.length,
        publicCount,
        pinnedCount,
        totalLikes,
        totalComments: Object.values(db.comments).flat().filter(c => c.user_id === userId).length,
        topTags,
        bestHour: bestHour ? parseInt(bestHour[0]) : null,
        bestHourCount: bestHour ? bestHour[1] : 0,
        joinedAt: db.user.createdAt,
      },
    }
  },
}

// ============================================
// 模拟 AI：关键词 → 标签 + 摘要
// ============================================
const TAG_RULES = [
  { keywords: ['代码','编程','算法','前端','后端','ai','api','app','软件','程序','开发','python','react','js','node'], tags: ['科技','编程'] },
  { keywords: ['设计','ui','ux','界面','颜色','配色','排版','海报','logo','图标','插画','动画'], tags: ['设计','创意'] },
  { keywords: ['写作','小说','故事','文章','诗','文案','剧本','日记','散文','读书','阅读'], tags: ['写作','文学'] },
  { keywords: ['音乐','歌','曲','吉他','钢琴','唱歌','乐队','编曲','旋律','节奏','和弦'], tags: ['音乐','艺术'] },
  { keywords: ['画画','绘画','素描','水彩','油画','涂鸦','漫画'], tags: ['艺术','绘画'] },
  { keywords: ['创业','商业','赚钱','营销','品牌','产品','市场','用户','融资','电商'], tags: ['商业','创业'] },
  { keywords: ['生活','日常','美食','旅行','健身','穿搭','家居','宠物','植物','咖啡'], tags: ['生活'] },
  { keywords: ['学习','考试','考研','英语','读书','笔记','复习','记忆','课程','教育'], tags: ['学习','教育'] },
  { keywords: ['游戏','电竞','手游','端游','关卡','角色','玩法','机制'], tags: ['游戏','娱乐'] },
  { keywords: ['电影','视频','vlog','剪辑','拍摄','镜头','导演','剧情'], tags: ['影视','创作'] },
  { keywords: ['社交','社区','朋友','聊天','匹配','约会','聚会'], tags: ['社交'] },
  { keywords: ['环保','公益','气候','能源','可持续','碳中和'], tags: ['环保','公益'] },
  { keywords: ['哲学','思考','人生','意义','存在','自由','真理'], tags: ['哲学','思考'] },
  { keywords: ['心理','情绪','焦虑','抑郁','疗愈','冥想','正念'], tags: ['心理','健康'] },
]

function simulateAITag(title, content) {
  const text = (title + ' ' + content).toLowerCase()
  const matchedTags = new Set()

  for (const rule of TAG_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        rule.tags.forEach(t => matchedTags.add(t))
        break
      }
    }
  }

  if (matchedTags.size === 0) {
    matchedTags.add('灵感')
  }

  return {
    tags: Array.from(matchedTags).slice(0, 5),
    summary: title.length > 30 ? title.slice(0, 30) + '...' : title,
  }
}

// 模拟 AI 唤醒消息
const WAKEUP_TEMPLATES = [
  '💡 还记得这个想法吗？说不定它值得你再想一想。',
  '⏰ 几天前你记下了一个灵感，要不要回来看看？',
  '🌟 有个被你遗忘的念头在发光，快回来看看吧！',
  '🧠 AI 提醒你：这个灵感可能比你想象中更有价值。',
  '🔔 叮！你的灵感库存里有个宝贝等你重新发现。',
]

function simulateWakeupMessage(inspiration) {
  const idx = Math.floor(Math.random() * WAKEUP_TEMPLATES.length)
  return WAKEUP_TEMPLATES[idx]
}

// 模拟灵感关联
function simulateRelated(inspirations, current) {
  return inspirations
    .filter(i => i.id !== current.id)
    .filter(i => {
      const commonTags = (i.tags || []).filter(t => (current.tags || []).includes(t))
      return commonTags.length > 0
    })
    .slice(0, 3)
    .map(i => ({
      inspiration_id: i.id,
      title: i.title,
      connection: `你们有共同的关键词：${i.tags.filter(t => current.tags.includes(t)).slice(0,2).join('、')}`,
      created_at: i.created_at,
    }))
}

// ============================================
// 灵感 CRUD
// ============================================
export const localInspirations = {
  create(data) {
    const db = loadDB()
    const ai = simulateAITag(data.title, data.content)
    const inspiration = {
      id: uid(),
      user_id: db.user?.id,
      username: db.user?.username || '匿名',
      title: data.title,
      content: data.content || '',
      content_type: data.content_type || 'text',
      image_data: data.image_data || null,   // base64 图片
      voice_data: data.voice_data || null,   // base64 音频
      voice_duration: data.voice_duration || 0,
      tags: ai.tags,
      is_public: data.is_public || false,
      is_pinned: data.is_pinned || false,
      ai_summary: ai.summary,
      created_at: now(),
      updated_at: now(),
    }
    db.inspirations.unshift(inspiration)
    saveDB(db)
    return { success: true, data: { inspiration, tags: ai.tags, ai_summary: ai.summary } }
  },

  getMyList(page = 1, limit = 20) {
    const db = loadDB()
    const userId = db.user?.id
    let items = db.inspirations
      .filter(i => i.user_id === userId)
      .sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at))

    const offset = (page - 1) * limit
    items = items.slice(offset, offset + limit)

    items = items.map(i => ({
      ...i,
      username: i.username || db.user?.username || '',
      like_count: (db.likes[i.id] || []).length,
      comment_count: (db.comments[i.id] || []).length,
    }))

    return { success: true, data: { items, page, limit } }
  },

  getDetail(id) {
    const db = loadDB()
    const i = db.inspirations.find(x => x.id === id)
    if (!i) return { success: false, message: '不存在' }
    return {
      success: true,
      data: {
        ...i,
        username: i.username || '',
        like_count: (db.likes[i.id] || []).length,
        comment_count: (db.comments[i.id] || []).length,
      },
    }
  },

  update(id, data) {
    const db = loadDB()
    const idx = db.inspirations.findIndex(x => x.id === id)
    if (idx === -1) return { success: false, message: '不存在' }

    // 如果修改了标题或内容，重新 AI 打标
    if (data.title || data.content) {
      const insp = db.inspirations[idx]
      const ai = simulateAITag(
        data.title || insp.title,
        data.content !== undefined ? data.content : insp.content
      )
      data.tags = ai.tags
      data.ai_summary = ai.summary
    }

    Object.assign(db.inspirations[idx], data, { updated_at: now() })
    saveDB(db)
    return { success: true, data: db.inspirations[idx] }
  },

  togglePin(id) {
    const db = loadDB()
    const idx = db.inspirations.findIndex(x => x.id === id)
    if (idx === -1) return { success: false, message: '不存在' }
    db.inspirations[idx].is_pinned = !db.inspirations[idx].is_pinned
    db.inspirations[idx].updated_at = now()
    saveDB(db)
    return { success: true, data: db.inspirations[idx] }
  },

  delete(id) {
    const db = loadDB()
    db.inspirations = db.inspirations.filter(x => x.id !== id)
    // 清理关联的点赞和评论
    delete db.likes[id]
    delete db.comments[id]
    saveDB(db)
    return { success: true }
  },

  getSquare(tag, page = 1, limit = 20) {
    const db = loadDB()
    let items = db.inspirations
      .filter(i => i.is_public)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    if (tag) {
      items = items.filter(i => (i.tags || []).includes(tag))
    }

    const offset = (page - 1) * limit
    items = items.slice(offset, offset + limit)

    items = items.map(i => ({
      ...i,
      username: i.username || '匿名',
      like_count: (db.likes[i.id] || []).length,
      comment_count: (db.comments[i.id] || []).length,
    }))

    return { success: true, data: { items, page, limit } }
  },

  search(query) {
    const db = loadDB()
    const q = query.toLowerCase()
    let items = db.inspirations
      .filter(i => i.is_public)
      .filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    items = items.map(i => ({
      ...i,
      username: i.username || '匿名',
      like_count: (db.likes[i.id] || []).length,
      comment_count: (db.comments[i.id] || []).length,
    }))

    return { success: true, data: { items } }
  },

  // 点赞
  like(inspirationId) {
    const db = loadDB()
    if (!db.likes[inspirationId]) db.likes[inspirationId] = []
    const userId = db.user?.id
    const idx = db.likes[inspirationId].indexOf(userId)
    if (idx > -1) {
      db.likes[inspirationId].splice(idx, 1)
      saveDB(db)
      return { success: true, message: '已取消点赞' }
    } else {
      db.likes[inspirationId].push(userId)
      saveDB(db)
      return { success: true, message: '已点赞' }
    }
  },

  // 评论
  getComments(inspirationId) {
    const db = loadDB()
    return { success: true, data: { items: db.comments[inspirationId] || [] } }
  },

  createComment(inspirationId, content) {
    const db = loadDB()
    if (!db.comments[inspirationId]) db.comments[inspirationId] = []
    const comment = {
      id: uid(),
      user_id: db.user?.id,
      username: db.user?.username || '',
      inspiration_id: inspirationId,
      content,
      created_at: now(),
    }
    db.comments[inspirationId].push(comment)
    saveDB(db)
    return { success: true, data: comment }
  },
}

// ============================================
// AI 功能（本地模拟）
// ============================================
export const localAI = {
  getWakeup() {
    const db = loadDB()
    const userId = db.user?.id

    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    const lastCheck = db.wakeupChecks[userId]

    const candidates = db.inspirations
      .filter(i => i.user_id === userId)
      .filter(i => new Date(i.created_at) < new Date(threeDaysAgo))
      .filter(i => {
        if (!lastCheck) return true
        return new Date(i.created_at) > new Date(lastCheck)
      })
      .slice(0, 5)

    db.wakeupChecks[userId] = now()
    saveDB(db)

    const items = candidates.map(i => ({
      reminder_id: uid(),
      inspiration_id: i.id,
      title: i.title,
      message: simulateWakeupMessage(i),
      remind_at: now(),
    }))

    return { success: true, data: { items } }
  },

  getRelated(inspirationId) {
    const db = loadDB()
    const current = db.inspirations.find(i => i.id === inspirationId)
    if (!current) return { success: true, data: { items: [] } }

    const related = simulateRelated(db.inspirations, current)
    return { success: true, data: { items: related } }
  },

  getMatches() {
    const db = loadDB()
    const userId = db.user?.id
    const myInspirations = db.inspirations.filter(i => i.user_id === userId)

    if (myInspirations.length < 2) {
      return { success: true, data: { items: [], totalCount: myInspirations.length } }
    }

    // 单机模式：交叉匹配自己的灵感，找出标签重合度高的"灵感对"
    const pairs = []
    for (let i = 0; i < myInspirations.length; i++) {
      for (let j = i + 1; j < myInspirations.length; j++) {
        const a = myInspirations[i]
        const b = myInspirations[j]
        const tagsA = new Set(a.tags || [])
        const tagsB = new Set(b.tags || [])
        const common = [...tagsA].filter(t => tagsB.has(t))
        const union = new Set([...tagsA, ...tagsB])
        const jaccard = union.size > 0 ? common.length / union.size : 0
        const score = Math.round(jaccard * 100)

        if (score > 0) {
          pairs.push({
            pair_id: `${a.id}_${b.id}`,
            inspiration_a: { id: a.id, title: a.title, tags: a.tags, created_at: a.created_at },
            inspiration_b: { id: b.id, title: b.title, tags: b.tags, created_at: b.created_at },
            match_score: score,
            common_tags: common,
            match_reason: common.length > 0
              ? `共享标签：${common.slice(0, 3).join('、')}`
              : '你们的灵感有微妙的关联',
          })
        }
      }
    }

    pairs.sort((a, b) => b.match_score - a.match_score)

    // 标签分布分析
    const tagCounts = {}
    myInspirations.forEach(i => {
      (i.tags || []).forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1
      })
    })
    const dominantTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)

    return {
      success: true,
      data: {
        items: pairs.slice(0, 10),
        totalCount: myInspirations.length,
        dominantTags,
        mode: 'single_player',
      },
    }
  },
}
