/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#f0d080',
          400: '#e8b83a',
          500: '#d4a853',
          600: '#b8881e',
          700: '#8f6812',
        },
        navy: {
          800: '#111520',
          900: '#0a0d12',
          950: '#060810',
        },
        slate: {
          750: '#1e2540',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4a853 0%, #f0d080 50%, #d4a853 100%)',
      },
    },
  },
  plugins: [],
}
