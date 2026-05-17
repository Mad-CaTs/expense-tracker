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
          muted:   '#888888',
          subtle:  '#1a1a1c',
        },
        surface: {
          base:    '#0e0e10',
          card:    '#151517',
          overlay: '#1e1e20',
          hover:   '#222224',
        },
      },
    },
  },
  plugins: [],
};
