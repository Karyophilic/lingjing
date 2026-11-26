// 首页手绘插画 — 小灵儿与灵感书桌（全部用不规则路径，不使用标准几何图形）
export default function HeroSketch({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 470"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* 水彩底 — 不规则晕染 */}
      <path d="M-50 200 C 40 138 168 164 228 240 C 288 316 214 424 108 436 C 0 448 -72 336 -50 200 Z" fill="#A9B79A" fillOpacity="0.1" />
      <path d="M520 84 C 650 66 802 138 812 262 C 822 386 690 434 596 392 C 502 350 466 214 520 84 Z" fill="#A9C6D8" fillOpacity="0.11" />
      <path d="M248 300 C 380 278 522 298 544 360 C 566 422 420 452 318 430 C 216 408 176 338 248 300 Z" fill="#E6DCC6" fillOpacity="0.18" />

      {/* 漂浮的小涂鸦 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path transform="translate(20 0)" d="M104 146 C 116 132 134 134 140 146 C 152 140 166 146 166 158 C 176 160 178 170 168 174 C 156 179 138 177 128 172 C 116 178 104 172 104 162 C 96 158 98 150 104 146 Z" />
        <path transform="translate(-60 0)" d="M736 118 L 741 132 L 756 135 L 744 146 L 747 161 L 736 152 L 725 161 L 728 146 L 716 135 L 731 132 Z" stroke="#8B5E4A" strokeOpacity="0.7" />
        <path d="M762 196 L 782 188 L 774 200 L 786 204 L 766 212 Z" strokeOpacity="0.3" />
        <path d="M424 152 l 3 8 l 8 1 l -6 6 l 2 8 l -7 -5 l -7 5 l 2 -8 l -6 -6 l 8 -1 Z" strokeOpacity="0.3" />
        <path d="M330 126 q 14 -8 26 4" strokeOpacity="0.25" />
      </g>

      {/* 桌面 */}
      <path d="M38 402 C 158 390 300 408 430 398 C 560 388 682 402 762 392" fill="none" stroke="#4A4A42" strokeOpacity="0.55" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M78 414 q 30 -3 60 0 M320 412 q 26 -3 52 0 M590 406 q 28 -3 56 0" fill="none" stroke="#4A4A42" strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" />

      {/* 左侧便签 — 右下角卷起 */}
      <g transform="translate(20 0)">
      <path
        d="M96 216 C 126 207 160 210 188 218 C 192 244 189 274 183 298 C 176 301 168 302 160 301 C 162 296 160 292 156 290 C 138 294 118 292 98 288 C 92 264 92 238 96 216 Z"
        fill="#DCE9EF" stroke="#4A4A42" strokeOpacity="0.5" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M110 238 q 30 -4 60 0 M110 254 q 26 -3 52 0 M110 270 q 28 -3 54 0" fill="none" stroke="#4A4A42" strokeOpacity="0.32" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M142 282 l 4 9 l 10 1 l -8 7 l 3 10 l -9 -6 l -9 6 l 3 -10 l -8 -7 l 10 -1 Z" fill="none" stroke="#8B5E4A" strokeOpacity="0.6" strokeWidth="1.2" />
      </g>

      {/* 右侧便签 */}
      <g transform="translate(-60 0)">
      <path
        d="M692 154 C 714 148 740 150 758 156 C 761 174 759 192 754 208 C 736 212 716 210 698 206 C 694 190 692 172 692 154 Z"
        fill="#EBD8CB" stroke="#4A4A42" strokeOpacity="0.5" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M704 174 q 24 -3 46 0 M704 188 q 28 -3 50 0 M704 202 q 16 -2 34 0" fill="none" stroke="#4A4A42" strokeOpacity="0.3" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* 书堆 */}
      <path d="M178 370 C 230 363 292 366 366 368 C 370 374 369 380 366 384 C 300 387 238 385 176 382 C 174 378 175 374 178 370 Z" fill="#A9B79A" fillOpacity="0.4" stroke="#4A4A42" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M190 356 C 240 349 298 352 358 354 C 361 360 360 366 357 369 C 300 371 242 370 188 367 C 187 363 188 359 190 356 Z" fill="#E6DCC6" fillOpacity="0.75" stroke="#4A4A42" strokeOpacity="0.5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M210 375 q 40 -2 80 0 M210 361 q 40 -2 80 0" fill="none" stroke="#4A4A42" strokeOpacity="0.18" strokeWidth="1.1" strokeLinecap="round" />

      {/* 摊开的笔记本 — 不规则页边 */}
      <g fill="none" stroke="#4A4A42" strokeLinejoin="round" strokeLinecap="round">
        <path d="M210 300 C 260 292 330 288 390 290 C 389 330 386 370 382 406 C 330 412 266 415 200 416 C 205 378 207 338 210 300 Z" fill="#FBF7EC" strokeOpacity="0.7" strokeWidth="1.9" />
        <path d="M392 290 C 444 294 500 300 548 306 C 544 344 538 380 532 416 C 480 414 430 410 382 406 C 384 368 388 330 392 290 Z" fill="#FBF7EC" strokeOpacity="0.7" strokeWidth="1.9" />
        <path d="M390 290 C 388 330 386 370 382 406" strokeOpacity="0.45" strokeWidth="1.3" />
        <path d="M228 322 C 268 316 324 313 372 314 M225 344 C 266 338 322 335 370 336 M222 366 C 264 360 318 357 366 358" strokeOpacity="0.24" strokeWidth="1.2" />
        <path d="M404 320 C 442 322 490 326 528 330 M402 342 C 440 344 486 348 524 352 M400 364 C 436 366 478 370 516 374" strokeOpacity="0.24" strokeWidth="1.2" />
        <path d="M462 382 l 4 10 l 11 1 l -9 7 l 3 11 l -9 -7 l -9 7 l 3 -11 l -9 -7 l 11 -1 Z" stroke="#8B5E4A" strokeOpacity="0.55" strokeWidth="1.3" />
        <path d="M418 390 q 3 4 -1 8 M424 388 q 4 3 3 8" strokeOpacity="0.3" strokeWidth="1.1" />
      </g>

      {/* 铅笔 — 微微弯 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.65" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M432 352 C 456 344 492 337 510 337 C 513 341 513 346 510 350 C 492 353 458 360 436 364 C 433 360 431 356 432 352 Z" fill="#E4C07E" fillOpacity="0.75" />
        <path d="M510 337 C 518 339 524 344 526 350 C 520 351 514 351 510 350 Z" fill="#FBF7EC" />
        <path d="M432 352 C 428 356 426 360 426 364 C 430 364 434 364 436 364 Z" fill="#E6DCC6" />
        <path d="M446 349 l 2 10 M456 347 l 2 10" strokeOpacity="0.22" strokeWidth="1" />
      </g>

      {/* 茶杯 */}
      <g transform="translate(30 0)" fill="none" stroke="#4A4A42" strokeOpacity="0.62" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M102 330 C 122 334 152 334 174 330 C 177 350 174 370 166 382 C 150 391 126 391 110 383 C 103 371 100 350 102 330 Z" fill="#F6EBD8" fillOpacity="0.85" />
        <path d="M174 340 C 190 337 197 347 195 357 C 193 367 183 372 174 370" />
        <path d="M120 318 q 7 -12 0 -24 M140 318 q 7 -12 0 -24" strokeOpacity="0.33" strokeWidth="1.4" />
      </g>

      {/* 植物 */}
      <g transform="translate(-60 0)" fill="none" stroke="#4A4A42" strokeOpacity="0.62" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M712 366 C 726 362 756 362 770 366 C 768 388 758 404 742 406 C 726 404 716 388 712 366 Z" fill="#E6DCC6" fillOpacity="0.8" />
        <path d="M742 366 C 730 338 736 316 750 304 C 758 326 756 350 742 366 Z" fill="#A9B79A" fillOpacity="0.25" />
        <path d="M744 366 C 756 340 772 330 782 332 C 778 352 762 366 744 366 Z" fill="#A9B79A" fillOpacity="0.2" />
        <path d="M740 366 C 726 350 716 336 716 322 C 730 326 740 342 740 366 Z" fill="#A9B79A" fillOpacity="0.2" />
      </g>

      {/* 小灵儿 — 原始圆球形象的手绘版 */}
      <g transform="translate(-50 0)">
        {/* 手绘光圈 */}
        <path
          d="M640 198 C 676 195 708 220 710 252 C 712 286 688 312 652 314 C 616 316 590 292 588 260 C 586 228 608 202 640 198 Z"
          fill="none" stroke="#4A4A42" strokeOpacity="0.18" strokeWidth="1.3" strokeDasharray="3 7"
        />
        {/* 身体 */}
        <path
          d="M640 208 C 668 205 692 224 696 250 C 700 277 682 298 656 302 C 630 306 608 287 604 262 C 600 236 616 212 640 208 Z"
          fill="#DCE9EF" fillOpacity="0.92" stroke="#4A4A42" strokeWidth="2.1" strokeLinecap="round"
        />
        {/* 高光 */}
        <path d="M620 226 C 628 218 640 215 649 219" fill="none" stroke="#FAF7EE" strokeOpacity="0.85" strokeWidth="3.6" strokeLinecap="round" />
        {/* 眼睛 */}
        <path d="M626 250 C 627 242 635 240 638 246 C 641 252 636 259 631 257 C 627 256 625 253 626 250 Z" fill="#4A4A42" />
        <path d="M648 249 C 649 241 656 239 659 245 C 662 251 657 258 652 256 C 648 255 647 252 648 249 Z" fill="#4A4A42" />
        <path d="M630 245 q 1.5 -1.6 3 0 M650 244 q 1.5 -1.6 3 0" fill="none" stroke="#FAF7EE" strokeWidth="1.4" strokeLinecap="round" />
        {/* 腮红 */}
        <path d="M617 263 q 4 -2.2 7 0 M653 262 q 4 -2.2 7 0" fill="none" stroke="#C98F7B" strokeWidth="1.7" strokeLinecap="round" />
        {/* 嘴 */}
        <path d="M636 271 q 4 3 8 0" fill="none" stroke="#4A4A42" strokeWidth="1.4" strokeLinecap="round" />
        {/* 漂浮线 */}
        <path d="M610 316 q 9 4 18 0 M646 318 q 9 4 18 0" fill="none" stroke="#4A4A42" strokeOpacity="0.28" strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <text x="648" y="342" transform="translate(-50 0)" textAnchor="middle" fontSize="14" fill="#4A4A42" fontFamily="'LXGW WenKai','Kaiti SC','KaiTi',serif" opacity="0.82">
        小灵儿
      </text>

      {/* 对话气泡 — 手绘云朵 */}
      <g transform="translate(-30 0)">
        <path
          d="M476 166 C 471 151 486 142 502 145 C 512 132 534 132 544 144 C 558 136 576 142 580 156 C 596 154 610 166 606 180 C 618 188 614 202 600 206 C 590 214 574 212 566 204 C 552 214 532 212 522 202 C 506 210 490 204 486 192 C 474 188 470 176 476 166 Z"
          fill="#FAF7EE" stroke="#4A4A42" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round"
        />
        <path d="M560 204 C 570 216 582 222 596 224 C 586 214 580 206 578 198" fill="#FAF7EE" stroke="#4A4A42" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="542" y="181" textAnchor="middle" fontSize="13.5" fill="#4A4A42" fontFamily="'LXGW WenKai','Kaiti SC','KaiTi',serif">
          今天有什么新念头？
        </text>
      </g>

      {/* 桌面小细节 */}
      <g fill="none" stroke="#4A4A42" strokeOpacity="0.22" strokeWidth="1.2" strokeLinecap="round">
        <path d="M258 430 q 3 -10 7 -1 M272 431 q 2 -8 6 -1 M330 428 q 3 -9 6 0" />
        <path d="M448 430 q 2 -7 5 -1 M460 432 q 2 -6 5 -1" />
      </g>
      <path d="M452 436 q 4 -3 7 0 q -3 3 -7 0 Z" fill="#D19A7C" fillOpacity="0.7" />
      <path d="M464 440 q 3 -2 6 0 q -3 3 -6 0 Z" fill="#8FB4C9" fillOpacity="0.7" />
    </svg>
  )
}
