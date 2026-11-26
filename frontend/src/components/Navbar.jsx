import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { Lightbulb, Compass, MessageCircle, MessageSquare, User, Globe, LogOut, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { localMessages } from '../api/local'

const navItems = [
  { to: '/', icon: Lightbulb, label: '记录' },
  { to: '/square', icon: Compass, label: '广场' },
  { to: '/universe', icon: Globe, label: '星球' },
  { to: '/ai-chat', icon: MessageSquare, label: 'AI' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user && !user.isGuest) {
      setUnreadCount(localMessages.getUnreadCount())
      const timer = setInterval(() => {
        setUnreadCount(localMessages.getUnreadCount())
      }, 10000)
      return () => clearInterval(timer)
    }
  }, [user])

  return (
    <>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 bg-paper-50/80 backdrop-blur-xl border-b border-beige-300/70">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-ink-800 text-paper-50 grid place-items-center text-[13px] leading-none">
              ✦
            </span>
            <div className="leading-none">
              <span className="font-display text-lg text-ink-800 tracking-[0.12em]">灵境</span>
              <span className="hidden sm:block eyebrow mt-1">LINGJING</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* 私信按钮 */}
            {!user?.isGuest && (
              <NavLink
                to="/messages"
                className="relative p-2 text-ink-400 hover:text-ink-800 transition-colors"
              >
                <Mail size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-coral-500 text-paper-50 text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )}
            <button
              onClick={logout}
              className="text-ink-400 hover:text-coral-500 transition-colors p-2"
              title="退出登录"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper-50/85 backdrop-blur-xl border-t border-beige-300/70 safe-area-bottom">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                  active ? 'text-ink-800' : 'text-ink-300 hover:text-ink-500'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.1 : 1.7} />
                <span className="text-[10px] tracking-[0.08em]">{label}</span>
                <span className={`w-1 h-1 rounded-full transition-colors ${active ? 'bg-spark-500' : 'bg-transparent'}`} />
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
