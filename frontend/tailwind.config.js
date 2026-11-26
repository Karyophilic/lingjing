/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 墨色 — 手绘线条与正文
        primary: {
          50: '#F3EFE4',
          100: '#E9E3D4',
          200: '#D6CDB9',
          300: '#B9AE98',
          400: '#8A8271',
          500: '#4A4A42',
          600: '#3A3A34',
          700: '#2C2C27',
          800: '#1F1F1B',
          900: '#141411',
        },
        // 河蓝
        sky: {
          50: '#EEF4F7',
          100: '#DDE9EF',
          200: '#C2D8E3',
          300: '#A9C6D8',
          400: '#8FB4C9',
          500: '#7FA8BF',
          600: '#6690A8',
        },
        // 纸色
        beige: {
          50: '#FBF8EF',
          100: '#F6F1E4',
          200: '#F0E9D8',
          300: '#E6DCC6',
          400: '#D8CCB2',
        },
        paper: {
          50: '#FAF7EE',
          100: '#F6F1E4',
          200: '#F0E9D8',
          300: '#E6DCC6',
        },
        ink: {
          50: '#F5F2E9',
          100: '#ECE7DA',
          200: '#D9D2C2',
          300: '#BDB5A3',
          400: '#948C7B',
          500: '#6E6B5E',
          600: '#5A574C',
          700: '#4A4A42',
          800: '#3A3A34',
          900: '#2A2A25',
        },
        // 赭石 / 星标
        spark: {
          300: '#D8B49E',
          400: '#C08F72',
          500: '#A66B4E',
          600: '#8B5E4A',
        },
        // 陶土
        coral: {
          400: '#D19A7C',
          500: '#B97A5A',
        },
        // 暖灰 / 石头
        gray: {
          50: '#F6F3EA',
          100: '#EFEADF',
          200: '#E1DACB',
          300: '#C9C1B1',
          400: '#A39A88',
          500: '#7D776A',
          600: '#625D52',
          700: '#4D4940',
          800: '#3A3A34',
          900: '#26261F',
        },
        white: '#FAF7EE',
      },
      fontFamily: {
        sans: [
          '"LXGW WenKai"', '"Kaiti SC"', '"STKaiti"', '"KaiTi"', '"楷体"',
          '"Songti SC"', 'serif',
        ],
        display: [
          '"LXGW WenKai"', '"Kaiti SC"', '"STKaiti"', '"KaiTi"', '"楷体"',
          '"Segoe Print"', '"Bradley Hand"', 'cursive',
        ],
        mono: ['"Segoe Print"', '"Bradley Hand"', 'Consolas', 'monospace'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
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
          '0%, 100%': { transform: 'translateY(0px) rotate(-0.4deg)' },
          '50%': { transform: 'translateY(-6px) rotate(0.4deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.35' },
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
          '0%, 100%': { boxShadow: '0 0 18px rgba(126,143,109,0.12), 0 0 36px rgba(126,143,109,0.06)' },
          '50%': { boxShadow: '0 0 26px rgba(126,143,109,0.2), 0 0 52px rgba(126,143,109,0.1)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(126,143,109,0.25), 0 0 20px rgba(126,143,109,0.08)' },
          '50%': { boxShadow: '0 0 20px rgba(126,143,109,0.4), 0 0 40px rgba(126,143,109,0.16)' },
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
