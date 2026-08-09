import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { localInspirations, localAuth } from '../api/local'
import CreateInspiration from '../components/CreateInspiration'
import InspirationCard from '../components/InspirationCard'
import {
  Plus, Search, Edit3, Check, X,
  TrendingUp, Award, Clock, FileText, Heart, Tag as TagIcon, Layers
} from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inspirations, setInspirations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // 编辑资料
  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editUsername, setEditUsername] = useState('')

  const loadData = useCallback(() => {
    setLoading(true)
    try {
      const inspRes = localInspirations.getMyList(page)
      const statsRes = localAuth.getStats()
      const profileRes = localAuth.getProfile()
      setInspirations(inspRes.data.items)
      setStats(statsRes.data)
      setProfile(profileRes.data)
    } catch (err) {
      console.error('加载失败', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadData() }, [loadData])

  const startEditProfile = () => {
    setEditBio(profile?.bio || '')
    setEditUsername(profile?.username || '')
    setEditingProfile(true)
  }

  const saveProfile = () => {
    localAuth.updateProfile({ bio: editBio.trim(), username: editUsername.trim() })
    setEditingProfile(false)
    loadData()
    window.location.reload() // 刷新以更新全局用户名
  }

  const filtered = search
    ? inspirations.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : inspirations

  // 时段描述
  const hourLabel = (h) => {
    if (h >= 5 && h < 8) return '清晨 🌅'
    if (h >= 8 && h < 12) return '上午 ☀️'
    if (h >= 12 && h < 14) return '午后 🌤️'
    if (h >= 14 && h < 18) return '下午 🌈'
    if (h >= 18 && h < 22) return '傍晚 🌆'
    return '深夜 🌙'
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* 个人资料区 */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 via-purple-100 to-amber-100 flex items-center justify-center text-3xl shadow-sm">
              👤
            </div>
            <div>
              {editingProfile ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="input text-sm py-1.5"
                    maxLength={20}
                    placeholder="昵称"
                  />
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    className="input text-sm py-1.5 resize-none"
                    rows={2}
                    maxLength={200}
                    placeholder="简介..."
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">@{profile?.username || '探索者'}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {profile?.bio || '这个人很懒，还没写简介...'}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {stats?.joinedAt ? `${new Date(stats.joinedAt).toLocaleDateString('zh-CN')} 加入` : ''}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {editingProfile ? (
              <>
                <button onClick={saveProfile} className="p-2 rounded-lg bg-primary-50 text-primary-500 hover:bg-primary-100 transition-colors">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditingProfile(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X size={16} />
                </button>
              </>
            ) : (
              <button onClick={startEditProfile} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <Edit3 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 统计数据 */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stats.total}</div>
              <div className="text-[10px] text-gray-400">灵感</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary-500">{stats.publicCount}</div>
              <div className="text-[10px] text-gray-400">公开</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{stats.totalLikes}</div>
              <div className="text-[10px] text-gray-400">获赞</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-spark-500">{stats.pinnedCount}</div>
              <div className="text-[10px] text-gray-400">置顶</div>
            </div>
          </div>
        )}
      </div>

      {/* 创作分析 */}
      {stats && stats.total > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" /> 创作分析
          </h3>
          <div className="space-y-3">
            {/* 标签云 */}
            {stats.topTags?.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <TagIcon size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500">最常使用的标签</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {stats.topTags.map(({ tag, count }) => (
                    <span key={tag} className="inline-flex items-center gap-1 tag">
                      {tag}
                      <span className="text-[10px] opacity-60">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 活跃时段 */}
            {stats.bestHour !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} className="text-gray-400" />
                <span>灵感高峰期：{hourLabel(stats.bestHour)} {stats.bestHour}:00 左右</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 我的灵感 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText size={20} className="text-primary-500" />
          我的灵感
        </h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={18} /> 记录
        </button>
      </div>

      {/* 搜索 */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索灵感或标签..." className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin text-3xl">💡</div></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-gray-500">{search ? '没有匹配的灵感' : '还没有灵感，记录第一个吧'}</p>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={18} /> 记录第一个灵感
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map(insp => (
              <InspirationCard key={insp.id} inspiration={insp} showUser={false} onUpdate={loadData} />
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm disabled:opacity-30">上一页</button>
            <span className="flex items-center px-3 text-sm text-gray-500">第 {page} 页</span>
            <button disabled={inspirations.length < 20} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm disabled:opacity-30">下一页</button>
          </div>
        </>
      )}

      {/* 创建灵感弹窗 */}
      {showCreate && (
        <CreateInspiration onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadData() }} />
      )}
    </main>
  )
}
