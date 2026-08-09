import { useState } from 'react'
import { useAuth } from '../stores/auth'
import { Sparkles, ArrowRight, User, Lock, LogIn, UserPlus } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 600))

    const res = isRegister
      ? register(username.trim(), password.trim())
      : login(username.trim(), password.trim())

    if (!res.success) {
      setError(res.message || '操作失败，请重试')
    }
    setLoading(false)
  }

  // 快速体验
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
      style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)',
      }}
    >
      {/* 装饰性光斑 */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">💡</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">灵境</h1>
          <p className="text-gray-500 text-sm">灵感即社交 · 让每个念头找到归属</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary-400">
            <Sparkles size={14} />
            <span>AI 驱动的灵感社交空间</span>
          </div>
        </div>

        {/* Splash 文案 */}
        <div className="mb-6 px-5 py-4 rounded-2xl text-center animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.06))',
            border: '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <p className="text-sm font-medium text-primary-700 leading-relaxed">
            你那些"算了不记了"的灵感，可能价值一百万 💰
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="输入昵称..."
              className="input pl-11 text-base"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              maxLength={20}
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="输入密码..."
              className="input pl-11 text-base"
              value={password}
              onChange={e => setPassword(e.target.value)}
              maxLength={30}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
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
            className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            {isRegister ? '已有账号？直接登录 →' : '还没有账号？注册一个 →'}
          </button>
        </div>

        {/* 快速体验 */}
        <div className="mt-3 text-center">
          <button
            onClick={quickStart}
            className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
          >
            或者，直接<u>快速体验</u> ✨
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          所有数据仅存储在你本地浏览器中
        </p>
      </div>
    </div>
  )
}
