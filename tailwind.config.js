/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#070d18',
        panel: '#101a2a',
        line: 'rgba(196,211,235,0.12)',
        mint: '#7dd3fc',
        aqua: '#a78bfa',
        gold: '#f7c873',
        rose: '#ff6f91',
      },
      boxShadow: {
        glow: '0 22px 70px rgba(125, 211, 252, 0.18), 0 0 28px rgba(247, 200, 115, 0.08)',
        panel: '0 22px 70px rgba(0, 0, 0, 0.44)',
      },
      backgroundImage: {
        'finance-grid':
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
