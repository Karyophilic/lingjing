import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { localInspirations } from '../api/local'
import { analyzeInspirationConnections, hasApiKey } from '../api/deepseek'
import {
  Plus, Link2, X, Sparkles, Check,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  DoodleStar, DoodleLeaf, DoodleCat, DoodleNotebook,
  DoodleImage, DoodleMap, DoodleNote,
} from '../components/Doodle'

// 低饱和标本色 — 与全站奶油纸 / 墨色统一
const TONES = [
  { main: '#8FA07C', soft: '#DCE3D0', ink: '#4A5A3C' },
  { main: '#8FB4C9', soft: '#DCE9EF', ink: '#3F5A68' },
  { main: '#B97A5A', soft: '#EBD8CB', ink: '#6E3D2A' },
  { main: '#A66B4E', soft: '#E7D3C4', ink: '#6B4530' },
  { main: '#9C9788', soft: '#E5E1D6', ink: '#5A574C' },
  { main: '#B7A98A', soft: '#EBE4D2', ink: '#6B5F45' },
]

const GLYPHS = [
  [/科技|编程|代码|AI|算法|产品/i, DoodleStar],
  [/设计|艺术|绘画|摄影/i, DoodleImage],
  [/写作|文字|文案|故事|日记/i, DoodleNotebook],
  [/音乐|音频|歌|播客/i, DoodleNote],
  [/商业|创业|品牌|营销/i, DoodleMap],
  [/生活|日常|美食|旅行|城市/i, DoodleLeaf],
  [/学习|教育|知识|读书/i, DoodleNotebook],
  [/游戏|影视|视频|电影/i, DoodleImage],
  [/哲学|心理|情绪|思考/i, DoodleCat],
  [/健康|运动|身体/i, DoodleLeaf],
]

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

function toneOf(insp) {
  return TONES[hashString(insp.id) % TONES.length]
}

function glyphOf(insp) {
  const text = `${insp.title || ''} ${(insp.tags || []).join(' ')}`
  for (const [re, glyph] of GLYPHS) {
    if (re.test(text)) return glyph
  }
  return DoodleStar
}

function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function fullDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// 黄金角散布 + 轻量排斥：保留星图的手作感，同时避免节点与标签互相压住
function layoutNodes(items) {
  const n = items.length
  if (n === 0) return []
  const narrow = typeof window !== 'undefined' && window.innerWidth < 640
  const x0 = 8, x1 = 92
  const y0 = narrow ? 19 : 14
  const y1 = narrow ? 61 : 68
  const cy = (y0 + y1) / 2

  const points = items.map((insp, i) => {
    const h = hashString(insp.id)
    const angle = i * 2.399963 + seededRandom(h) * 0.9
    const radius = Math.sqrt((i + 0.8) / n)
    const x = 50 + Math.cos(angle) * radius * 40 + (seededRandom(h + 1) - 0.5) * 7
    const y = cy + Math.sin(angle) * radius * ((y1 - y0) / 2) * 0.92 + (seededRandom(h + 2) - 0.5) * 5
    return { insp, x, y }
  })

  const minX = narrow ? 18.5 : 11
  const minY = narrow ? 7.6 : 12.4
  for (let iter = 0; iter < 140; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = points[i], b = points[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
          const pushX = (minX - Math.abs(dx)) / 2 + 0.01
          const pushY = (minY - Math.abs(dy)) / 2 + 0.01
          const sx = dx === 0 ? (seededRandom(i * 13 + j) > 0.5 ? 1 : -1) : Math.sign(dx)
          const sy = dy === 0 ? (seededRandom(i * 7 + j) > 0.5 ? 1 : -1) : Math.sign(dy)
          a.x += sx * pushX
          b.x -= sx * pushX
          a.y += sy * pushY
          b.y -= sy * pushY
        }
      }
    }
    for (const p of points) {
      p.x = Math.max(x0, Math.min(x1, p.x))
      p.y = Math.max(y0, Math.min(y1, p.y))
    }
  }

  return points.map(({ insp, x, y }, i) => {
    const h = hashString(insp.id)
    const compact = narrow || n > 26
    const wide = !narrow && typeof window !== 'undefined' && window.innerWidth >= 1024
    const size = Math.round(((compact ? 28 : 36) + seededRandom(h + 3) * (compact ? 10 : 18)) * (wide ? 1.3 : 1))
    return {
      ...insp,
      tone: toneOf(insp),
      glyph: glyphOf(insp),
      x,
      y,
      size,
      showLabel: !(narrow && n > 18),
      delay: ((i * 0.035) % 0.7).toFixed(2),
    }
  })
}

function ConnectionLines({ nodes, selectedIds }) {
  const selected = nodes.filter((n) => selectedIds.has(n.id))
  if (selected.length < 2) return null
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} aria-hidden="true">
      {selected.map((a, i) =>
        selected.slice(i + 1).map((b) => (
          <line
            key={`${a.id}-${b.id}`}
            x1={`${a.x}%`} y1={`${a.y}%`}
            x2={`${b.x}%`} y2={`${b.y}%`}
            stroke="rgba(43,39,31,0.3)"
            strokeWidth="1"
            strokeDasharray="3 6"
            strokeLinecap="round"
          />
        )),
      )}
    </svg>
  )
}

export default function Universe() {
  const navigate = useNavigate()
  const [inspirations, setInspirations] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('map')
  const [activeYear, setActiveYear] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const res = localInspirations.getMyList(1, 200)
    if (res.success) {
      setInspirations(res.data.items.filter((i) => !i.is_archived))
    }
    setLoading(false)
  }, [])

  const years = useMemo(() => {
    const set = new Set(
      inspirations
        .map((i) => new Date(i.created_at).getFullYear())
        .filter((y) => Number.isFinite(y)),
    )
    if (set.size === 0) set.add(new Date().getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [inspirations])

  useEffect(() => {
    if (activeYear === null || !years.includes(activeYear)) {
      setActiveYear(years[0] || new Date().getFullYear())
    }
  }, [years, activeYear])

  const yearItems = useMemo(() => {
    if (activeYear === null) return []
    return inspirations
      .filter((i) => new Date(i.created_at).getFullYear() === activeYear)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [inspirations, activeYear])

  const nodes = useMemo(() => layoutNodes(yearItems), [yearItems])

  const yearIndex = years.indexOf(activeYear)
  const canPrev = yearIndex >= 0 && yearIndex < years.length - 1
  const canNext = yearIndex > 0

  const changeYear = (delta) => {
    const next = years[yearIndex + delta]
    if (next === undefined) return
    setActiveYear(next)
    exitSelectMode()
  }

  const handleNodeClick = (id) => {
    if (selectMode) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else if (next.size < 5) next.add(id)
        return next
      })
    } else {
      navigate(`/inspiration/${id}`)
    }
  }

  const enterSelectMode = () => {
    if (nodes.length < 2) return
    setView('map')
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
    if (!hasApiKey()) {
      navigate('/ai-chat?settings=api')
      return
    }
    setAnalyzing(true)
    setShowAnalysis(true)
    const selectedInsp = inspirations.filter((i) => selectedIds.has(i.id))
    try {
      const result = await analyzeInspirationConnections(selectedInsp)
      setAnalysis(result)
    } catch (e) {
      setAnalysis(`AI 分析失败：${e.message || '请检查 AI 接口配置'}`)
    } finally {
      setAnalyzing(false)
      exitSelectMode()
    }
  }

  return (
    <main ref={containerRef} className="fixed inset-0 overflow-hidden atlas-shell" style={{ zIndex: 1 }}>
      {/* 顶部：关闭 + 视图切换 */}
      <header className="absolute top-0 inset-x-0 z-40 px-4 pt-4 flex items-start justify-between">
        <button onClick={() => navigate(-1)} className="atlas-close" aria-label="退出星球">
          <X size={18} />
        </button>

        <div className="atlas-tabs" role="tablist" aria-label="星球视图">
          <button
            role="tab"
            aria-selected={view === 'map'}
            data-active={view === 'map'}
            className="atlas-tab"
            onClick={() => setView('map')}
          >
            星球
          </button>
          <button
            role="tab"
            aria-selected={view === 'archive'}
            data-active={view === 'archive'}
            className="atlas-tab"
            onClick={() => { setView('archive'); exitSelectMode() }}
          >
            档案
          </button>
        </div>

        <div className="w-10" aria-hidden="true" />
      </header>

      {view === 'map' ? (
        <>
          <div className="absolute inset-0 atlas-grid pointer-events-none" />

          {selectMode && <ConnectionLines nodes={nodes} selectedIds={selectedIds} />}

          {/* 星球节点 */}
          <div className="absolute inset-0" key={`${activeYear}-${nodes.length}`}>
            {nodes.map((node) => {
              const selected = selectedIds.has(node.id)
              const Glyph = node.glyph
              return (
                <button
                  key={node.id}
                  className="atlas-node"
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    animationDelay: `${node.delay}s`,
                    zIndex: selected ? 20 : 10,
                  }}
                  data-selected={selected}
                  onClick={() => handleNodeClick(node.id)}
                  aria-label={`${node.title}，${formatDate(node.created_at)}`}
                >
                  <span className="atlas-date">{formatDate(node.created_at)}</span>
                  <span
                    className="atlas-orb"
                    style={{
                      width: node.size,
                      height: node.size,
                      background: `radial-gradient(circle at 34% 28%, #FFFBEF 0%, ${node.tone.soft} 40%, ${node.tone.main}99 100%)`,
                      borderColor: 'rgba(74,74,66,0.62)',
                    }}
                  >
                    <span className="atlas-glyph" style={{ color: node.tone.ink }}>
                      <Glyph className="w-4 h-4" />
                    </span>
                  </span>
                  {node.showLabel && (
                    <span className="atlas-label">
                      {(node.tags && node.tags[0]) || '灵感'}
                    </span>
                  )}
                  <span className="atlas-tip">{node.title}</span>
                  {selected && (
                    <span className="atlas-check"><Check size={10} strokeWidth={3} /></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 选择模式提示 */}
          {selectMode && (
            <div className="absolute top-[72px] inset-x-0 z-40 flex justify-center px-4">
              <div className="atlas-action" style={{ cursor: 'default' }}>
                <span>已选 {selectedIds.size} / 5 颗</span>
                <span className="text-ink-300">·</span>
                <span className="text-ink-500">选 2 颗以上可连线</span>
                {selectedIds.size >= 2 && (
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="ml-1 px-3 py-1 rounded-full bg-ink-800 text-paper-50 text-[11px] disabled:opacity-50"
                  >
                    {analyzing ? '分析中…' : '确认连线'}
                  </button>
                )}
                <button onClick={exitSelectMode} className="p-1 rounded-full hover:bg-ink-800/10" aria-label="退出选择">
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* 底部年份与说明 */}
          {inspirations.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-5">
              <div className="relative flex flex-col items-center">
                <div className="atlas-year">
                  <button onClick={() => changeYear(-1)} disabled={!canPrev} aria-label="上一年">
                    <ChevronLeft size={15} />
                  </button>
                  <span>{activeYear}</span>
                  <button onClick={() => changeYear(1)} disabled={!canNext} aria-label="下一年">
                    <ChevronRight size={15} />
                  </button>
                </div>
                <p className="atlas-caption">
                  这一年，你在这里留下 <b>{yearItems.length}</b> 颗星球
                </p>
                <p className="atlas-sub">灵感交错在小宇宙中，慢慢长大</p>

                <div className="absolute right-0 bottom-1 hidden sm:block">
                  <button
                    onClick={selectMode ? exitSelectMode : enterSelectMode}
                    disabled={!selectMode && nodes.length < 2}
                    className="atlas-action disabled:opacity-40"
                    data-solid={selectMode}
                  >
                    <Link2 size={13} />
                    {selectMode ? '退出连线' : '灵感连线'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!loading && inspirations.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-30 px-8 text-center">
              <p className="eyebrow mb-3">ATLAS · {new Date().getFullYear()}</p>
              <h2 className="text-2xl text-ink-800 mb-2">这片宇宙还没有星球</h2>
              <p className="text-sm text-ink-500 leading-relaxed mb-6 max-w-xs">
                每记录一个灵感，就会有一颗属于你的星球在这里亮起。从第一个开始。
              </p>
              <button onClick={() => navigate('/')} className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> 写下第一个灵感
              </button>
            </div>
          )}

          {/* 移动端连线按钮 */}
          {inspirations.length > 0 && (
            <div className="absolute right-4 bottom-36 z-30 sm:hidden">
              <button
                onClick={selectMode ? exitSelectMode : enterSelectMode}
                disabled={!selectMode && nodes.length < 2}
                className="atlas-action disabled:opacity-40"
                data-solid={selectMode}
              >
                <Link2 size={13} />
                {selectMode ? '退出连线' : '连线'}
              </button>
            </div>
          )}
        </>
      ) : (
        /* 档案视图 */
        <div className="absolute inset-0 overflow-y-auto pt-20 pb-10 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="eyebrow mb-1">ARCHIVE · {activeYear}</p>
                <h1 className="text-3xl text-ink-800">灵感档案</h1>
              </div>
              <p className="text-xs text-ink-400 tracking-wide">
                共 {yearItems.length} 件
              </p>
            </div>

            {yearItems.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-3xl mb-3">○</p>
                <p className="text-ink-600 mb-1">这一年还没有档案</p>
                <p className="text-xs text-ink-400">换一个年份，或者先记录一个新灵感。</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[...yearItems].reverse().map((insp, i) => {
                  const tone = toneOf(insp)
                  return (
                    <button
                      key={insp.id}
                      onClick={() => navigate(`/inspiration/${insp.id}`)}
                      className="archive-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="archive-index">№ {String(i + 1).padStart(3, '0')}</span>
                        <span className="text-[10px] text-ink-400 tracking-wide">{fullDate(insp.created_at)}</span>
                      </div>
                      <h3 className="archive-title">{insp.title}</h3>
                      {insp.content && (
                        <p className="mt-2 text-[11px] leading-relaxed text-ink-500 line-clamp-2">
                          {insp.content}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(insp.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                      <span className="archive-seal" style={{ background: tone.main }} />
                    </button>
                  )
                })}
              </div>
            )}

            {inspirations.length > 0 && (
              <div className="flex items-center justify-center mt-8">
                <div className="atlas-year">
                  <button onClick={() => changeYear(-1)} disabled={!canPrev} aria-label="上一年">
                    <ChevronLeft size={15} />
                  </button>
                  <span>{activeYear}</span>
                  <button onClick={() => changeYear(1)} disabled={!canNext} aria-label="下一年">
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI 分析弹窗 */}
      {showAnalysis && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm px-4"
          onClick={() => setShowAnalysis(false)}
        >
          <div className="w-full max-w-sm atlas-modal p-6 animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="eyebrow mb-1">XIAOLINGER · 联觉档案</p>
                <h3 className="text-lg text-ink-800">星球之间的暗线</h3>
              </div>
              <button onClick={() => setShowAnalysis(false)} className="p-1 rounded-full hover:bg-ink-800/5" aria-label="关闭">
                <X size={16} className="text-ink-400" />
              </button>
            </div>
            <div className="h-px bg-beige-300 mb-4" />

            {analyzing ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-10 h-10 rounded-full border border-spark-400/40 bg-spark-400/15 grid place-items-center animate-pulse mb-4">
                  <Sparkles size={18} className="text-spark-500" />
                </div>
                <p className="text-sm text-ink-500">小灵儿正在翻找它们之间的暗线…</p>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto text-ink-700">
                {analysis}
              </div>
            )}

            <button onClick={() => setShowAnalysis(false)} className="btn-primary w-full mt-5 py-2.5 text-sm">
              收起
            </button>
          </div>
        </div>
      )}

      {/* 未接入 AI 提示 */}
      {selectMode && !hasApiKey() && selectedIds.size >= 2 && (
        <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-center animate-bounce-in w-[min(92vw,360px)]"
          style={{ background: '#FCF7EB', border: '1px solid #D9BE8A', boxShadow: '0 12px 28px rgba(43,39,31,0.12)' }}
        >
          <p className="text-xs text-ink-600">AI 连线需要先在设置里接入接口</p>
          <button
            onClick={() => navigate('/ai-chat?settings=api')}
            className="mt-2 text-xs text-spark-500 underline underline-offset-4"
          >
            去配置 AI 接口 →
          </button>
        </div>
      )}
    </main>
  )
}
