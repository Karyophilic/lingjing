/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 墨色 — 主文字 / 主按钮（Cat Bag 的深色墨）
        primary: {
          50: '#F7F0DF',
          100: '#EFE4CB',
          200: '#E1D0AC',
          300: '#CDB789',
          400: '#8C7B5F',
          500: '#2F2A21',
          600: '#241F18',
          700: '#1A1610',
          800: '#110E0A',
          900: '#0A0805',
        },
        // 鼠尾草 — 辅助色
        sky: {
          50: '#F3F4EC',
          100: '#E7EADC',
          200: '#D3D9C0',
          300: '#B7C09D',
          400: '#98A47E',
          500: '#7F8C6A',
          600: '#677255',
        },
        // 纸色
        beige: {
          50: '#FCF8ED',
          100: '#F7F1E1',
          200: '#F1E8D3',
          300: '#E4D7BC',
          400: '#D2C09C',
        },
        paper: {
          50: '#FBF6E9',
          100: '#F6EFDD',
          200: '#EFE5CE',
          300: '#E4D6B8',
        },
        ink: {
          50: '#F8F3E7',
          100: '#EFE7D5',
          200: '#DFD2B8',
          300: '#C6B699',
          400: '#9C8D74',
          500: '#7A6D58',
          600: '#5C5141',
          700: '#433B2E',
          800: '#2F2A21',
          900: '#1C1913',
        },
        // 陶土
        coral: {
          400: '#D08A6D',
          500: '#B96B4D',
        },
        // 琥珀
        spark: {
          300: '#E4C07E',
          400: '#D9AC5B',
          500: '#C08A2E',
          600: '#A9762A',
        },
        // 暖灰 — 替换 Tailwind 默认冷灰，让全站文字偏暖
        gray: {
          50: '#F8F4EA',
          100: '#F1EBDD',
          200: '#E4DAC7',
          300: '#C9BCA3',
          400: '#A2957C',
          500: '#7E735F',
          600: '#5F5646',
          700: '#443E32',
          800: '#2F2A21',
          900: '#1C1913',
        },
        // 全站白色统一成奶油纸色
        white: '#FCF7EB',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"', '"Noto Sans SC"', '"Microsoft YaHei"',
          'system-ui', '-apple-system', 'sans-serif',
        ],
        display: [
          '"Songti SC"', '"Noto Serif SC"', '"Source Han Serif SC"',
          '"SimSun"', 'Georgia', '"Times New Roman"', 'serif',
        ],
        mono: ['"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'twinkle 2s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'gentle-glow': 'gentle-glow 3s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'spin-slow': 'spin 30s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-glow': {
          '0%, 100%': { boxShadow: '0 0 18px rgba(192,138,46,0.12), 0 0 36px rgba(192,138,46,0.06)' },
          '50%': { boxShadow: '0 0 26px rgba(192,138,46,0.2), 0 0 52px rgba(192,138,46,0.1)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(192,138,46,0.25), 0 0 20px rgba(192,138,46,0.08)' },
          '50%': { boxShadow: '0 0 20px rgba(192,138,46,0.4), 0 0 40px rgba(192,138,46,0.16)' },
        },
      },
      borderRadius: {
        'xl': '10px',
        '2xl': '14px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
