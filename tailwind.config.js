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
        'jarvis': {
          'dark': '#F2EAD3',
          'darker': '#E8DFC8',
          'card': '#FDF9F0',
          'card-hover': '#F5ECD6',
          'accent': '#DA9101',
          'accent-dim': '#C58200',
          'burgundy': '#800020',
          'burgundy-dim': '#660019',
          'text': '#800020',
          'muted': '#996666',
          'border': '#D4C9A8',
        },
      },
      fontFamily: {
        'heading': ['Orbitron', 'sans-serif'],
        'body': ['Exo 2', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(218, 145, 1, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(218, 145, 1, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
