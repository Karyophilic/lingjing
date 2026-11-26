import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { localInspirations, localAI } from '../api/local'
import CreateInspiration from '../components/CreateInspiration'
import InspirationCard from '../components/InspirationCard'
import LingMascot from '../components/LingMascot'
import {
  DoodleNotebook, DoodleLing, DoodleBell, DoodleMap, DoodlePin,
  DoodleArrow, DoodleLeaf,
} from '../components/Doodle'

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
      if (inspRes.success) setRecentInspirations(inspRes.data.items.slice(0, 3))
      if (wakeupRes.success) setWakeupCount(wakeupRes.data.items.length)
    } catch (err) {
      console.error('加载数据失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  const weekday = now.toLocaleDateString('zh-CN', { weekday: 'long' })

  return (
    <main className="max-w-lg mx-auto pb-28">
      {/* 问候 */}
      <section className="px-5 pt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[30px] leading-tight text-ink-800 truncate max-w-[70%]">
            Hi，{user?.isGuest ? '旅人' : (user?.username || '旅人')}
          </h2>
          {user?.isGuest && (
            <span className="tag whitespace-nowrap">游客模式</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-sm text-ink-500">
          <span>{dateLabel} · {weekday} ·</span>
          <span>今天适合记下一个小念头</span>
        </div>
      </section>

      {/* 新建灵感 + 快捷入口 */}
      <section className="px-5 mt-5">
        <button
          onClick={() => setShowCreate(true)}
          className="sketch-card relative w-full text-left p-5 overflow-hidden"
        >
          <DoodleMap className="absolute -right-3 -bottom-5 w-32 h-32 text-ink-700/15" />
          <DoodlePin className="absolute right-16 bottom-5 w-8 h-8 text-spark-500/70" />
          <p className="eyebrow">NEW ENTRY · 01</p>
          <p className="mt-1 text-[26px] leading-tight text-ink-800 sketch-underline inline-block">
            记录新灵感
          </p>
          <p className="text-sm text-ink-500 mt-3 max-w-[80%]">
            让一个还没成形的念头，先在这里落笔。
          </p>
          <span className="inline-flex items-center gap-2 mt-3 text-xs tracking-[0.14em] text-ink-600">
            LET'S GO <DoodleArrow className="w-9 h-4" />
          </span>
        </button>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <button
            onClick={() => setShowCreate(true)}
            className="sketch-card flex flex-col items-center justify-center py-4"
          >
            <DoodleNotebook className="w-10 h-10 text-ink-700" />
            <span className="mt-2 text-sm text-ink-700 sketch-underline">灵感清单</span>
          </button>
          <button
            onClick={() => navigate('/ai-chat')}
            className="sketch-card flex flex-col items-center justify-center py-4"
          >
            <DoodleLing className="w-10 h-10 text-ink-700" />
            <span className="mt-2 text-sm text-ink-700 sketch-underline">问小灵儿</span>
          </button>
          <button
            onClick={() => navigate('/wakeup')}
            className="sketch-card relative flex flex-col items-center justify-center py-4"
          >
            {wakeupCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-coral-500 text-paper-50 text-[10px] flex items-center justify-center border border-paper-50">
                {wakeupCount}
              </span>
            )}
            <DoodleBell className="w-10 h-10 text-ink-700" />
            <span className="mt-2 text-sm text-ink-700 sketch-underline">唤醒</span>
          </button>
        </div>
      </section>

      {/* 最近灵感 */}
      <section className="px-5 mt-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-2xl text-ink-800 flex items-center gap-2">
            <DoodleLeaf className="w-6 h-6" style={{ color: '#7E8F6D' }} />
            最近的念头
          </h2>
          {recentInspirations.length > 0 && (
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-ink-500 sketch-underline"
            >
              全部 →
            </button>
          )}
        </div>

        {loading ? (
          <div className="sketch-card flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-ink-300 border-t-ink-700 animate-spin" />
          </div>
        ) : recentInspirations.length === 0 ? (
          <div className="sketch-card text-center py-10 px-5">
            <p className="font-display text-2xl text-ink-700 mb-2">还没有落笔</p>
            <p className="text-sm text-ink-500 mb-4">每一个伟大的想法，都始于随手写下的一行字。</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
              写下第一个念头
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInspirations.map(insp => (
              <InspirationCard key={insp.id} inspiration={insp} onUpdate={loadData} />
            ))}
          </div>
        )}
      </section>

      <LingMascot />

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
