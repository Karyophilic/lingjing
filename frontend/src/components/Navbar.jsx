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
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-beige-300/30">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="font-bold text-lg text-gray-800">灵境</span>
          </div>
          <div className="flex items-center gap-1">
            {/* 私信按钮 */}
            {!user?.isGuest && (
              <NavLink
                to="/messages"
                className="relative p-2 text-gray-400 hover:text-primary-500 transition-colors"
              >
                <Mail size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )}
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-t border-beige-300/30 safe-area-bottom">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                  active ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </>
  )
}
