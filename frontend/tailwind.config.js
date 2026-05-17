/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#005bd3',
          hover:   '#0052be',
          active:  '#0047a8',
          muted:   '#6aa0f8',
          subtle:  '#132044',
        },
        surface: {
          base:    '#0b1120',
          card:    '#0d1526',
          overlay: '#1a2744',
          hover:   '#1e2e50',
        },
      },
    },
  },
  plugins: [],
};
