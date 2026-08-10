import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { localInspirations, localAI } from '../api/local'
import CreateInspiration from '../components/CreateInspiration'
import InspirationCard from '../components/InspirationCard'
import Mascot from '../components/Mascot'
import { Plus, Lightbulb, Zap, MessageSquare } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [recentInspirations, setRecentInspirations] = useState([])
  const [wakeupCount, setWakeupCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const inspRes = localInspirations.getMyList(1)
      const wakeupRes = localAI.getWakeup()

      if (inspRes.success) {
        setRecentInspirations(inspRes.data.items.slice(0, 3))
      }
      if (wakeupRes.success) {
        setWakeupCount(wakeupRes.data.items.length)
      }
    } catch (err) {
      console.error('加载数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <main className="max-w-lg mx-auto px-4 pt-6">
      {/* 欢迎区 — 柔和蓝色渐变 */}
      <div className="mb-8 p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #E8F4FD 0%, #D0E8FB 40%, #F0EDE8 100%)',
        }}
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        <div className="absolute -bottom-4 left-1/2 w-16 h-16 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />

        <h1 className="text-2xl font-bold text-gray-800 mb-1 relative z-10">
          👋 你好，{user?.username || '探索者'}
        </h1>
        <p className="text-gray-500 relative z-10">今天有什么新的灵感？</p>
        {user?.isGuest && (
          <p className="text-xs text-coral-500 mt-1 relative z-10">游客模式 · 灵感不会丢失，但无法同步到其他设备</p>
        )}
      </div>

      {/* 快捷操作卡片 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setShowCreate(true)}
          className="card flex flex-col items-center justify-center py-5 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center mb-2 group-hover:bg-primary-100 transition-colors">
            <Plus size={24} className="text-primary-500" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">记录</span>
          <span className="text-[10px] text-gray-400 mt-0.5">新灵感</span>
        </button>

        <button
          onClick={() => navigate('/ai-chat')}
          className="card flex flex-col items-center justify-center py-5 hover:border-primary-200 hover:bg-sky-50/30 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center mb-2 group-hover:bg-sky-100 transition-colors">
            <MessageSquare size={24} className="text-sky-500" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">AI对话</span>
          <span className="text-[10px] text-gray-400 mt-0.5">激发灵感</span>
        </button>

        <button
          onClick={() => navigate('/wakeup')}
          className="card flex flex-col items-center justify-center py-5 hover:border-coral-400/30 hover:bg-orange-50/30 cursor-pointer group relative"
        >
          {wakeupCount > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {wakeupCount}
            </span>
          )}
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
            <Zap size={24} className="text-spark-500" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">唤醒</span>
          <span className="text-[10px] text-gray-400 mt-0.5">找回灵感</span>
        </button>
      </div>

      {/* 最近灵感 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb size={20} className="text-spark-500" />
            最近灵感
          </h2>
          {recentInspirations.length > 0 && (
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-primary-500 hover:text-primary-600"
            >
              查看全部 →
            </button>
          )}
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="animate-pulse-soft text-3xl">💡</div>
          </div>
        ) : recentInspirations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-gray-800 font-medium mb-2">还没有灵感记录</p>
            <p className="text-gray-400 text-sm mb-4">
              每一个伟大的想法都始于一个小灵感
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} /> 记录第一个灵感
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInspirations.map(insp => (
              <InspirationCard key={insp.id} inspiration={insp} onUpdate={loadData} />
            ))}
          </div>
        )}
      </div>

      {/* 小灵儿 */}
      <Mascot />

      {/* 悬浮记录按钮 */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/20 flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all duration-200 sm:hidden"
      >
        <Plus size={28} />
      </button>

      {showCreate && (
        <CreateInspiration
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            loadData()
          }}
        />
      )}
    </main>
  )
}
