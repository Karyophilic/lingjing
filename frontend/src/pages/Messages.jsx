import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { localMessages } from '../api/local'
import { Send, ArrowLeft, MessageCircle, User } from 'lucide-react'

export default function Messages() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeUser, setActiveUser] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (userId) {
      setActiveUser(userId)
      setMessages(localMessages.getMessages(userId))
    }
    setConversations(localMessages.getConversations())
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 定时刷新
  useEffect(() => {
    const timer = setInterval(() => {
      setConversations(localMessages.getConversations())
      if (activeUser) {
        setMessages(localMessages.getMessages(activeUser))
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [activeUser])

  const handleSend = () => {
    const text = input.trim()
    if (!text || !activeUser || sending) return
    setSending(true)
    const res = localMessages.sendMessage(activeUser, text)
    if (res.success) {
      setInput('')
      setMessages(prev => [...prev, res.data])
      setConversations(localMessages.getConversations())
    }
    setSending(false)
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

  const formatTime = (t) => {
    const d = new Date(t)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  // 对话列表视图
  if (!activeUser) {
    return (
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <MessageCircle size={22} className="text-primary-500" /> 私信
        </h1>

        {conversations.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400 text-sm mb-1">还没有私信对话</p>
            <p className="text-gray-400 text-xs">
              去广场匹配同频灵感，找到志同道合的伙伴
            </p>
            <button
              onClick={() => navigate('/square')}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
            >
              去广场发现
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.userId}
                onClick={() => navigate(`/messages/${conv.userId}`)}
                className="card w-full text-left flex items-center gap-3 hover:border-primary-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-beige-200 to-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 text-sm">@{conv.username}</span>
                    <span className="text-xs text-gray-400">{formatTime(conv.lastTime)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    )
  }

  // 聊天界面
  const convUser = conversations.find(c => c.userId === activeUser)

  return (
    <main className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* 顶部 */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-beige-300/30 bg-white/70 backdrop-blur-xl">
        <button onClick={() => navigate('/messages')} className="p-1 hover:bg-beige-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-beige-200 to-primary-100 flex items-center justify-center text-lg">
          👤
        </div>
        <span className="font-bold text-gray-800 text-sm">
          @{convUser?.username || '对方'}
        </span>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <p className="text-4xl mb-3">💬</p>
            <p>发送第一条消息吧</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.fromUserId !== activeUser
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white border border-beige-300/30 text-gray-700 rounded-bl-md'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-primary-100' : 'text-gray-300'}`}>
                    {timeStr(msg.timestamp)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="px-4 py-3 bg-white/70 backdrop-blur-xl border-t border-beige-300/30">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 resize-none rounded-2xl border border-beige-300/40 bg-beige-50/50 px-4 py-3 text-sm focus:outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 max-h-32"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg shadow-primary-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </main>
  )
}
