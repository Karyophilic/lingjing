import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { localInspirations } from '../api/local'
import { Search, Heart, MessageCircle, Mic, Image as ImageIcon, Bot, X, Sparkles, MessageSquare } from 'lucide-react'

const POPULAR_TAGS = ['创意', '科技', '艺术', '生活', '商业', '设计', '写作', '音乐']

function estimateHeight(item) {
  if (item.image_data) return 280
  if (item.voice_data) return 160
  const len = (item.title?.length || 0) + (item.content?.length || 0)
  if (len < 40) return 150
  if (len < 100) return 200
  if (len < 200) return 260
  return 320
}

function waterfall(items) {
  const left = [], right = []
  let hL = 0, hR = 0
  items.forEach(item => {
    const h = estimateHeight(item)
    if (hL <= hR) { left.push(item); hL += h }
    else { right.push(item); hR += h }
  })
  return [left, right]
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #E8F4FD, #D0E8FB)',
  'linear-gradient(135deg, #FDF0ED, #FCE4DC)',
  'linear-gradient(135deg, #E8F8F5, #D1F2EB)',
  'linear-gradient(135deg, #FEF9E7, #FDEBD0)',
  'linear-gradient(135deg, #EBE8FD, #DDD6FE)',
  'linear-gradient(135deg, #E8F4FD, #BAE6FD)',
  'linear-gradient(135deg, #FDEDEC, #FADBD8)',
  'linear-gradient(135deg, #E0F2F1, #B2DFDB)',
]

function coverGradient(id) {
  let h = 0; for (let i = 0; i < id.length; i++) { h = ((h << 5) - h) + id.charCodeAt(i); h |= 0 }
  return COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length]
}

export default function Square() {
  const navigate = useNavigate()
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [likedSet, setLikedSet] = useState(new Set())
  const [showMatches, setShowMatches] = useState(false)
  const [matchResults, setMatchResults] = useState([])
  const [matching, setMatching] = useState(false)

  const loadSquare = (tag) => {
    setLoading(true)
    try {
      const res = localInspirations.getSquare(tag || undefined)
      setInspirations(res.data.items)
      setSearchResults(null)
    } catch (err) {
      console.error('加载失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSquare(activeTag) }, [activeTag])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = localInspirations.search(searchQuery.trim())
      setSearchResults(res.data.items)
    } catch (err) {
      console.error('搜索失败', err)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
  }

  const handleMatch = async () => {
    setMatching(true)
    setShowMatches(true)
    await new Promise(r => setTimeout(r, 800))
    try {
      const res = localInspirations.matchWithOthers()
      setMatchResults(res.data?.items || [])
    } catch (err) {
      console.error('匹配失败', err)
    } finally {
      setMatching(false)
    }
  }

  const displayItems = searchResults !== null ? searchResults : inspirations
  const [leftCards, rightCards] = useMemo(() => waterfall(displayItems), [displayItems])

  const toggleLike = (id) => {
    localInspirations.like(id)
    setLikedSet(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    loadSquare(activeTag)
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    return new Date(dateStr).toLocaleDateString('zh-CN')
  }

  const WaterfallCard = ({ item }) => {
    const gradient = coverGradient(item.id)
    const likeCount = item.like_count || 0
    const commentCount = item.comment_count || 0

    return (
      <Link
        to={`/inspiration/${item.id}`}
        className="block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
        style={{ marginBottom: 12 }}
      >
        {item.image_data ? (
          <div className="relative w-full" style={{ minHeight: 120 }}>
            <img src={item.image_data} alt={item.title}
              className="w-full object-cover" style={{ maxHeight: 280 }}
              loading="lazy" />
          </div>
        ) : item.voice_data ? (
          <div className="flex items-center justify-center p-6"
            style={{ background: gradient, minHeight: 100 }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-2">
                <Mic size={22} className="text-gray-500" />
              </div>
              <span className="text-xs text-gray-500">
                {item.voice_duration > 0
                  ? `${Math.floor(item.voice_duration / 60)}'${(item.voice_duration % 60).toString().padStart(2, '0')}"`
                  : '语音'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-5"
            style={{ background: gradient, minHeight: 90 }}>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 text-center font-medium">
              {item.content || item.title}
            </p>
          </div>
        )}

        <div className="px-3 py-2.5">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {item.title}
          </h3>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 2).map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-600">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-100 to-primary-200 flex items-center justify-center text-[10px] flex-shrink-0">
                {item.is_ai_generated ? <Bot size={10} className="text-primary-400" /> : '👤'}
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {item.username || '匿名'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(item.id) }}
                className="flex items-center gap-0.5 hover:text-red-400 transition-colors"
              >
                <Heart size={12} fill={likedSet.has(item.id) ? '#f87171' : 'none'}
                  stroke={likedSet.has(item.id) ? '#f87171' : 'currentColor'} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
              <span className="flex items-center gap-0.5">
                <MessageCircle size={12} />
                {commentCount > 0 && <span>{commentCount}</span>}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-3 pt-4 pb-24">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h1 className="text-xl font-bold text-gray-800">灵感广场</h1>
      </div>

      {/* 搜索栏 */}
      <form onSubmit={handleSearch} className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索灵感..."
          className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-beige-300/40 bg-white text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
        />
        {searchQuery && (
          <button type="button" onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </form>

      {/* 灵感匹配按钮 — 显眼的渐变按钮 */}
      <button
        onClick={handleMatch}
        disabled={matching}
        className="w-full mb-3 px-5 py-3 rounded-2xl text-white font-semibold text-sm
          transition-all duration-200 active:scale-[0.98] pulse-glow flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #5B9BD5, #6C5CE7)',
          boxShadow: '0 4px 20px rgba(108,92,231,0.3)',
        }}
      >
        <Sparkles size={18} className="animate-pulse" />
        ✨ 发现同频灵感
        <span className="text-xs opacity-80">· 找到与你共鸣的伙伴</span>
      </button>

      {/* 标签筛选 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => { setActiveTag(''); clearSearch() }}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            !activeTag && searchResults === null
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-beige-100 text-gray-600 hover:bg-beige-200'
          }`}>
          全部
        </button>
        {POPULAR_TAGS.map(tag => (
          <button key={tag} onClick={() => { setActiveTag(tag); clearSearch() }}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTag === tag
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-beige-100 text-gray-600 hover:bg-beige-200'
            }`}>
            {tag}
          </button>
        ))}
      </div>

      {/* 搜索结果提示 */}
      {searchResults !== null && (
        <p className="text-xs text-gray-500 mb-3 px-1">
          搜索 "{searchQuery}" — {displayItems.length} 条结果
        </p>
      )}

      {/* 瀑布流 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-3xl">💡</div>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 text-sm">
            {searchResults !== null ? '没有找到相关灵感' : '还没有公开的灵感'}
          </p>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {leftCards.map(item => <WaterfallCard key={item.id} item={item} />)}
          </div>
          <div className="flex-1 min-w-0">
            {rightCards.map(item => <WaterfallCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* 匹配结果弹窗 */}
      {showMatches && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowMatches(false)}>
          <div
            className="bg-white w-full max-w-lg max-h-[80vh] rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto animate-[slideUp_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500" /> 同频匹配
              </h2>
              <button onClick={() => setShowMatches(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {matching ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin text-3xl mb-3">💡</div>
                <p className="text-gray-500 text-sm">正在分析灵感同频度...</p>
              </div>
            ) : matchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500 text-sm mb-2">暂无匹配结果</p>
                <p className="text-gray-400 text-xs">
                  多记录灵感并公开到广场，AI 会帮你找到同频的伙伴
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchResults.map((match, i) => (
                  <div key={match.userId} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-beige-200 to-primary-100 flex items-center justify-center text-lg">
                          👤
                        </div>
                        <div>
                          <span className="font-medium text-gray-800 text-sm">@{match.username}</span>
                          <p className="text-xs text-gray-400">{match.commonTags?.slice(0, 3).join(' · ')}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-purple-500">{match.matchScore}%</span>
                    </div>

                    {/* 对方的灵感 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {match.theirInspirations?.slice(0, 3).map(insp => (
                        <button
                          key={insp.id}
                          onClick={() => navigate(`/inspiration/${insp.id}`)}
                          className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                        >
                          {insp.title.slice(0, 15)}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setShowMatches(false)
                        navigate(`/messages/${match.userId}`)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #5B9BD5, #6C5CE7)' }}
                    >
                      <MessageSquare size={16} /> 私聊 @{match.username}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
