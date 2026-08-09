import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { localInspirations } from '../api/local'
import { Plus, Telescope, ArrowLeft } from 'lucide-react'

// 星球调色板 — 明亮、梦幻的颜色
const PLANET_COLORS = [
  '#f59e0b', // 琥珀
  '#ef4444', // 赤红
  '#8b5cf6', // 紫罗兰
  '#06b6d4', // 青色
  '#10b981', // 翡翠
  '#f97316', // 橙色
  '#ec4899', // 粉红
  '#3b82f6', // 蓝色
  '#84cc16', // 青柠
  '#14b8a6', // 蓝绿
  '#e11d48', // 玫红
  '#7c3aed', // 深紫
  '#0891b2', // 深青
  '#65a30d', // 草绿
  '#d946ef', // 洋红
  '#0284c7', // 天蓝
  '#fbbf24', // 金黄
  '#a855f7', // 淡紫
]

// 将字符串哈希为数值（确定性随机种子）
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// 种子随机数生成器
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 从 inspiration id 生成星球属性
function planetFromInspiration(insp, index, total) {
  const h = hashString(insp.id)
  const r1 = seededRandom(h)
  const r2 = seededRandom(h + 1000)
  const r3 = seededRandom(h + 2000)
  const r4 = seededRandom(h + 3000)
  const r5 = seededRandom(h + 4000)
  const r6 = seededRandom(h + 5000)
  const r7 = seededRandom(h + 6000)

  // 螺旋分布：让星球在画面中均匀但有美感地分布
  // 使用黄金角度 + 指数间距来生成类螺旋分布的坐标
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const radius = 15 + (index / Math.max(total, 1)) * 42 // 15%-57% 的半径范围
  const angle = index * goldenAngle + r1 * 0.3
  const cx = 50 + radius * Math.cos(angle) * (1.5 + 0.5 * (window.innerWidth / window.innerHeight))
  const cy = 50 + radius * Math.sin(angle) * (1.5 + 0.5 * (window.innerHeight / window.innerWidth))

  // 添加轻微随机偏移
  const x = cx + (r2 - 0.5) * 12
  const y = cy + (r3 - 0.5) * 12

  const colorIndex = Math.floor(r4 * PLANET_COLORS.length)
  const size = 24 + Math.floor(r5 * 36) // 24-60px
  const glowSize = size + 8 + Math.floor(r6 * 16)

  return {
    id: insp.id,
    title: insp.title,
    tags: insp.tags,
    color: PLANET_COLORS[colorIndex],
    size,
    x: Math.max(5, Math.min(92, x)), // 限制在 5%-92% 范围内
    y: Math.max(8, Math.min(88, y)),
    glowSize,
    floatDelay: (r7 * 6).toFixed(2),
    floatDuration: (3 + r1 * 4).toFixed(2), // 3-7s
    hasRing: r3 > 0.6,
    isLarge: size > 45,
  }
}

// 背景星星
function generateStars(count) {
  const stars = []
  for (let i = 0; i < count; i++) {
    const h = hashString(`star_${i}`)
    const r1 = seededRandom(h)
    const r2 = seededRandom(h + 100)
    const r3 = seededRandom(h + 200)
    stars.push({
      id: i,
      x: r1 * 100,
      y: r2 * 100,
      size: 1 + r3 * 2.5,
      opacity: 0.3 + r3 * 0.7,
      delay: (r2 * 5).toFixed(2),
      duration: (1.5 + r1 * 3).toFixed(2),
    })
  }
  return stars
}

export default function Universe() {
  const navigate = useNavigate()
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredPlanet, setHoveredPlanet] = useState(null)

  const stars = useMemo(() => generateStars(120), [])

  useEffect(() => {
    const res = localInspirations.getMyList(1, 200) // 获取尽可能多的灵感
    if (res.success) {
      setInspirations(res.data.items.filter(i => !i.is_archived))
    }
    setLoading(false)
  }, [])

  const planets = useMemo(() => {
    return inspirations.map((insp, i) =>
      planetFromInspiration(insp, i, inspirations.length)
    )
  }, [inspirations])

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {/* 退出按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold transition-all duration-200 active:scale-95"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.6), rgba(139,92,246,0.6))',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 0 24px rgba(99,102,241,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <ArrowLeft size={20} />
        <span className="text-base">退出星球</span>
      </button>

      {/* 深空背景 */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2e 30%, #1a1040 60%, #0d1b2a 100%)',
        }}
      />

      {/* 星云光斑 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'twinkle 8s ease-in-out infinite',
          }}
        />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'twinkle 6s ease-in-out infinite 2s',
          }}
        />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'twinkle 7s ease-in-out infinite 4s',
          }}
        />
      </div>

      {/* 背景星空 */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* 星球们 */}
      {planets.map(planet => (
        <div
          key={planet.id}
          className="absolute cursor-pointer group"
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: `float ${planet.floatDuration}s ease-in-out infinite`,
            animationDelay: `${planet.floatDelay}s`,
            zIndex: hoveredPlanet === planet.id ? 50 : 10,
          }}
          onMouseEnter={() => setHoveredPlanet(planet.id)}
          onMouseLeave={() => setHoveredPlanet(null)}
          onClick={() => navigate(`/inspiration/${planet.id}`)}
        >
          {/* 光晕 */}
          <div
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: planet.glowSize,
              height: planet.glowSize,
              background: `radial-gradient(circle, ${planet.color}44 0%, ${planet.color}11 50%, transparent 70%)`,
              filter: 'blur(4px)',
              transition: 'all 0.3s ease',
              opacity: hoveredPlanet === planet.id ? 1 : 0.6,
            }}
          />

          {/* 光环（部分星球有） */}
          {planet.hasRing && (
            <div
              className="absolute rounded-full border-2 opacity-50"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotateX(75deg)`,
                width: planet.size * 1.6,
                height: planet.size * 0.5,
                borderColor: `${planet.color}88`,
                borderRadius: '50%',
              }}
            />
          )}

          {/* 星球本体 */}
          <div
            className="rounded-full relative overflow-hidden transition-transform duration-300"
            style={{
              width: planet.size,
              height: planet.size,
              background: `radial-gradient(circle at 35% 35%, ${planet.color}cc, ${planet.color}66 50%, ${planet.color}33 100%)`,
              boxShadow: `
                0 0 ${planet.size * 0.5}px ${planet.color}66,
                inset 0 -${planet.size * 0.15}px ${planet.size * 0.3}px rgba(0,0,0,0.3),
                inset -${planet.size * 0.1}px -${planet.size * 0.1}px ${planet.size * 0.4}px rgba(255,255,255,0.1)
              `,
              transform: hoveredPlanet === planet.id ? 'scale(1.25)' : 'scale(1)',
            }}
          >
            {/* 表面高光 */}
            <div
              className="absolute rounded-full"
              style={{
                top: `${planet.size * 0.15}px`,
                left: `${planet.size * 0.2}px`,
                width: planet.size * 0.35,
                height: planet.size * 0.25,
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
              }}
            />

            {/* 大型星球有环形山细节 */}
            {planet.isLarge && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    bottom: `${planet.size * 0.2}px`,
                    right: `${planet.size * 0.25}px`,
                    width: planet.size * 0.2,
                    height: planet.size * 0.15,
                    background: 'rgba(0,0,0,0.15)',
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    top: `${planet.size * 0.35}px`,
                    right: `${planet.size * 0.15}px`,
                    width: planet.size * 0.1,
                    height: planet.size * 0.08,
                    background: 'rgba(0,0,0,0.12)',
                  }}
                />
              </>
            )}
          </div>

          {/* 悬停提示 */}
          {hoveredPlanet === planet.id && (
            <div
              className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl text-white text-xs font-medium whitespace-nowrap z-50 pointer-events-none"
              style={{
                top: -(planet.size / 2 + 36),
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                animation: 'slide-up 0.25s ease-out forwards',
              }}
            >
              {planet.title}
              {/* 小三角 */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                style={{ background: 'rgba(0,0,0,0.75)' }}
              />
            </div>
          )}
        </div>
      ))}

      {/* 空状态 */}
      {!loading && inspirations.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40">
          <div className="text-center px-6">
            <Telescope size={48} className="text-gray-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-white mb-2">你的灵感宇宙还是一片空白</h2>
            <p className="text-gray-400 text-sm mb-6">
              每写下一个灵感，就会有一颗属于你的星球在这里亮起
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 30px rgba(139,92,246,0.4)',
              }}
            >
              <Plus size={20} />
              写下第一个灵感
            </button>
          </div>
        </div>
      )}

      {/* 星球数量指示器 */}
      {inspirations.length > 0 && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-white text-xs font-medium pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          🌌 {inspirations.length} 颗灵感星球
        </div>
      )}
    </main>
  )
}
