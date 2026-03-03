/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        zomato: {
          red:           '#E23744',
          dark:          '#1C1C1C',
          secondary:     '#686B78',
          bg:            '#F5F3F1',
          card:          '#FFFFFF',
          border:        '#E8E8E8',
          vegGreen:      '#60B246',
          nonvegRed:     '#DB3A34',
          light:         '#FFF0F1',
          muted:         '#F5F3F1',
          darker:        '#111111',
        },
      },
      borderRadius: {
        card: '16px',
        btn:  '8px',
      },
      boxShadow: {
        'z-card': '0 4px 16px rgba(0,0,0,0.08)',
        'z-nav':  '0 2px 8px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease forwards',
        'slide-up':       'slideUp 0.3s ease-out forwards',
        'slide-up-rail':  'slideUpRail 0.35s ease-out forwards',
        'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
        'cta-pulse':      'ctaPulse 2s ease-in-out infinite',
        'add-pop':        'addPop 0.2s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpRail: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        skeletonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        ctaPulse: {
          '0%, 100%': { boxShadow: '0 4px 16px rgba(226,55,68,0.3)' },
          '50%':      { boxShadow: '0 4px 24px rgba(226,55,68,0.55)' },
        },
        addPop: {
          '0%':   { transform: 'scale(0.85)' },
          '60%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
