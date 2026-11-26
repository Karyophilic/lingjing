import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { Mail, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { localMessages } from '../api/local'
import {
  DoodleHouse, DoodleMap, DoodlePlanet, DoodleChat, DoodlePerson, DoodleStar,
} from './Doodle'

const navItems = [
  { to: '/', icon: DoodleHouse, label: '记录' },
  { to: '/square', icon: DoodleMap, label: '广场' },
  { to: '/universe', icon: DoodlePlanet, label: '星球' },
  { to: '/ai-chat', icon: DoodleChat, label: 'AI' },
  { to: '/profile', icon: DoodlePerson, label: '我的' },
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
      <header className="sticky bg-paper-100/80 backdrop-blur-xl border-b border-ink-700/15 top-0 inset-x-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoodleStar className="w-6 h-6 text-ink-700" />
            <div className="leading-none">
              <span className="font-display text-[19px] text-ink-800 tracking-[0.08em]">灵境</span>
              <span className="hidden sm:block eyebrow mt-1">LINGJING · TRAVEL BOOK</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!user?.isGuest && (
              <NavLink
                to="/messages"
                className="relative w-9 h-9 grid place-items-center text-ink-500 hover:text-ink-800 transition-colors"
                aria-label="私信"
              >
                <Mail size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-coral-500 text-paper-50 text-[10px] flex items-center justify-center border border-paper-50">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            )}
            <button
              onClick={logout}
              className="w-9 h-9 grid place-items-center text-ink-500 hover:text-coral-500 transition-colors"
              title="退出登录"
              aria-label="退出登录"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 底部悬浮胶囊导航 */}
      <nav className="fixed bottom-3 inset-x-0 z-50 px-4 pointer-events-none">
        <div className="max-w-sm mx-auto nav-pill pointer-events-auto">
          <div className="flex justify-around items-end py-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                    active ? 'text-ink-800' : 'text-ink-400 hover:text-ink-600'
                  }`}
                  aria-label={label}
                >
                  <Icon className={`w-[23px] h-[23px] ${active ? '' : 'opacity-80'}`} />
                  <span className="text-[9px] tracking-[0.08em]">{label}</span>
                  <span className={`absolute -bottom-0.5 w-4 h-[2px] rounded-full transition-all ${
                    active ? 'bg-ink-700' : 'bg-transparent'
                  }`} style={{ transform: 'rotate(-2deg)' }} />
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
