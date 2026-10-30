import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { localAI } from '../api/local'
import { hasApiKey } from '../api/deepseek'
import { Bell, BellOff, ArrowRight, Key } from 'lucide-react'

export default function Wakeup() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)
  const [needsKey, setNeedsKey] = useState(false)

  useEffect(() => { loadWakeup() }, [])

  const loadWakeup = async () => {
    setLoading(true)
    setChecked(false)
    if (!hasApiKey()) {
      setNeedsKey(true)
      setReminders([])
      setLoading(false)
      setChecked(true)
      return
    }
    setNeedsKey(false)
    try {
      const res = await localAI.getWakeup()
      setReminders(res.data.items)
    } catch (err) {
      console.error('加载唤醒提醒失败', err)
    } finally {
      setLoading(false)
      setChecked(true)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">AI 灵感唤醒</h1>
      <p className="text-gray-500 text-sm mb-6">
        配置 API Key 后，AI 会在灵感创建 72 小时后帮你想起那些遗忘的念头
      </p>

      {needsKey ? (
        <div className="card text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Key size={26} className="text-spark-500" />
          </div>
          <p className="text-gray-800 font-medium mb-2">AI 唤醒需要你自己的 API Key</p>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            灵境不提供内置 Key。请先在 AI 对话页配置你自己的 DeepSeek API Key，AI 才会生成唤醒语。
          </p>
          <button
            onClick={() => navigate('/ai-chat?settings=api')}
            className="btn-primary text-sm"
          >
            去配置 API Key
          </button>
        </div>
      ) : loading && !checked ? (
        <div className="flex justify-center py-12"><div className="animate-spin text-3xl">💡</div></div>
      ) : reminders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">{checked ? '✨' : <BellOff size={48} className="mx-auto text-gray-300" />}</div>
          <p className="text-gray-800 font-medium mb-2">
            {checked ? '暂时没有需要唤醒的灵感' : '正在检查...'}
          </p>
          <p className="text-gray-400 text-sm">
            配置 API Key 后，AI 会在 72 小时后提醒你回顾
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map(reminder => (
            <div key={reminder.reminder_id} className="card hover:border-primary-200 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Bell size={20} className="text-spark-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{reminder.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(reminder.remind_at).toLocaleDateString('zh-CN')} 提醒
                    </span>
                    <button
                      onClick={() => navigate(`/inspiration/${reminder.inspiration_id}`)}
                      className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
                    >
                      去看看 <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
