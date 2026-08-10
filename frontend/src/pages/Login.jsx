import { useState } from 'react'
import { useAuth } from '../stores/auth'
import { Sparkles, ArrowRight, User, Lock, LogIn, UserPlus, Phone, Mail, Coffee } from 'lucide-react'

export default function Login() {
  const { login, register, loginAsGuest } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validatePhone = (v) => /^1[3-9]\d{9}$/.test(v) || v === ''
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v === ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    if (isRegister) {
      if (phone && !validatePhone(phone)) { setError('请输入正确的手机号'); return }
      if (email && !validateEmail(email)) { setError('请输入正确的邮箱'); return }
    }
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 600))

    const res = isRegister
      ? register(username.trim(), password.trim(), { phone: phone.trim(), email: email.trim() })
      : login(username.trim(), password.trim())

    if (!res.success) {
      setError(res.message || '操作失败，请重试')
    }
    setLoading(false)
  }

  const handleGuest = () => {
    setLoading(true)
    setTimeout(() => {
      loginAsGuest()
      setLoading(false)
    }, 300)
  }

  const quickStart = () => {
    setUsername('灵感探索者')
    setPassword('lingjing')
    setIsRegister(false)
    setTimeout(() => {
      login('灵感探索者', 'lingjing')
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FAF7F2 0%, #F5F0E8 30%, #E8F4FD 70%, #dbeafe 100%)' }}
    >
      {/* 装饰性几何元素 */}
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(91,155,213,0.3) 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(255,140,105,0.2) 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-coral opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-blue-300 opacity-20" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">💡</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">灵境</h1>
          <p className="text-gray-500 text-sm">灵感即社交 · 让每个念头找到归属</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs" style={{ color: '#5B9BD5' }}>
            <Sparkles size={14} />
            <span>AI 驱动的灵感社交空间</span>
          </div>
        </div>

        {/* Splash 文案 */}
        <div className="mb-6 px-5 py-4 rounded-2xl text-center animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(91,155,213,0.08), rgba(255,140,105,0.05))',
            border: '1px solid rgba(91,155,213,0.12)',
          }}
        >
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#5B9BD5' }}>
            你那些"算了不记了"的灵感，可能价值一百万 💰
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="输入昵称..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                transition-all duration-200 text-base placeholder:text-gray-300"
              value={username} onChange={e => setUsername(e.target.value)}
              autoFocus maxLength={20}
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password" placeholder="输入密码..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80
                focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                transition-all duration-200 text-base placeholder:text-gray-300"
              value={password} onChange={e => setPassword(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* 注册时显示手机号/邮箱 */}
          {isRegister && (
            <>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel" placeholder="手机号（选填）"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                    transition-all duration-200 text-base placeholder:text-gray-300"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  maxLength={11}
                />
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" placeholder="邮箱（选填）"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/80
                    focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300
                    transition-all duration-200 text-base placeholder:text-gray-300"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || loading}
            className="w-full flex items-center justify-center gap-2 text-base py-3 rounded-2xl font-semibold
              text-white transition-all duration-200 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #5B9BD5, #6DB3E8)',
              boxShadow: '0 4px 16px rgba(91,155,213,0.3)',
            }}
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isRegister ? '注册中...' : '登录中...'}
              </>
            ) : (
              <>
                {isRegister ? (
                  <><UserPlus size={20} /> 注册并进入灵境</>
                ) : (
                  <><LogIn size={20} /> 进入灵境 <ArrowRight size={18} /></>
                )}
              </>
            )}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-sm transition-colors" style={{ color: '#5B9BD5' }}
          >
            {isRegister ? '已有账号？直接登录 →' : '还没有账号？注册一个 →'}
          </button>
        </div>

        {/* 游客模式 */}
        <div className="mt-3 text-center">
          <button
            onClick={handleGuest}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border text-sm font-medium
              transition-all duration-200 hover:shadow-sm active:scale-95"
            style={{
              borderColor: '#E8D5C4',
              color: '#8B7E6E',
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            <Coffee size={16} />
            游客模式浏览
          </button>
          <p className="text-xs text-gray-400 mt-2">
            游客可浏览广场和星球，但无法点赞评论
          </p>
        </div>

        {/* 快速体验 */}
        <div className="mt-3 text-center">
          <button
            onClick={quickStart}
            className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
          >
            或者，直接<u>快速体验</u> ✨
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          所有数据存储在你本地浏览器中
        </p>
      </div>
    </div>
  )
}
