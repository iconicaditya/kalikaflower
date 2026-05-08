/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1f3a2e',
          deep: '#14271f',
          50: '#f1f5f2',
          100: '#dde7df',
          200: '#bbcfbf',
          300: '#8ba888',
          400: '#6a8a68',
          500: '#4a6b4a',
          600: '#345236',
          700: '#1f3a2e',
          800: '#14271f',
          900: '#0b1813',
        },
        cream: '#f7f3ea',
        ivory: '#fbf9f3',
        terracotta: {
          DEFAULT: '#b86c4a',
          light: '#d18a6a',
          dark: '#8e4f33',
        },
        gold: {
          DEFAULT: '#b08a4a',
          light: '#c9a86a',
          dark: '#8a6a36',
        },
        bark: '#3d2e21',
        stone: '#d8d2c2',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        'extra-wide': '0.35em',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
      },
      keyframes: {
        'fade-in':    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'fade-up':    { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'fade-down':  { '0%': { opacity: 0, transform: 'translateY(-16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: 0, transform: 'translateX(40px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        'slide-in-left':  { '0%': { opacity: 0, transform: 'translateX(-40px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        'scale-in':   { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        'kenburns':   { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.08)' } },
        'shimmer':    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in':       'fade-in 800ms ease-out both',
        'fade-up':       'fade-up 900ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'fade-up-slow':  'fade-up 1400ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'fade-down':     'fade-down 700ms ease-out both',
        'slide-in-right':'slide-in-right 800ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'slide-in-left': 'slide-in-left 800ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'scale-in':      'scale-in 700ms ease-out both',
        'kenburns':      'kenburns 14s ease-in-out infinite alternate',
        'shimmer':       'shimmer 2s linear infinite',
      },
      transitionTimingFunction: {
        'luxe': 'cubic-bezier(0.7, 0, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
