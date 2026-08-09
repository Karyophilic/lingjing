import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { Lightbulb, Compass, MessageCircle, MessageSquare, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/', icon: Lightbulb, label: '记录' },
  { to: '/square', icon: Compass, label: '广场' },
  { to: '/matches', icon: MessageCircle, label: '同频' },
  { to: '/ai-chat', icon: MessageSquare, label: 'AI对话' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="font-bold text-lg text-gray-900">灵境</span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="退出登录"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-blue-50 safe-area-bottom">
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
