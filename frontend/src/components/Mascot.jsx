import { useState, useCallback, useEffect, useRef } from 'react'

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

const DRAG_THRESHOLD = 5 // px — 超过此距离视为拖拽而非点击
const STORAGE_KEY = 'lingjing_mascot_pos'
const DEFAULT_RIGHT = 16
const DEFAULT_BOTTOM = 96

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
  const [animating, setAnimating] = useState(false)
  const [touches, setTouches] = useState(0)

  // 拖拽状态
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    moved: false,
  })

  // 位置：用 right/bottom 定位（便于初始位置和持久化）
  const [position, setPosition] = useState(() => {
    const saved = loadPosition()
    return saved || { right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM }
  })

  // 容器 ref 用于获取尺寸做边界限制
  const containerRef = useRef(null)

  // 持久化位置
  useEffect(() => {
    savePosition(position)
  }, [position])

  // 全局移动 & 释放
  useEffect(() => {
    const handleMove = (e) => {
      const drag = dragRef.current
      if (!drag.isDragging) return

      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY

      const dx = clientX - drag.startX
      const dy = clientY - drag.startY

      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        drag.moved = true
      }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const elW = containerRef.current?.offsetWidth || 64
      const elH = containerRef.current?.offsetHeight || 80

      // 从 right/bottom 坐标系转换：right = vw - left - width, bottom = vh - top - height
      const left = drag.startLeft + dx
      const top = drag.startTop + dy

      // 限制边界
      const clampedLeft = Math.max(0, Math.min(left, vw - elW))
      const clampedTop = Math.max(0, Math.min(top, vh - elH - 56)) // 56 = navbar height

      setPosition({
        right: Math.round(vw - clampedLeft - elW),
        bottom: Math.round(vh - clampedTop - elH),
      })
    }

    const handleUp = () => {
      const drag = dragRef.current
      drag.isDragging = false
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [])

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    const el = containerRef.current
    const rect = el?.getBoundingClientRect()
    const left = rect?.left ?? (window.innerWidth - position.right - 64)
    const top = rect?.top ?? (window.innerHeight - position.bottom - 80)

    dragRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      startLeft: left,
      startTop: top,
      moved: false,
    }
  }

  const handleClick = useCallback(() => {
    // 如果刚完成拖拽，不触发对话
    if (dragRef.current.moved) return

    let newDialogue
    do {
      newDialogue = DIALOGUES[Math.floor(Math.random() * DIALOGUES.length)]
    } while (newDialogue === dialogue && DIALOGUES.length > 1)

    setDialogue(newDialogue)
    setAnimating(true)
    setTouches(t => t + 1)

    setTimeout(() => setDialogue(null), 5000)
    setTimeout(() => setAnimating(false), 400)
  }, [dialogue])

  // 双击回到默认位置
  const handleDoubleClick = () => {
    setPosition({ right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM })
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-30 flex flex-col items-end gap-2 select-none"
      style={{
        right: position.right,
        bottom: position.bottom,
        transition: dragRef.current.isDragging ? 'none' : undefined,
      }}
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

      {/* 小灵儿 — 可拖拽 */}
      <button
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className="relative w-16 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing
          active:scale-90 transition-transform duration-200 focus:outline-none touch-none"
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
      </button>

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
