// 首页手绘插画 — 小灵儿的灵感书桌（原创场景，不复刻参考图）
export default function HeroSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 470"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* 水彩底 */}
      <ellipse cx="210" cy="360" rx="230" ry="92" fill="#A9B79A" opacity="0.12" />
      <ellipse cx="640" cy="350" rx="190" ry="86" fill="#A9C6D8" opacity="0.12" />
      <ellipse cx="430" cy="300" rx="180" ry="70" fill="#E6DCC6" opacity="0.18" />

      {/* 漂浮的小涂鸦 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M110 156 q 8 -13 21 -6 q 8 -9 19 -2 q 10 -1 10 8 q -1 6 -12 6 l -31 0 q -9 0 -7 -6 Z" />
        <path d="M648 132 q 7 -10 18 -4 q 6 -7 15 -1 q 8 0 8 7 q -1 5 -10 5 l -26 0 q -7 0 -5 -7 Z" />
        <path d="M712 176 l 6 16 l 18 3 l -14 12 l 4 17 l -14 -10 l -15 10 l 4 -17 l -14 -12 l 18 -3 Z" stroke="#8B5E4A" />
        <path d="M76 260 l 4 10 l 10 2 l -8 8 l 2 10 l -8 -6 l -9 6 l 2 -10 l -8 -8 l 10 -2 Z" strokeOpacity="0.3" />
        <path d="M740 250 q 16 -8 28 6" strokeOpacity="0.35" />
        <path d="M748 236 l 20 -14 l -4 14 l 14 2 l -20 14 Z" strokeOpacity="0.35" />
      </g>

      {/* 桌面 */}
      <path d="M40 402 C 160 392 300 406 430 396 C 560 386 680 400 760 392" fill="none" stroke="#4A4A42" strokeOpacity="0.6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M80 414 q 30 -3 60 0 M320 412 q 26 -3 52 0 M590 406 q 28 -3 56 0" fill="none" stroke="#4A4A42" strokeOpacity="0.22" strokeWidth="1.2" strokeLinecap="round" />

      {/* 便签 */}
      <g transform="rotate(-7 143 256)">
        <rect x="95" y="214" width="96" height="84" rx="3" fill="#DCE9EF" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M110 236 q 30 -4 62 0 M110 252 q 24 -3 50 0 M110 268 q 30 -3 56 0" fill="none" stroke="#4A4A42" strokeOpacity="0.35" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M142 283 l 4 10 l 11 1 l -9 7 l 3 11 l -9 -7 l -9 7 l 3 -11 l -9 -7 l 11 -1 Z" fill="none" stroke="#8B5E4A" strokeOpacity="0.65" strokeWidth="1.2" />
      </g>
      <g transform="rotate(6 693 238)">
        <rect x="650" y="198" width="88" height="78" rx="3" fill="#EBD8CB" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.6" />
        <path d="M665 220 q 26 -3 54 0 M665 236 q 30 -3 58 0 M665 252 q 18 -3 38 0" fill="none" stroke="#4A4A42" strokeOpacity="0.35" strokeWidth="1.3" strokeLinecap="round" />
      </g>

      {/* 书堆 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="188" y="368" width="180" height="14" fill="#A9B79A" fillOpacity="0.4" />
        <rect x="198" y="354" width="158" height="14" fill="#E6DCC6" fillOpacity="0.7" />
        <path d="M210 375 q 40 -2 80 0 M210 361 q 40 -2 80 0" strokeOpacity="0.2" />
      </g>

      {/* 摊开的笔记本 */}
      <g fill="none" stroke="#4A4A42" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
        <path d="M222 300 L392 290 L382 406 L206 416 Z" fill="#FBF7EC" strokeOpacity="0.75" />
        <path d="M392 290 L548 306 L532 416 L382 406 Z" fill="#FBF7EC" strokeOpacity="0.75" />
        <path d="M392 290 L382 406" strokeOpacity="0.5" strokeWidth="1.4" />
        <path d="M238 322 q 44 -6 126 -10 M235 344 q 44 -6 128 -10 M232 366 q 42 -6 124 -10" strokeOpacity="0.25" strokeWidth="1.2" />
        <path d="M408 320 q 44 -4 116 2 M406 342 q 44 -4 118 2 M404 364 q 40 -4 108 2" strokeOpacity="0.25" strokeWidth="1.2" />
        <path d="M468 356 l 4 10 l 11 1 l -9 7 l 3 11 l -9 -7 l -9 7 l 3 -11 l -9 -7 l 11 -1 Z" stroke="#8B5E4A" strokeOpacity="0.6" strokeWidth="1.3" />
        <path d="M430 384 l 6 2 M438 380 q 2 5 -2 8" strokeOpacity="0.35" strokeWidth="1.2" />
      </g>

      {/* 铅笔 */}
      <g transform="rotate(24 470 350)" fill="none" stroke="#4A4A42" strokeOpacity="0.7" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="440" y="344" width="74" height="9" fill="#E4C07E" fillOpacity="0.75" />
        <path d="M514 344 L528 348.5 L514 353 Z" fill="#FBF7EC" />
        <path d="M440 344 l -12 4.5 l 12 4.5" fill="#E6DCC6" />
        <path d="M452 344 l 0 9 M462 344 l 0 9" strokeOpacity="0.25" strokeWidth="1" />
      </g>

      {/* 茶杯 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.65" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M105 330 q 0 42 8 50 q 10 9 28 9 q 18 0 26 -9 q 8 -8 8 -50 Z" fill="#F6EBD8" fillOpacity="0.85" />
        <path d="M175 340 q 19 0 19 15 q 0 15 -19 15" />
        <path d="M121 318 q 7 -12 0 -24 M140 318 q 7 -12 0 -24" strokeOpacity="0.35" strokeWidth="1.4" />
      </g>

      {/* 植物 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.65" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M718 366 l 7 38 q 12 8 28 0 l 8 -38 Z" fill="#E6DCC6" fillOpacity="0.8" />
        <path d="M735 366 q -10 -28 2 -48 M740 366 q 4 -30 18 -42 M732 366 q -22 -18 -28 -34" strokeOpacity="0.5" />
        <path d="M737 318 q 8 -8 14 -6 M746 330 q 8 -6 14 -3" strokeOpacity="0.3" strokeWidth="1.3" />
      </g>

      {/* 小灵儿 — 手绘猫 */}
      <g fill="none" stroke="#4A4A42" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* 身体 */}
        <path d="M566 400 q -20 0 -16 -25 q 4 -25 31 -29 l 38 0 q 27 4 31 29 q 4 25 -16 25 Z" fill="#F6EBD8" fillOpacity="0.9" />
        <path d="M590 352 q 14 10 28 0" strokeOpacity="0.35" />
        {/* 尾巴 */}
        <path d="M664 392 q 34 6 30 26 q -4 15 -24 9" strokeOpacity="0.7" />
        {/* 头 */}
        <circle cx="592" cy="318" r="33" fill="#F6EBD8" fillOpacity="0.95" />
        {/* 耳朵 */}
        <path d="M566 296 L560 270 L582 284 Z" fill="#F6EBD8" />
        <path d="M618 296 L624 270 L602 284 Z" fill="#F6EBD8" />
        {/* 花纹 */}
        <path d="M578 300 q 7 -5 14 0 M598 297 q 6 -5 12 0" strokeOpacity="0.3" strokeWidth="1.2" />
        {/* 眼睛 */}
        <path d="M580 316 q 3 -3 6 0 M598 316 q 3 -3 6 0" strokeWidth="2.1" />
        {/* 鼻子和嘴 */}
        <path d="M589 324 l 3 3 l 3 -3 Z" fill="#4A4A42" stroke="none" />
        <path d="M586 331 q 6 5 12 0" strokeWidth="1.4" />
        {/* 胡须 */}
        <path d="M560 320 q -10 1 -16 4 M560 326 q -10 3 -14 8 M624 320 q 10 1 16 4 M624 326 q 10 3 14 8" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* 前爪搭在笔记本上 */}
        <path d="M560 388 q -10 -4 -14 -12 M576 390 q -8 -4 -12 -12" strokeOpacity="0.7" />
      </g>
      <text x="592" y="438" textAnchor="middle" fontSize="14" fill="#4A4A42" fontFamily="'LXGW WenKai','Kaiti SC','KaiTi',serif" opacity="0.8">
        小灵儿
      </text>

      {/* 对话气泡 */}
      <g>
        <path
          d="M488 210 q 0 -16 16 -16 l 156 0 q 16 0 16 16 l 0 34 q 0 16 -16 16 l -92 0 l -18 17 l 2 -17 l -48 0 q -16 0 -16 -16 Z"
          fill="#FAF7EE" stroke="#4A4A42" strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="round"
        />
        <text x="582" y="242" textAnchor="middle" fontSize="13.5" fill="#4A4A42" fontFamily="'LXGW WenKai','Kaiti SC','KaiTi',serif">
          今天有什么新念头？
        </text>
      </g>

      {/* 桌面小细节 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round">
        <path d="M260 430 q 3 -10 7 -1 M274 431 q 2 -8 6 -1 M330 428 q 3 -9 6 0" />
        <circle cx="450" cy="430" r="2" fill="#D19A7C" stroke="none" />
        <circle cx="462" cy="436" r="1.6" fill="#8FB4C9" stroke="none" />
      </g>
    </svg>
  )
}
