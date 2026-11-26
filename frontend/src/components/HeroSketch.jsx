// 首页手绘插画 — 山、河、松树和一个带着地图的旅人
export default function HeroSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 470"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="rough" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" />
        </filter>
      </defs>

      {/* 天空里的云和星 */}
      <g className="doodle" stroke="#4A4A42" strokeOpacity="0.5">
        <path d="M96 96 q 12 -14 28 -7 q 9 -12 25 -3 q 13 -2 15 9 q -2 9 -16 8 l -44 0 q -12 -1 -8 -7 Z" />
        <path d="M655 96 q 8 -10 20 -5 q 6 -8 17 -2 q 9 -1 10 7 q -1 6 -12 6 l -30 0 q -8 0 -5 -6 Z" />
      </g>
      <path
        d="M604 92 L611 112 L632 115 L616 129 L620 150 L604 139 L588 150 L592 129 L576 115 L597 112 Z"
        fill="none" stroke="#8B5E4A" strokeWidth="2.2" strokeLinejoin="round"
      />

      {/* 远山 */}
      <path
        d="M0 246 C 34 214 62 202 92 222 C 118 240 138 246 162 214 C 186 182 212 176 238 204 C 262 230 288 246 314 224 C 340 202 364 190 392 214 C 418 238 444 250 470 228 C 496 206 520 196 548 218 C 574 240 600 248 626 226 C 652 204 678 196 704 216 C 730 236 756 240 782 222 L800 214 L800 470 L0 470 Z"
        fill="#A9B79A" fillOpacity="0.3" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.8"
      />
      {/* 中景山 */}
      <path
        d="M0 286 C 36 262 64 248 96 264 C 126 280 150 282 176 254 C 202 226 228 222 254 248 C 280 274 306 286 332 268 C 358 250 384 244 410 264 C 436 284 462 292 488 272 C 514 252 540 248 566 268 C 592 288 618 294 644 274 C 670 254 696 250 722 270 C 748 290 774 294 800 276 L800 470 L0 470 Z"
        fill="#93A585" fillOpacity="0.34" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.8"
      />
      {/* 山体排线 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.14" strokeWidth="1.1" strokeLinecap="round">
        <path d="M120 252 l -12 24 M138 260 l -10 22 M156 264 l -8 20" />
        <path d="M332 252 l -12 24 M350 260 l -10 20 M368 264 l -8 18" />
        <path d="M520 254 l -12 22 M538 262 l -10 20 M556 266 l -8 18" />
        <path d="M690 256 l -10 22 M706 262 l -8 20" />
      </g>

      {/* 右侧蓝山 */}
      <path
        d="M470 320 C 508 292 540 280 574 294 C 608 308 638 300 668 280 C 698 260 728 264 756 286 C 778 302 792 304 800 300 L800 470 L470 470 Z"
        fill="#A9C6D8" fillOpacity="0.34" stroke="#4A4A42" strokeOpacity="0.5" strokeWidth="1.7"
      />

      {/* 松树 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.62" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M132 372 L120 348 L144 350 Z" fill="#A9B79A" fillOpacity="0.35" />
        <path d="M132 350 L118 322 L146 324 Z" fill="#A9B79A" fillOpacity="0.35" />
        <path d="M132 325 L120 300 L144 302 Z" fill="#A9B79A" fillOpacity="0.35" />
        <path d="M132 372 L132 386" />
        <path d="M196 366 L184 344 L208 346 Z" fill="#A9B79A" fillOpacity="0.3" />
        <path d="M196 345 L184 320 L208 322 Z" fill="#A9B79A" fillOpacity="0.3" />
        <path d="M196 366 L196 380" />
        <path d="M720 356 L708 332 L732 334 Z" fill="#A9B79A" fillOpacity="0.3" />
        <path d="M720 334 L708 308 L732 310 Z" fill="#A9B79A" fillOpacity="0.3" />
        <path d="M720 356 L720 370" />
        <path d="M762 372 L750 350 L774 352 Z" fill="#A9B79A" fillOpacity="0.28" />
        <path d="M762 351 L750 326 L774 328 Z" fill="#A9B79A" fillOpacity="0.28" />
        <path d="M762 372 L762 386" />
      </g>

      {/* 草地与小径 */}
      <path
        d="M0 388 C 150 378 300 392 450 382 C 600 372 700 386 800 378 L800 470 L0 470 Z"
        fill="#F6F1E4" fillOpacity="0.9" stroke="#4A4A42" strokeOpacity="0.35" strokeWidth="1.4"
      />

      {/* 河流 — 画在地面之上，流向画面底部 */}
      <path
        d="M560 300 C 540 324 575 344 555 368 C 535 392 570 412 550 436 C 538 452 550 464 545 470 L 615 470 C 606 452 618 440 604 420 C 586 394 620 374 602 350 C 584 326 616 312 598 300 Z"
        fill="#A9C6D8" fillOpacity="0.62" stroke="#4A4A42" strokeOpacity="0.6" strokeWidth="1.8"
      />
      <path
        d="M580 312 C 562 334 594 352 574 376 C 554 400 588 418 568 440 C 558 450 570 462 564 468"
        fill="none" stroke="#FAF7EE" strokeOpacity="0.55" strokeWidth="3.4" strokeLinecap="round"
      />
      <path
        d="M662 318 C 640 342 682 362 656 388 C 630 414 672 436 650 458"
        fill="none" stroke="#4A4A42" strokeOpacity="0.22" strokeWidth="1.2" strokeLinecap="round"
      />

      <path
        d="M300 374 C 262 396 226 414 186 438"
        fill="none" stroke="#4A4A42" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="4 7" strokeLinecap="round"
      />

      {/* 旅人 */}
      <g className="doodle" stroke="#4A4A42" strokeWidth="1.8">
        {/* 背包 */}
        <path d="M279 292 q -10 3 -9 18 l 1 16 q 1 8 9 7 l 7 -1 l 0 -39 Z" fill="#A9B79A" fillOpacity="0.4" />
        <path d="M281 296 q 7 -3 12 0" />
        {/* 身体 */}
        <path d="M294 286 q -6 10 -6 26 l 0 30 q 1 7 8 7 l 8 0 q 7 0 8 -7 l 0 -30 q 0 -16 -6 -26 Z" fill="#FAF7EE" fillOpacity="0.8" />
        {/* 腿 */}
        <path d="M296 349 l -1 20 M310 349 l 1 20" />
        <path d="M288 370 q 4 2 8 0 M309 370 q 4 2 8 0" />
        {/* 手臂与地图 */}
        <path d="M309 302 q 12 2 18 8" />
        <path d="M326 296 l 14 4 l -5 17 l -14 -4 Z" fill="#FAF7EE" fillOpacity="0.85" />
        <path d="M330 301 q 3 3 2 6 M336 303 q 3 3 2 6" />
        {/* 头 */}
        <circle cx="302" cy="272" r="13" fill="#FAF7EE" fillOpacity="0.85" />
        <path d="M293 272 q 3 -2 5 0 M306 272 q 3 -2 5 0" />
        <path d="M301 278 q 3 2 5 0" />
        {/* 帽子 */}
        <path d="M283 264 q 19 -7 38 0" />
        <path d="M290 264 q 3 -18 14 -18 q 10 0 12 18" fill="#E6DCC6" fillOpacity="0.8" />
        {/* 领子 */}
        <path d="M296 288 q 6 5 12 0" />
      </g>

      {/* 草与花 */}
      <g className="doodle" stroke="#4A4A42" strokeOpacity="0.45" strokeWidth="1.3">
        <path d="M60 438 q 3 -12 7 -1 M72 438 q 2 -10 6 -2 M84 440 q 3 -9 6 0" />
        <path d="M180 452 q 3 -12 7 -1 M193 452 q 2 -9 6 -1" />
        <path d="M430 442 q 3 -12 7 -1 M443 443 q 2 -10 6 -1" />
        <path d="M690 440 q 3 -11 7 -1 M703 441 q 2 -9 6 -1" />
        <circle cx="118" cy="430" r="2.2" fill="#D19A7C" stroke="none" />
        <circle cx="128" cy="437" r="1.8" fill="#8FB4C9" stroke="none" />
        <circle cx="660" cy="432" r="2" fill="#D19A7C" stroke="none" />
      </g>

      {/* 远处小星点 */}
      <g fill="#4A4A42" opacity="0.35">
        <circle cx="90" cy="180" r="1.6" />
        <circle cx="740" cy="160" r="1.6" />
        <circle cx="700" cy="210" r="1.3" />
        <circle cx="470" cy="130" r="1.4" />
      </g>
    </svg>
  )
}
