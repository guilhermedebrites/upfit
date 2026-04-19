/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './shared/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        brand: {
          DEFAULT: '#6366f1',
          light:   '#818cf8',
          dark:    '#4f46e5',
        },
        cyber: '#00d4ff',
        xp: '#f59e0b',
        streak: '#ef4444',
        success: '#22c55e',
        surface: {
          DEFAULT: '#1e293b',
          muted:   '#0f172a',
        },
        app: {
          bg:     '#0a0a0a',
          card:   '#1a1a1a',
          input:  '#0f0f0f',
          darker: '#111111',
        },
        goal:     '#FFB547',
        muted:    '#94a3b8',
        subtle:   '#64748b',
        faint:    '#475569',
        skeleton: '#334155',
      },
    },
  },
  plugins: [],
};
