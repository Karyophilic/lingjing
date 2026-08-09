import { useState, useCallback, useRef, useEffect } from 'react'

const DIALOGUES = [
  '嘿！有个灵感在偷偷溜走哦~ 快抓住它！',
  '你知道吗？每个伟大的创意都是从"随便记一下"开始的 ✨',
  '你的灵感库又长大了一点呢！好棒～',
  '别让好主意消失在脑子里啦，我会伤心的 💙',
  '灵感像星星，不抓住就飞走啦！⭐',
  '今天也是个灵感满满的日子！',
  '我看到一个超棒的点子在你脑子里转圈圈～',
  '嘘…我刚刚偷看了你的灵感库，潜力无限！',
  '每一个"算了不记了"的念头，都可能价值一百万哦💰',
  '累了就摸摸我的头吧，灵感会自己来找你的～',
  '其实啊，最好的灵感都藏在你的日常生活里 🌸',
  '叮咚！你的专属灵感小助手已上线～',
  '要不要试试把两个完全无关的东西组合在一起？超好玩的！',
  '灵感这种东西啊，越记越多，越不记越少呢 🤔',
  '我好喜欢看你记录灵感的样子！认真的你最棒了 🌟',
]

const DRAG_THRESHOLD = 5
const STORAGE_KEY = 'lingjing_mascot_pos'

function loadPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return null
}

function savePosition(pos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
  } catch (e) { /* ignore */ }
}

export default function Mascot() {
  const [dialogue, setDialogue] = useState(null)
  const [touches, setTouches] = useState(0)

  // 位置：用 left/top 存储，渲染时转为 right/bottom 定位（更直观的固定定位）
  const [pos, setPos] = useState(() => {
    const saved = loadPosition()
    if (saved) {
      return {
        left: saved.left ?? (window.innerWidth - (saved.right ?? 16) - 64),
        top: saved.top ?? (window.innerHeight - (saved.bottom ?? 96) - 80),
      }
    }
    return { left: window.innerWidth - 80, top: window.innerHeight - 180 }
  })

  // 拖拽核心 — 全部走 ref，拖拽期间不触发 React 重渲染
  const drag = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originLeft: 0,
    originTop: 0,
    moved: false,
  })

  const containerRef = useRef(null)

  // 每次位置变化持久化
  useEffect(() => {
    const el = containerRef.current
    const w = el?.offsetWidth || 64
    const h = el?.offsetHeight || 80
    savePosition({
      left: pos.left,
      top: pos.top,
      right: window.innerWidth - pos.left - w,
      bottom: window.innerHeight - pos.top - h,
    })
  }, [pos])

  // ---- Pointer Events 实现拖拽（统一鼠标 + 触屏）----
  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    drag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
    }
  }, [])

  const handlePointerMove = useCallback((e) => {
    const d = drag.current
    if (!d.active) return

    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      d.moved = true
    }

    const vw = window.innerWidth
    const vh = window.innerHeight
    const el = containerRef.current
    const elW = el?.offsetWidth || 64
    const elH = el?.offsetHeight || 80

    const newLeft = Math.max(0, Math.min(d.originLeft + dx, vw - elW))
    const newTop = Math.max(0, Math.min(d.originTop + dy, vh - elH - 56))

    setPos({ left: Math.round(newLeft), top: Math.round(newTop) })
  }, [])

  const handlePointerUp = useCallback((e) => {
    drag.current.active = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) { /* ignore */ }
  }, [])

  // 点击 → 对话（仅当没有拖拽时才触发）
  const handleClick = useCallback(() => {
    if (drag.current.moved) {
      // 重置 moved 标记，让下次点击正常触发
      drag.current.moved = false
      return
    }

    let newDialogue
    do {
      newDialogue = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]
    } while (newDialogue === dialogue && DIALOGUES.length > 1)

    setDialogue(newDialogue)
    setTouches(t => t + 1)

    setTimeout(() => setDialogue(null), 5000)
  }, [dialogue])

  // 双击归位
  const handleDoubleClick = useCallback(() => {
    setPos({
      left: window.innerWidth - 80,
      top: window.innerHeight - 180,
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed z-30 flex flex-col items-end gap-2 select-none"
      style={{ left: pos.left, top: pos.top }}
    >
      {/* Speech bubble */}
      {dialogue && (
        <div
          key={dialogue}
          className="speech-pop max-w-[220px] bg-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg border border-primary-100 text-sm text-gray-700 leading-relaxed relative"
        >
          {dialogue}
          <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white border border-primary-100 rotate-45 border-t-0 border-l-0" />
        </div>
      )}

      {/* 小灵儿 — 可拖拽（用 div 替代 button，避免浏览器默认行为干扰） */}
      <div
        role="button"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => { if (e.key === 'Enter') handleClick() }}
        className="relative w-16 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing
          focus:outline-none"
        style={{ touchAction: 'none' }}
        title="按住拖动 · 点击聊天 · 双击归位"
      >
        {/* Soft glow behind */}
        <div className="absolute inset-0 rounded-full gentle-glow" />

        {/* Body — blue gradient blob */}
        <div className="mascot-float relative w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 via-primary-400 to-primary-500 shadow-lg shadow-primary-400/30 flex items-center justify-center">
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-b from-white/30 to-transparent" />

          {/* Eyes */}
          <div className="relative z-10 flex gap-2.5 -mt-0.5">
            <div className="eye-blink w-2 h-2.5 rounded-full bg-gray-800 relative">
              <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
            </div>
            <div className="eye-blink w-2 h-2.5 rounded-full bg-gray-800 relative">
              <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Blush */}
          <div className="absolute bottom-2 left-1 w-2 h-1 rounded-full bg-pink-300/60" />
          <div className="absolute bottom-2 right-1 w-2 h-1 rounded-full bg-pink-300/60" />

          {/* Tiny mouth */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 border-b-2 border-gray-700 rounded-full" />
        </div>

        {/* Floating sparkles */}
        <div className="absolute -top-1 -right-0 sparkle" style={{ animationDelay: '0s' }}>
          <span className="text-xs">✨</span>
        </div>
        <div className="absolute -top-2 left-0 sparkle" style={{ animationDelay: '0.75s' }}>
          <span className="text-[10px]">⭐</span>
        </div>
        <div className="absolute top-2 -right-2 sparkle" style={{ animationDelay: '0.3s' }}>
          <span className="text-[8px]">💫</span>
        </div>

        {/* Label */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-primary-400 whitespace-nowrap pointer-events-none">
          小灵儿
        </span>
      </div>

      {/* Touch counter */}
      {touches >= 5 && touches < 10 && (
        <div className="absolute -top-6 -right-1 text-[10px] text-primary-400 animate-bounce pointer-events-none">
          ♥
        </div>
      )}
      {touches >= 10 && (
        <div className="absolute -top-6 -right-1 text-[10px] text-pink-400 animate-bounce pointer-events-none">
          ♥♥
        </div>
      )}
    </div>
  )
}
