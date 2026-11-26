import { useState } from 'react'
import { useAuth } from '../stores/auth'
import { ArrowRight, User, Lock, LogIn, UserPlus, Phone, Mail } from 'lucide-react'
import { DoodleStar, DoodleLeaf, DoodleCat } from '../components/Doodle'

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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* 水彩与涂鸦 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-8%] left-[-10%] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(169,183,154,0.22) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-8%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(169,198,216,0.22) 0%, transparent 70%)' }} />
        <DoodleStar className="absolute top-10 right-8 w-16 h-16 text-spark-500/50 rotate-12" />
        <DoodleLeaf className="absolute bottom-16 left-6 w-24 h-24 text-ink-700/20 -rotate-12" />
        <DoodleStar className="absolute bottom-28 right-12 w-5 h-5 text-ink-400/50" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* 手绘封面 */}
        <div className="text-center mb-7">
          <div className="mx-auto w-16 h-16 rounded-full bg-paper-50 border border-ink-700/35 grid place-items-center mb-4 shadow-[2px_3px_0_rgba(74,74,66,0.08)]">
            <DoodleCat className="w-10 h-10 text-ink-700" />
          </div>
          <p className="eyebrow">LINGJING · TRAVEL BOOK</p>
          <h1 className="text-[38px] leading-none mt-1 text-ink-800">灵境</h1>
          <p className="text-sm text-ink-500 mt-2">灵感手帐 · 把每个念头写进山野与河流之间</p>
        </div>

        {/* 今日签 */}
        <div className="sketch-card px-5 py-4 text-center mb-5 -rotate-[0.4deg]">
          <p className="text-sm text-ink-600 leading-relaxed">
            你那些「算了不记了」的灵感，
            <br />可能正等着被写下来。
          </p>
          <p className="mt-2 text-[11px] text-ink-400 tracking-[0.14em]">— 今日签 —</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text" placeholder="输入昵称..."
              className="input pl-11 text-base"
              value={username} onChange={e => setUsername(e.target.value)}
              autoFocus maxLength={20}
            />
          </div>

          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="password" placeholder="输入密码..."
              className="input pl-11 text-base"
              value={password} onChange={e => setPassword(e.target.value)}
              maxLength={30}
            />
          </div>

          {isRegister && (
            <>
              <div className="relative">
                <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="tel" placeholder="手机号（选填）"
                  className="input pl-11 text-base"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  maxLength={11}
                />
              </div>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email" placeholder="邮箱（选填）"
                  className="input pl-11 text-base"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 sketch-card text-coral-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-paper-50 border-t-transparent rounded-full animate-spin" />
                {isRegister ? '注册中...' : '登录中...'}
              </>
            ) : (
              <>
                {isRegister ? (
                  <><UserPlus size={18} /> 注册并进入手帐</>
                ) : (
                  <><LogIn size={18} /> 进入手帐 <ArrowRight size={16} /></>
                )}
              </>
            )}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-sm text-spark-600 sketch-underline"
          >
            {isRegister ? '已有账号？直接登录 →' : '还没有账号？注册一个 →'}
          </button>
        </div>

        {/* 游客模式 */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn-ghost inline-flex items-center gap-1.5 px-5 py-2.5 text-sm"
          >
            <DoodleCat className="w-4 h-4" />
            游客模式浏览
          </button>
          <p className="text-xs text-ink-400 mt-2">
            游客可浏览广场和星球，但无法点赞评论
          </p>
        </div>

        {/* 快速体验 */}
        <div className="mt-3 text-center">
          <button
            onClick={quickStart}
            className="text-sm text-ink-400 hover:text-ink-700 transition-colors"
          >
            或者，直接<span className="sketch-underline">快速体验</span> ✨
          </button>
        </div>

        <p className="text-center text-xs text-ink-300 mt-6">
          所有数据存储在你本地浏览器中
        </p>
      </div>
    </div>
  )
}
