// 手绘涂鸦图标 — 统一墨线、圆头、微微不对称
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function DoodleNotebook({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M15 8.5 C 13.4 8.7 12 10 12 12 L12 36 C 12 37.8 13.3 39 15 39 L34 38.6 C 36 38.5 37 37.2 37 35.5 L37 12 C 37 10 35.8 8.8 34 8.7 Z" />
      <path d="M18 8.8 L18 38.8" />
      <path d="M22 16.5 C 25 16.2 29 16.2 32 16.6" />
      <path d="M22 22 C 25 21.7 29 21.8 32 22.1" />
      <path d="M22 27.5 C 24.5 27.3 27 27.4 29 27.7" />
      <path d="M35.5 12.5 L40 17 L33 24 L29 25 L30 21 Z" />
    </svg>
  )
}

export function DoodleCat({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M13 19 L11 9.5 L19.5 14 C 21 13.3 23 13 24 13 C 25.2 13 27 13.3 28.5 14 L37 9.5 L35 19 C 37.2 21 38.3 24 38.3 26.6 C 38.3 33.5 32.5 38.5 24 38.5 C 15.5 38.5 9.7 33.5 9.7 26.6 C 9.7 24 10.8 21 13 19 Z" />
      <circle cx="19" cy="25.4" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="29" cy="25.4" r="1.4" fill="currentColor" stroke="none" />
      <path d="M21.8 30.2 Q 24 32.2 26.2 30.2" />
      <path d="M8 25 H4.5 M8 28 H4.8 M40 25 H43.5 M40 28 H43.2" />
      <path d="M24 13.2 L24 17" />
    </svg>
  )
}

export function DoodleBell({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M14 32.5 C 16.2 30.4 16.5 26.6 16.5 23.5 C 16.5 17.6 19.5 13.5 24 13.5 C 28.6 13.5 31.5 17.7 31.5 23.5 C 31.5 26.7 31.8 30.4 34 32.5 Z" />
      <path d="M20.3 35.2 Q 24 39.2 27.7 35.1" />
      <path d="M24 9.5 L24 13" />
      <path d="M37 12 L39 10 M11 12 L9 10" />
      <path d="M38.5 20 L41 19.5" />
    </svg>
  )
}

export function DoodleHouse({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M10 34 L10.3 22.2 L24 11.5 L37.8 22 L38 34 Z" />
      <path d="M18.5 34 L18.3 26 L29.8 26 L30 34" />
      <path d="M24 11.8 L24 6.5" />
      <path d="M8 36.5 C 18 38 31 38 40 36.4" />
    </svg>
  )
}

export function DoodleMap({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M8 13.5 L17.5 10 L30 13.8 L40 10.2 L39.7 34 L30 37.8 L17.6 34.1 L8 38 Z" />
      <path d="M17.5 10.2 L17.7 34" />
      <path d="M30 13.8 L30.2 37.8" />
      <path d="M11.5 21 C 14 17.8 18 18 20 21.2" />
      <path d="M33.5 26 L36 22 L38.5 26" />
    </svg>
  )
}

export function DoodlePlanet({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <circle cx="24" cy="23" r="10.2" />
      <path d="M8.5 28.5 C 15 33.2 33.5 33 39.5 26.6" />
      <path d="M40 20 L42 18.2 M39 35 L41 36.8 M9 16 L7 14.2" />
      <circle cx="20" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="26" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function DoodleChat({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M10.5 15.5 C 10.5 11.8 13.3 9.6 18 9.6 L31.5 9.8 C 36.3 9.9 38.6 12.6 38.6 16.6 L38.5 25.8 C 38.5 29.6 35.8 31.8 31 31.8 L22.5 31.8 L15 38 L15.8 31.6 C 12.4 31 10.5 28.8 10.5 25.5 Z" />
      <path d="M24.2 15.5 L26 20 L30.6 20.2 L27 23 L28.4 27.5 L24.2 24.9 L20 27.6 L21.4 23 L17.8 20.2 L22.4 20 Z" />
    </svg>
  )
}

export function DoodlePerson({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <circle cx="24" cy="15.5" r="6.2" />
      <path d="M12.5 38.5 C 13.5 31 18.2 27 24 27 C 30 27 34.6 31.2 35.6 38.6" />
      <path d="M19.5 15.2 C 20 14.6 20.6 14.4 21.4 14.5 M26.6 14.5 C 27.4 14.4 28 14.7 28.5 15.3" />
    </svg>
  )
}

export function DoodlePlus({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M24 10 C 24.2 17 24.1 31 24.2 38" />
      <path d="M10 24.2 C 17 24 31 24.1 38 24" />
    </svg>
  )
}

export function DoodleStar({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M24 6.5 L28.2 17.8 L40 20 L30.8 28.2 L33.2 40 L24 33.2 L14.8 40 L17.2 28.2 L8 20 L19.8 17.8 Z" />
    </svg>
  )
}

export function DoodleLeaf({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M11.5 36.5 C 9.8 22.5 19.5 10.5 37.5 10.5 C 37.8 28.5 26.5 38.2 11.5 36.5 Z" />
      <path d="M11.5 36.5 C 18 30 24 24 32 18" />
    </svg>
  )
}

export function DoodlePin({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" {...base}>
      <path d="M24 41 C 24 41 36 29.5 36 19.5 C 36 12.9 30.6 8 24 8 C 17.4 8 12 12.9 12 19.5 C 12 29.5 24 41 24 41 Z" />
      <circle cx="24" cy="19.5" r="4.5" />
    </svg>
  )
}

export function DoodleArrow({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 48 24" className={className} aria-hidden="true" {...base}>
      <path d="M4 13 C 14 11.5 28 11.8 42 12.2" />
      <path d="M35 6 L43 12.2 L35 18" />
    </svg>
  )
}
