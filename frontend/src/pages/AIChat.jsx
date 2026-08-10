import { useState, useEffect, useRef, useCallback } from 'react'
import { localAI } from '../api/local'
import { hasApiKey, setApiKey, getApiKeyMasked } from '../api/deepseek'
import { Send, Trash2, Sparkles, Lightbulb, RefreshCw, Menu, Plus, X, Key, Settings, ChevronRight } from 'lucide-react'

// 小灵儿头像（静态、不可拖动）
function MascotAvatar({ size = 40 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full gentle-glow" />
      <div className="mascot-float relative w-full h-full rounded-full bg-gradient-to-br from-sky-400 via-primary-400 to-primary-500 shadow-lg shadow-primary-400/30 flex items-center justify-center">
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-white/30 to-transparent" />
        <div className="relative z-10 flex gap-2">
          <div className="eye-blink w-[6px] h-[8px] rounded-full bg-gray-800 relative">
            <div className="absolute top-[1.5px] left-[1.5px] w-[2px] h-[2px] rounded-full bg-white" />
          </div>
          <div className="eye-blink w-[6px] h-[8px] rounded-full bg-gray-800 relative">
            <div className="absolute top-[1.5px] left-[1.5px] w-[2px] h-[2px] rounded-full bg-white" />
          </div>
        </div>
        <div className="absolute bottom-1.5 left-1 w-[5px] h-[3px] rounded-full bg-pink-300/60" />
        <div className="absolute bottom-1.5 right-1 w-[5px] h-[3px] rounded-full bg-pink-300/60" />
      </div>
    </div>
  )
}

export default function AIChat() {
  const [chatList, setChatList] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showApiSettings, setShowApiSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadChatList()
    newSuggestion()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChatList = () => {
    const list = localAI.getChatList()
    setChatList(list)
    if (list.length > 0 && !activeChatId) {
      setActiveChatId(list[0].chatId)
      const chat = localAI.getChat(list[0].chatId)
      setMessages(chat?.messages || [])
    }
  }

  const loadChat = (chatId) => {
    setActiveChatId(chatId)
    const chat = localAI.getChat(chatId)
    setMessages(chat?.messages || [])
    setShowSidebar(false)
  }

  const startNewChat = () => {
    const chat = localAI.startNewChat()
    if (chat) {
      setActiveChatId(chat.chatId)
      setMessages([])
      setShowSidebar(false)
      loadChatList()
    }
  }

  const newSuggestion = () => {
    setSuggestion(localAI.generateSuggestion())
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setLoading(true)

    let chatId = activeChatId
    if (!chatId) {
      const chat = localAI.startNewChat()
      if (chat) chatId = chat.chatId
      setActiveChatId(chatId)
    }

    try {
      const res = await localAI.sendChatMessage(chatId, text)
      if (res.success) {
        setMessages(prev => [...prev, res.data.userMsg, res.data.aiMsg])
        loadChatList()
      }
    } catch (err) {
      console.error('发送消息失败', err)
    } finally {
      setLoading(false)
      newSuggestion()
      inputRef.current?.focus()
    }
  }

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation()
    if (!window.confirm('删除这个对话？')) return
    localAI.deleteChat(chatId)
    loadChatList()
    if (activeChatId === chatId) {
      const list = localAI.getChatList()
      if (list.length > 0) {
        setActiveChatId(list[0].chatId)
        const chat = localAI.getChat(list[0].chatId)
        setMessages(chat?.messages || [])
      } else {
        setActiveChatId(null)
        setMessages([])
      }
    }
  }

  const handleClearAll = () => {
    if (!window.confirm('确定要清空所有对话记录吗？')) return
    localAI.clearChatHistory()
    setChatList([])
    setActiveChatId(null)
    setMessages([])
    newSuggestion()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const saveApiKey = () => {
    setApiKey(apiKeyInput.trim())
    setApiKeyInput('')
    setShowApiSettings(false)
  }

  const timeStr = (t) => {
    const d = new Date(t)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const formatChatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return '今天'
    if (diff < 172800000) return '昨天'
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  // 按日期分组对话
  const groupedChats = chatList.reduce((acc, chat) => {
    const key = formatChatDate(chat.updatedAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(chat)
    return acc
  }, {})

  return (
    <main className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* 头部 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-beige-300/30 bg-white/70 backdrop-blur-xl sticky top-14 z-40">
        <div className="flex items-center gap-3">
          {/* 历史按钮 */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-beige-100 rounded-xl transition-colors text-gray-500"
            title="对话历史"
          >
            <Menu size={20} />
          </button>
          <MascotAvatar size={36} />
          <div>
            <h2 className="font-bold text-gray-800 text-sm">小灵儿</h2>
            <p className="text-xs text-gray-400">你的灵感伙伴</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setShowApiSettings(true)}
            className={`p-2 rounded-lg transition-colors ${hasApiKey() ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title="API 设置"
          >
            <Key size={16} />
          </button>
          <button
            onClick={newSuggestion}
            className="p-2 hover:bg-beige-100 rounded-lg transition-colors text-gray-400 hover:text-primary-500"
            title="换个话题"
          >
            <RefreshCw size={16} />
          </button>
          {chatList.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
              title="清空全部对话"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 侧边栏 (历史记录) */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setShowSidebar(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl overflow-y-auto animate-slide-up"
            style={{ animationDuration: '0.2s' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">对话历史</h3>
              <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* 新建对话 */}
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-2 px-4 py-3 border-b border-gray-50 hover:bg-primary-50 transition-colors text-primary-500 font-medium text-sm"
            >
              <Plus size={16} /> 开始新对话
            </button>

            {chatList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">暂无对话记录</div>
            ) : (
              Object.entries(groupedChats).map(([date, chats]) => (
                <div key={date}>
                  <div className="px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50/50">{date}</div>
                  {chats.map(chat => (
                    <button
                      key={chat.chatId}
                      onClick={() => loadChat(chat.chatId)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-primary-50/50 transition-colors ${
                        activeChatId === chat.chatId ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 truncate pr-2 flex-1">
                          {chat.title}
                        </span>
                        <button
                          onClick={(e) => handleDeleteChat(chat.chatId, e)}
                          className="flex-shrink-0 p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {chat.preview && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{chat.preview}</p>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* API 设置弹窗 */}
      {showApiSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowApiSettings(false)}>
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-bounce-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Settings size={18} /> DeepSeek API 设置
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              接入 DeepSeek API 后，小灵儿将使用真正的 AI 与你对话。
              <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer"
                className="text-primary-500 ml-1 underline">获取 API Key →</a>
            </p>
            {hasApiKey() && (
              <div className="mb-3 p-3 bg-green-50 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                已配置：{getApiKeyMasked()}
              </div>
            )}
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="input text-sm mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={saveApiKey} disabled={!apiKeyInput.trim()}
                className="btn-primary text-sm flex-1">保存</button>
              <button onClick={() => setShowApiSettings(false)} className="btn-ghost text-sm">取消</button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              你的 API Key 仅存储在本地浏览器
            </p>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MascotAvatar size={72} />
            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">和我聊聊灵感吧！</h3>
            <p className="text-gray-400 text-sm mb-6">
              我是小灵儿，你的灵感伙伴～
              <br />无论你是卡住了、无聊了、还是有很多想法，都可以和我说说
            </p>

            {/* 话题建议 */}
            {suggestion && (
              <div className="card bg-primary-50/40 border-primary-100 w-full text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-spark-500" />
                  <span className="text-xs font-medium text-spark-500">试试这个话题</span>
                </div>
                <p className="font-medium text-gray-800 mb-1">{suggestion.title}</p>
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
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-beige-300/40 hover:border-primary-200 hover:bg-primary-50/30 transition-all text-left"
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="text-xs text-gray-600 line-clamp-1">{label}</span>
                </button>
              ))}
            </div>

            {!hasApiKey() && (
              <button
                onClick={() => setShowApiSettings(true)}
                className="mt-6 text-sm text-primary-500 underline hover:text-primary-600"
              >
                配置 DeepSeek API Key 获得更好的对话体验
              </button>
            )}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* 头像 */}
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-beige-200 flex items-center justify-center flex-shrink-0 text-sm">
                    👤
                  </div>
                ) : (
                  <MascotAvatar size={32} />
                )}

                {/* 气泡 */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white border border-beige-300/30 rounded-bl-md text-gray-700'
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
              <MascotAvatar size={32} />
              <div className="px-4 py-3 rounded-2xl bg-white border border-beige-300/30 rounded-bl-md">
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
      <div className="px-4 py-3 bg-white/70 backdrop-blur-xl border-t border-beige-300/30">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="和你的小灵儿说点什么..."
            className="flex-1 resize-none rounded-2xl border border-beige-300/40 bg-beige-50/50 px-4 py-3 text-sm focus:outline-none focus:border-primary-300 focus:ring-1 focus:ring-primary-200 max-h-32"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-lg shadow-primary-500/20"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-2 text-center">
          Enter 发送 · Shift+Enter 换行
        </p>
      </div>
    </main>
  )
}
