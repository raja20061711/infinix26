/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020817',
          900: '#04162E',
          800: '#062848',
          700: '#093B69',
          600: '#0E5592',
          cyan: '#00D9FF',
          lightCyan: '#4CCFFF',
          brightGlow: '#7CE7FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'caustics-move': 'caustics 20s ease infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
        'wave-light': 'waveLight 8s ease-in-out infinite',
        'rays-flow': 'raysFlow 12s linear infinite',
      },
      keyframes: {
        caustics: {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(-5%, 5%) scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(0, 217, 255, 0.4))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 35px rgba(0, 217, 255, 0.9))' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        waveLight: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(3deg) scale(1.05)' },
        },
        raysFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavyGlass: '24px',
      },
      boxShadow: {
        'cyan-glow': '0 0 35px -5px rgba(0, 217, 255, 0.5)',
        'cyan-sm': '0 0 15px 0px rgba(0, 217, 255, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 8, 23, 0.6), inset 0 0 0 1px rgba(0, 217, 255, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(0, 217, 255, 0.25), inset 0 0 0 1.5px rgba(0, 217, 255, 0.4)',
        'gold-glow': '0 0 40px -5px rgba(255, 200, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
