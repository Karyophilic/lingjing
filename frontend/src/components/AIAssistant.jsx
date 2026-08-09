import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'

const tips = [
  '💡 试试用语音记录灵感，比打字快 3 倍',
  '🧠 AI 会帮你在 72 小时后唤醒遗忘的灵感',
  '🔗 灵感广场可以找到和你想得一样的人',
  '🎯 公开灵感更容易遇到同频的伙伴',
  '⚡ 灵感不等人，打开就记，3 秒搞定',
]

export default function AIAssistant() {
  const [visible, setVisible] = useState(false)
  const [tip, setTip] = useState('')

  useEffect(() => {
    // 随机选一条提示
    setTip(tips[Math.floor(Math.random() * tips.length)])
    // 延迟显示，避免页面加载时立即弹出
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 animate-[slideUp_0.3s_ease-out]">
      <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-4 max-w-[240px]">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5 text-primary-500">
            <Sparkles size={16} />
            <span className="text-xs font-bold">AI 小助手</span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-300 hover:text-gray-500"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
