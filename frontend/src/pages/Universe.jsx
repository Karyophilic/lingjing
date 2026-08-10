import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { localInspirations } from '../api/local'
import { analyzeInspirationConnections, hasApiKey } from '../api/deepseek'
import { Plus, Telescope, ArrowLeft, Link2, X, Sparkles, Check } from 'lucide-react'

// 星球调色板 — 鲜亮高级，符合年轻人审美
const PLANET_COLORS = [
  '#FF6B6B', // 珊瑚红
  '#4ECDC4', // 薄荷绿
  '#FFD93D', // 暖金黄
  '#6C5CE7', // 紫罗兰
  '#A8E6CF', // 浅翡翠
  '#FF8C94', // 柔粉
  '#74B9FF', // 清透蓝
  '#FDCB6E', // 奶油橙
  '#00CEC9', // 蒂芙尼
  '#E17055', // 陶土
  '#A29BFE', // 淡紫
  '#55EFC4', // 薄荷
  '#FAB1A0', // 肉粉
  '#81ECEC', // 冰蓝
  '#F8A5C2', // 樱花粉
  '#7ED6DF', // 浅天蓝
  '#FFEAA7', // 鹅黄
  '#DFE6E9', // 银灰蓝
]

// 哈希——确定性种子
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 从 inspiration 生成星球属性
function planetFromInspiration(insp, index, total) {
  const h = hashString(insp.id)
  const r1 = seededRandom(h)
  const r2 = seededRandom(h + 1000)
  const r3 = seededRandom(h + 2000)
  const r4 = seededRandom(h + 3000)
  const r5 = seededRandom(h + 4000)
  const r6 = seededRandom(h + 5000)
  const r7 = seededRandom(h + 6000)

  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const radius = 15 + (index / Math.max(total, 1)) * 40
  const angle = index * goldenAngle + r1 * 0.3
  const ar = window.innerWidth / window.innerHeight
  const cx = 50 + radius * Math.cos(angle) * (1.3 + 0.3 * ar)
  const cy = 50 + radius * Math.sin(angle) * (1.3 + 0.3 / Math.max(ar, 0.5))
  const x = cx + (r2 - 0.5) * 10
  const y = cy + (r3 - 0.5) * 10

  const color = PLANET_COLORS[Math.floor(r4 * PLANET_COLORS.length)]
  const size = 26 + Math.floor(r5 * 32) // 26-58px
  const orbitRadius = 15 + Math.floor(r6 * 30) // 15-45px 轨道半径
  const orbitDuration = 12 + Math.floor(r7 * 24) // 12-36s

  return {
    id: insp.id,
    title: insp.title,
    tags: insp.tags,
    color,
    size,
    x: Math.max(8, Math.min(90, x)),
    y: Math.max(12, Math.min(85, y)),
    orbitRadius,
    orbitDuration,
    orbitDelay: (r7 * 5).toFixed(1),
    floatDelay: (r5 * 4).toFixed(2),
    floatDuration: (3 + r1 * 3).toFixed(2),
    hasRing: r3 > 0.55,
    hasCrater: size > 42,
    glowIntensity: 0.5 + r5 * 0.5,
  }
}

// 背景星星
function generateStars(count) {
  const stars = []
  for (let i = 0; i < count; i++) {
    const h = hashString(`star_${i}_v2`)
    stars.push({
      id: i,
      x: seededRandom(h) * 100,
      y: seededRandom(h + 100) * 100,
      size: 1 + seededRandom(h + 200) * 2.5,
      opacity: 0.3 + seededRandom(h + 300) * 0.7,
      delay: (seededRandom(h + 400) * 5).toFixed(2),
      duration: (1.5 + seededRandom(h + 500) * 3).toFixed(2),
    })
  }
  return stars
}

// 灵感联络配额管理
function getLinkQuota() {
  try {
    const raw = localStorage.getItem('lingjing_link_quota')
    if (!raw) return { date: '', used: 0 }
    return JSON.parse(raw)
  } catch { return { date: '', used: 0 } }
}

function useLinkQuota() {
  const today = new Date().toDateString()
  const quota = getLinkQuota()
  if (quota.date !== today) {
    const reset = { date: today, used: 0 }
    localStorage.setItem('lingjing_link_quota', JSON.stringify(reset))
    return { used: 0, remaining: 3 }
  }
  return { used: quota.used, remaining: Math.max(0, 3 - quota.used) }
}

function incrementLinkQuota() {
  const { date, used } = getLinkQuota()
  const today = new Date().toDateString()
  localStorage.setItem('lingjing_link_quota', JSON.stringify({
    date: date === today ? date : today,
    used: date === today ? used + 1 : 1,
  }))
}

// SVG 连线
function ConnectionLines({ planets, selectedIds }) {
  const selected = planets.filter(p => selectedIds.has(p.id))
  if (selected.length < 2) return null

  const lines = []
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i], b = selected[j]
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2 - 8
      lines.push(
        <path
          key={`${a.id}-${b.id}`}
          d={`M ${a.x}% ${a.y}% Q ${midX}% ${midY}% ${b.x}% ${b.y}%`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,4"
          className="animate-pulse"
          style={{ animationDuration: `${2 + (i+j) % 3}s` }}
        />
      )
    }
  }
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }}>
      {lines}
    </svg>
  )
}

export default function Universe() {
  const navigate = useNavigate()
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const containerRef = useRef(null)

  const stars = useMemo(() => generateStars(150), [])
  const quota = useLinkQuota()

  useEffect(() => {
    const res = localInspirations.getMyList(1, 200)
    if (res.success) {
      setInspirations(res.data.items.filter(i => !i.is_archived))
    }
    setLoading(false)
  }, [])

  const planets = useMemo(() =>
    inspirations.map((insp, i) => planetFromInspiration(insp, i, inspirations.length)),
    [inspirations]
  )

  const handlePlanetClick = (planetId) => {
    if (selectMode) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(planetId)) next.delete(planetId)
        else if (next.size < 5) next.add(planetId)
        return next
      })
    } else {
      navigate(`/inspiration/${planetId}`)
    }
  }

  const enterSelectMode = () => {
    if (planets.length < 2) return
    setSelectMode(true)
    setSelectedIds(new Set())
    setShowAnalysis(false)
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const handleAnalyze = async () => {
    if (selectedIds.size < 2) return
    if (quota.remaining <= 0 && !hasApiKey()) return

    setAnalyzing(true)
    setShowAnalysis(true)

    const selectedPlanets = planets.filter(p => selectedIds.has(p.id))
    const selectedInsp = inspirations.filter(i => selectedIds.has(i.id))

    try {
      let result
      if (hasApiKey()) {
        result = await analyzeInspirationConnections(selectedInsp)
        incrementLinkQuota()
      } else {
        // 无 API Key 时的本地分析
        await new Promise(r => setTimeout(r, 1500))
        const allTags = new Set()
        selectedInsp.forEach(i => (i.tags || []).forEach(t => allTags.add(t)))
        const tagList = [...allTags]
        const commonTag = tagList.length > 0 ? tagList[0] : '创意'
        result = `✨ 我发现了！这 ${selectedInsp.length} 颗星球都在围绕"${commonTag}"这个主题发光呢～\n\n它们像是同一个星系里的不同星星，虽然各有各的光芒，但冥冥之中互相吸引。\n\n💡 试试把它们结合起来：${selectedInsp[0].title.slice(0, 15)} + ${selectedInsp[Math.min(1, selectedInsp.length-1)].title.slice(0, 15)}，会碰撞出什么新火花？`
      }
      setAnalysis(result)
    } catch (e) {
      setAnalysis('🤔 嗯...这些星球之间的联系有点微妙，让我再仔细看看～\n\n也许它们之间的关联需要更多时间来显现。试试记录更多灵感，让星球的连接更加清晰！')
    } finally {
      setAnalyzing(false)
      exitSelectMode()
    }
  }

  return (
    <main ref={containerRef} className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {/* 退出按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold transition-all duration-200 active:scale-95"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'linear-gradient(135deg, rgba(91,155,213,0.6), rgba(108,92,231,0.6))',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 0 24px rgba(108,92,231,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <ArrowLeft size={20} />
        <span className="text-base">退出星球</span>
      </button>

      {/* 深空背景 */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2e 30%, #1a1040 60%, #0d1b2a 100%)' }}
      />

      {/* 星云光斑 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/3 right-1/5 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(0,206,201,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 left-1/2 w-56 h-56 rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, rgba(255,107,107,0.5) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* 背景星空 */}
      {stars.map(star => (
        <div key={star.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`, top: `${star.y}%`,
            width: star.size, height: star.size,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* 连线 SVG */}
      {selectMode && <ConnectionLines planets={planets} selectedIds={selectedIds} />}

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
            zIndex: selectMode && selectedIds.has(planet.id) ? 50 : 10,
          }}
          onClick={() => handlePlanetClick(planet.id)}
        >
          {/* 轨道环 */}
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: planet.orbitRadius * 2 + planet.size,
              height: planet.orbitRadius * 2 + planet.size,
              borderColor: `${planet.color}22`,
              borderWidth: '1px',
              borderStyle: 'dashed',
            }}
          />

          {/* 轨道上的星球 */}
          <div
            style={{
              animation: `orbit ${planet.orbitDuration}s linear infinite`,
              animationDelay: `${planet.orbitDelay}s`,
              '--orbit-radius': `${planet.orbitRadius}px`,
            }}
          >
            {/* 光晕 */}
            <div className="absolute rounded-full"
              style={{
                left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: planet.size + 16,
                height: planet.size + 16,
                background: `radial-gradient(circle, ${planet.color}44 0%, ${planet.color}11 50%, transparent 70%)`,
                filter: 'blur(4px)',
              }}
            />

            {/* 光环 */}
            {planet.hasRing && (
              <div className="absolute rounded-full border-2 opacity-40"
                style={{
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%) rotateX(75deg)',
                  width: planet.size * 1.5,
                  height: planet.size * 0.45,
                  borderColor: `${planet.color}88`,
                }}
              />
            )}

            {/* 星球本体 */}
            <div className="rounded-full relative overflow-hidden"
              style={{
                width: planet.size, height: planet.size,
                background: `radial-gradient(circle at 35% 35%, ${planet.color}ee, ${planet.color}88 50%, ${planet.color}44 100%)`,
                boxShadow: `0 0 ${planet.size * 0.6}px ${planet.color}88, inset 0 -${planet.size * 0.15}px ${planet.size * 0.3}px rgba(0,0,0,0.25), inset -${planet.size * 0.1}px -${planet.size * 0.1}px ${planet.size * 0.4}px rgba(255,255,255,0.15)`,
              }}
            >
              {/* 表面高光 */}
              <div className="absolute rounded-full"
                style={{
                  top: `${planet.size * 0.12}px`, left: `${planet.size * 0.18}px`,
                  width: planet.size * 0.38, height: planet.size * 0.28,
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
                }}
              />
              {/* 环形山 */}
              {planet.hasCrater && (
                <>
                  <div className="absolute rounded-full"
                    style={{
                      bottom: `${planet.size * 0.2}px`, right: `${planet.size * 0.22}px`,
                      width: planet.size * 0.18, height: planet.size * 0.13,
                      background: 'rgba(0,0,0,0.12)',
                    }}
                  />
                  <div className="absolute rounded-full"
                    style={{
                      top: `${planet.size * 0.4}px`, right: `${planet.size * 0.12}px`,
                      width: planet.size * 0.1, height: planet.size * 0.08,
                      background: 'rgba(0,0,0,0.1)',
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* 选择模式标记 */}
          {selectMode && (
            <div
              className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all ${
                selectedIds.has(planet.id)
                  ? 'bg-white text-purple-600 shadow-lg scale-110'
                  : 'bg-white/30 text-white/60'
              }`}
              style={{ border: '2px solid white' }}
            >
              {selectedIds.has(planet.id) && <Check size={14} />}
            </div>
          )}

          {/* 悬停提示（非选择模式） */}
          {!selectMode && (
            <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ top: -(planet.size / 2 + 36), background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            >
              {planet.title}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: 'rgba(0,0,0,0.75)' }} />
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
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white transition-all duration-200 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #5B9BD5, #6C5CE7)', boxShadow: '0 0 30px rgba(108,92,231,0.4)' }}
            >
              <Plus size={20} /> 写下第一个灵感
            </button>
          </div>
        </div>
      )}

      {/* 底部按钮区 */}
      {inspirations.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
          {/* 选择模式提示 */}
          {selectMode && (
            <div className="px-4 py-2 rounded-full text-white text-sm font-medium animate-bounce-in"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              已选 {selectedIds.size}/5 颗星球
              {selectedIds.size >= 2 && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || (quota.remaining <= 0 && !hasApiKey())}
                  className="ml-3 px-4 py-1.5 rounded-full text-white font-semibold text-sm transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #5B9BD5, #6C5CE7)' }}
                >
                  {analyzing ? '分析中...' : '✨ 确认连线'}
                </button>
              )}
              <button onClick={exitSelectMode} className="ml-2 p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
          )}

          {/* 灵感联络按钮 */}
          {!selectMode && (
            <button
              onClick={enterSelectMode}
              disabled={planets.length < 2}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold transition-all duration-200 active:scale-95 disabled:opacity-40"
              style={{
                backdropFilter: 'blur(12px)',
                background: 'linear-gradient(135deg, rgba(91,155,213,0.5), rgba(108,92,231,0.5))',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 20px rgba(108,92,231,0.3)',
              }}
            >
              <Link2 size={18} /> 灵感联络
              <span className="text-xs opacity-70 ml-1">
                (今日剩余 {quota.remaining}/3)
              </span>
            </button>
          )}

          {/* 星球数量 */}
          <div className="px-4 py-2 rounded-full text-white text-xs font-medium pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            🌌 {inspirations.length} 颗灵感星球
          </div>
        </div>
      )}

      {/* AI 分析弹窗 */}
      {showAnalysis && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowAnalysis(false)}
        >
          <div className="mx-4 max-w-sm w-full rounded-3xl p-6 animate-bounce-in shadow-2xl"
            style={{ background: 'linear-gradient(160deg, #1a1040, #0f0f2e)', border: '1px solid rgba(255,255,255,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-primary-500 flex items-center justify-center text-lg shadow-lg">
                ✨
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">小灵儿 · 灵感分析</h3>
                <p className="text-gray-400 text-xs">星球连线结果</p>
              </div>
              <button
                onClick={() => setShowAnalysis(false)}
                className="ml-auto p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {analyzing ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-primary-500 flex items-center justify-center animate-pulse mb-3">
                  <Sparkles size={24} className="text-white" />
                </div>
                <p className="text-gray-300 text-sm">正在分析星球之间的关联...</p>
              </div>
            ) : (
              <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {analysis}
              </div>
            )}

            <button
              onClick={() => setShowAnalysis(false)}
              className="w-full mt-4 py-2.5 rounded-2xl text-white font-medium text-sm transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* 额度用完提示 */}
      {selectMode && quota.remaining <= 0 && !hasApiKey() && selectedIds.size >= 2 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl text-white text-sm text-center animate-bounce-in"
          style={{ background: 'rgba(255,140,105,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,140,105,0.3)' }}
        >
          <p>今天的灵感联络次数已用完~</p>
          <p className="text-xs opacity-70 mt-1">明天再来探索吧！✨ 或配置 DeepSeek API Key 获得无限次数</p>
        </div>
      )}
    </main>
  )
}
