/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3f7',
          100: '#d4e2ec',
          200: '#a9c5d9',
          300: '#7ea8c6',
          400: '#4d84a8',
          500: '#2c5f80',
          600: '#1c445f',
          700: '#153347',
          800: '#0f2536',
          900: '#0a1a26',
          950: '#071319',
        },
        coral: {
          50: '#fff2ee',
          100: '#ffe1d6',
          200: '#ffbfab',
          300: '#ff9878',
          400: '#ff7952',
          500: '#f9552b',
          600: '#e13d17',
          700: '#bc2f11',
          800: '#932813',
          900: '#772413',
        },
        sand: {
          50: '#f7f8f6',
          100: '#eef0ec',
          200: '#dfe3db',
        },
        teal: {
          500: '#1b7a72',
          600: '#146058',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 26, 38, 0.06), 0 8px 24px -8px rgba(10, 26, 38, 0.12)',
        'card-hover': '0 4px 8px rgba(10, 26, 38, 0.08), 0 16px 32px -12px rgba(10, 26, 38, 0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        dashMove: {
          to: { strokeDashoffset: '-200' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkDraw: {
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out both',
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        dashMove: 'dashMove 8s linear infinite',
        popIn: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        checkDraw: 'checkDraw 0.5s ease-out 0.15s forwards',
      },
    },
  },
  plugins: [],
};
