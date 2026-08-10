/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 清透蓝色系 (替换原来的 primary)
        primary: {
          50: '#E8F4FD',
          100: '#D0E8FB',
          200: '#A1D2F7',
          300: '#72BBF3',
          400: '#5B9BD5',
          500: '#4A8BC2',
          600: '#3A7BAF',
          700: '#2B6B9C',
          800: '#1C5B89',
          900: '#0D4B76',
        },
        // 保留 sky 作为辅助蓝
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // 柔和米色系
        beige: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F5F0E8',
          300: '#EDE5D8',
          400: '#D9CEBB',
        },
        // 珊瑚橙（点睛色）
        coral: {
          400: '#FF9E80',
          500: '#FF8C69',
        },
        // 保留 spark（暖黄）
        spark: {
          400: '#F4D03F',
          500: '#F39C12',
        },
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
          '50%': { transform: 'translateY(-8px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.08)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gentle-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(91,155,213,0.15), 0 0 40px rgba(91,155,213,0.08)' },
          '50%': { boxShadow: '0 0 30px rgba(91,155,213,0.25), 0 0 60px rgba(91,155,213,0.14)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(91,155,213,0.3), 0 0 24px rgba(91,155,213,0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(91,155,213,0.5), 0 0 48px rgba(91,155,213,0.2)' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
