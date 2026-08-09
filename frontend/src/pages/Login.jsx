import { useState } from 'react'
import { useAuth } from '../stores/auth'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setError('')
    setLoading(true)

    // 模拟延迟，让用户看到 AI 分析的过程
    await new Promise(r => setTimeout(r, 600))

    const res = login(username.trim())
    if (!res.success) {
      setError('登录失败，请重试')
    }
    setLoading(false)
  }

  // 快速体验：一键进入
  const quickStart = () => {
    setUsername('灵感探索者')
    setTimeout(() => {
      login('灵感探索者')
    }, 300)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary-50 via-white to-amber-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 animate-float">💡</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">灵境</h1>
          <p className="text-gray-500">灵感即社交 · 让每个念头找到归属</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary-400">
            <Sparkles size={14} />
            <span>AI 驱动的灵感社交空间</span>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              你的昵称
            </label>
            <input
              type="text"
              placeholder="起一个你喜欢的名字..."
              className="input text-center text-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              maxLength={20}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI 准备中...
              </>
            ) : (
              <>
                进入灵境 <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* 快速体验 */}
        <div className="mt-4 text-center">
          <button
            onClick={quickStart}
            className="text-sm text-primary-400 hover:text-primary-500 transition-colors"
          >
            或者，直接<u>快速体验</u> →
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          所有数据仅存储在你本地浏览器中
        </p>
      </div>
    </div>
  )
}
