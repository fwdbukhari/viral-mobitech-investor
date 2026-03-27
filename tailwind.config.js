/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        deep:    '#010a1e',
        navy:    '#040f2e',
        blue:    '#071545',
        accent:  '#1e6fff',
        cyan:    '#00c8ff',
        vmwhite: '#e8f4ff',
        muted:   '#6a9abf',
      },
      fontFamily: {
        head: ['Orbitron', 'monospace'],
        body: ['"Exo 2"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
