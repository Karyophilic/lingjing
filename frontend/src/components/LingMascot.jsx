import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TIPS = [
  '今天有什么新念头？',
  '卡住了也没关系，说给我听听。',
  '把一闪而过的想法丢给我吧。',
  '要不要一起把两个灵感连起来？',
]

const STORAGE_KEY = 'lingjing_mascot_pos'

function clamp(x, y) {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    x: Math.max(12, Math.min(w - 76, x)),
    y: Math.max(72, Math.min(h - 150, y)),
  }
}

function LingFace({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M32 7.5 C 46 6.4 55.4 17 56.2 30.4 C 57 44.6 47 56.4 33 57 C 19 57.6 7.8 47 8 33 C 8.2 19 18.8 8.6 32 7.5 Z"
        fill="#DCE9EF" fillOpacity="0.9" stroke="#4A4A42" strokeWidth="2.2" strokeLinecap="round"
      />
      <path d="M21 25 C 28 19 38 18 44 22" fill="none" stroke="#FAF7EE" strokeOpacity="0.85" strokeWidth="4" strokeLinecap="round" />
      <path
        className="ling-eye"
        d="M22.6 33 C 23.4 27.6 30.4 26.6 32.3 31.5 C 34.2 36.4 29.6 41.4 25.8 39.6 C 23.4 38.6 22 36 22.6 33 Z"
        fill="#4A4A42"
      />
      <path
        className="ling-eye"
        d="M39 32 C 39.8 26.6 46.8 25.6 48.7 30.5 C 50.6 35.4 46 40.4 42.2 38.6 C 39.8 37.6 38.4 35 39 32 Z"
        fill="#4A4A42"
      />
      <path d="M24.4 30.2 q 2 -2 4 0 M41 29.2 q 2 -2 4 0" fill="none" stroke="#FAF7EE" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.4 40.6 q 4 -2.4 7 0 M43 40.4 q 4 -2.4 7 0" fill="none" stroke="#C98F7B" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 43.4 q 4 3 8 0" fill="none" stroke="#4A4A42" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M50 9 l 2 6 l 6 1.2 l -5 4.8 l 1.2 6 l -5 -3.8" fill="none" stroke="#4A4A42" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function LingMascot() {
  const navigate = useNavigate()
  const [pos, setPos] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [tipOpen, setTipOpen] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const containerRef = useRef(null)
  const posRef = useRef(null)
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 })

  const updatePos = (next) => {
    posRef.current = next
    setPos(next)
  }

  useEffect(() => {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { /* ignore */ }
    if (saved) {
      const initial = clamp(saved.x, saved.y)
      updatePos(initial)
    }
    const timer = setTimeout(() => setTipOpen(false), 5200)
    const onResize = () => {
      if (posRef.current) updatePos(clamp(posRef.current.x, posRef.current.y))
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const openChat = () => {
    navigate('/ai-chat')
  }

  const onPointerDown = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    const start = posRef.current || (rect ? { x: rect.left, y: rect.top } : { x: 16, y: 16 })
    if (!posRef.current) updatePos(start)
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: start.x,
      originY: start.y,
    }
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) > 5) d.moved = true
    if (d.moved) {
      updatePos(clamp(d.originX + dx, d.originY + dy))
    }
  }

  const onPointerUp = (e) => {
    const d = dragRef.current
    if (!d.active) return
    d.active = false
    setDragging(false)
    if (d.moved) {
      if (posRef.current) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current)) } catch { /* ignore */ }
      }
    } else {
      openChat()
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col items-center select-none"
      style={pos ? { left: pos.x, top: pos.y, touchAction: 'none' } : { right: 16, bottom: 104, touchAction: 'none' }}
    >
      {/* 对话气泡 */}
      {tipOpen && (
        <button
          onClick={openChat}
          className="absolute bottom-full right-0 mb-2 w-[190px] text-left px-3.5 py-2.5 sketch-card text-[12px] leading-relaxed text-ink-600"
          style={{ transform: 'rotate(-1deg)' }}
        >
          {TIPS[tipIndex]}
          <span className="absolute -bottom-1.5 right-6 w-3 h-3 bg-paper-200 border-r border-b border-ink-700/30 rotate-45" />
        </button>
      )}

      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => { setTipOpen(true); setTipIndex((i) => (i + 1) % TIPS.length) }}
        onMouseLeave={() => setTipOpen(false)}
        onClick={(e) => e.preventDefault()}
        className={`w-16 h-16 rounded-full bg-paper-50 border border-ink-700/35 grid place-items-center shadow-[3px_4px_0_rgba(74,74,66,0.12)] cursor-grab ${dragging ? 'cursor-grabbing' : 'mascot-float'}`}
        aria-label="问小灵儿"
        title="点我问 AI，拖动可以换位置"
      >
        <LingFace className="w-12 h-12 pointer-events-none" />
      </button>
      <span className="mt-1 text-[10px] text-ink-500 tracking-[0.08em] pointer-events-none">小灵儿</span>
    </div>
  )
}
