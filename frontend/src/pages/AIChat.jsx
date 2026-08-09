import { useState, useEffect, useRef } from 'react'
import { localAI } from '../api/local'
import { Send, Trash2, Sparkles, Lightbulb, RefreshCw } from 'lucide-react'

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadHistory()
    newSuggestion()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadHistory = () => {
    const history = localAI.getChatHistory()
    setMessages(history)
  }

  const newSuggestion = () => {
    setSuggestion(localAI.generateSuggestion())
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    // 模拟 AI 思考延迟
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

    try {
      const res = localAI.sendChatMessage(text)
      if (res.success) {
        setMessages(prev => [...prev, res.data.userMsg, res.data.aiMsg])
      }
    } catch (err) {
      console.error('发送消息失败', err)
    } finally {
      setLoading(false)
      newSuggestion()
      inputRef.current?.focus()
    }
  }

  const handleClear = () => {
    if (window.confirm('确定要清空所有对话记录吗？')) {
      localAI.clearChatHistory()
      setMessages([])
      newSuggestion()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const timeStr = (t) => {
    const d = new Date(t)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <main className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* 头部 */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-blue-50 bg-white/80 backdrop-blur-lg sticky top-14 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-primary-200 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AI 灵感助手</h2>
            <p className="text-xs text-gray-400">聊聊你的想法，我来帮你激发灵感</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={newSuggestion}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-primary-500"
            title="换个话题建议"
          >
            <RefreshCw size={16} />
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
              title="清空对话"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">和 AI 聊聊灵感吧</h3>
            <p className="text-gray-400 text-sm mb-6">
              告诉我你现在的状态——卡住了？无聊了？还是有很多想法但不知道怎么整理？
              <br />AI 助手会帮你找到属于你的灵感方向。
            </p>

            {/* 话题建议卡片 */}
            {suggestion && (
              <div className="card bg-primary-50/50 border-primary-100 w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-spark-500" />
                  <span className="text-xs font-medium text-spark-600">试试这个话题</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{suggestion.title}</p>
                <p className="text-sm text-gray-500">{suggestion.hint}</p>
              </div>
            )}

            {/* 快捷入口 */}
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {[
                { emoji: '😴', label: '最近没什么灵感...' },
                { emoji: '💭', label: '我脑子里有个想法' },
                { emoji: '😰', label: '感到有点焦虑' },
                { emoji: '🔍', label: '帮我梳理一下思路' },
              ].map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => { setInput(label); inputRef.current?.focus() }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-left"
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs text-gray-600 line-clamp-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* 头像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gradient-to-br from-sky-100 to-primary-200'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* 气泡 */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white border border-gray-100 rounded-bl-md text-gray-700'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-300'}`}>
                    {timeStr(msg.time)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-100 to-primary-200 flex items-center justify-center flex-shrink-0 text-sm">
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 bg-white border-t border-blue-50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你现在的想法、困惑或者任何念头..."
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 max-h-32"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </main>
  )
}
