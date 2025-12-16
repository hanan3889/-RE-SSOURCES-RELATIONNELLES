/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'marianne-blue': '#000091',
        'marianne-red': '#E1000F',
        'gray-custom': '#666666',
        'gray-light': '#E5E5E5',
      },
      fontFamily: {
        'marianne': ['Marianne', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'title': '24px',
        'body': '14px',
        'code': '12px',
      }
    },
  },
  plugins: [],
}