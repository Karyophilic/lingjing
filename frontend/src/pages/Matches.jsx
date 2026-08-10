import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { localAI } from '../api/local'
import { Tag as TagIcon, Link2, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react'

export default function Matches() {
  const navigate = useNavigate()
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadMatches() }, [])

  const loadMatches = () => {
    setLoading(true)
    try {
      const res = localAI.getMatches()
      setMatchData(res.data)
    } catch (err) {
      console.error('加载匹配失败', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 flex justify-center py-12">
        <div className="animate-spin text-3xl">💡</div>
      </main>
    )
  }

  const { items, totalCount, dominantTags, mode } = matchData || {}

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">灵感关联</h1>
      <p className="text-gray-500 text-sm mb-6">AI 分析你的灵感，找出隐藏的关联</p>

      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-primary-500">{totalCount}</div>
          <div className="text-xs text-gray-400 mt-1">灵感总数</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-spark-500">{items?.length || 0}</div>
          <div className="text-xs text-gray-400 mt-1">关联对</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-lg font-bold text-purple-500 truncate px-1">
            {dominantTags?.length > 0 ? dominantTags[0] : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">主导标签</div>
        </div>
      </div>

      {dominantTags?.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-purple-500" />
            <h2 className="font-bold text-gray-800">你的创作偏好</h2>
          </div>
          <p className="text-sm text-gray-500 mb-3">你的灵感最集中在这些方向：</p>
          <div className="flex flex-wrap gap-2">
            {dominantTags.map((tag, i) => (
              <span key={tag} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                i === 0 ? 'bg-purple-100 text-purple-700' : i === 1 ? 'bg-primary-100 text-primary-700' : 'bg-beige-100 text-gray-600'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {items?.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Link2 size={18} className="text-primary-500" /> 灵感之间的隐藏关联
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            这些灵感虽然在不同时间记录，但它们的主题惊人地相似
          </p>
          <div className="space-y-3">
            {items.map(pair => (
              <div key={pair.pair_id} className="card hover:border-primary-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-primary-500 bg-primary-50 px-2 py-1 rounded-full">
                    匹配度 {pair.match_score}%
                  </span>
                  <div className="flex items-center gap-1">
                    {pair.common_tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="tag text-[10px]">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate(`/inspiration/${pair.inspiration_a.id}`)}
                    className="flex-1 text-left p-3 bg-beige-50 rounded-xl hover:bg-primary-50 transition-colors">
                    <div className="flex items-center gap-1 mb-1">
                      <Lightbulb size={14} className="text-spark-500" />
                      <span className="text-xs text-gray-400">{new Date(pair.inspiration_a.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{pair.inspiration_a.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pair.inspiration_a.tags?.slice(0, 2).map(t => <span key={t} className="text-[10px] text-gray-400">{t}</span>)}
                    </div>
                  </button>
                  <div className="text-gray-300 text-lg">→</div>
                  <button onClick={() => navigate(`/inspiration/${pair.inspiration_b.id}`)}
                    className="flex-1 text-left p-3 bg-beige-50 rounded-xl hover:bg-primary-50 transition-colors">
                    <div className="flex items-center gap-1 mb-1">
                      <Lightbulb size={14} className="text-spark-500" />
                      <span className="text-xs text-gray-400">{new Date(pair.inspiration_b.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{pair.inspiration_b.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pair.inspiration_b.tags?.slice(0, 2).map(t => <span key={t} className="text-[10px] text-gray-400">{t}</span>)}
                    </div>
                  </button>
                </div>
                <p className="text-xs text-primary-400 mt-3 text-center">{pair.match_reason}</p>
              </div>
            ))}
          </div>

          {/* 跨用户匹配入口 */}
          <div className="mt-8 mb-4 p-4 bg-gradient-to-r from-purple-50 to-primary-50 rounded-2xl">
            <p className="text-sm text-gray-500 text-center mb-3">
              💡 想看其他用户的灵感和你的匹配度吗？
            </p>
            <button
              onClick={() => navigate('/square')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5B9BD5, #6C5CE7)' }}
            >
              <MessageSquare size={16} /> 去广场发现同频伙伴 ✨
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-800 font-medium mb-2">
            {totalCount < 2 ? '记录更多灵感，发现隐藏关联' : '没有发现关联的灵感对'}
          </p>
          <p className="text-gray-400 text-sm">
            {totalCount < 2
              ? '至少记录 2 条灵感后，AI 会帮你找出它们之间的关联'
              : '试试在不同方向记录灵感，AI 会找到意想不到的联系'}
          </p>
        </div>
      )}
    </main>
  )
}
