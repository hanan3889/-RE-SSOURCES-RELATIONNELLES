/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'marianne-blue': '#000091',
        'marianne-blue-light': '#000091e6',
        'marianne-blue-hover': '#1212ff',
        'marianne-red': '#E1000F',
        'marianne-bg': '#f6f6f6',
        'marianne-title': '#161616',
        'gray-custom': '#666666',
        'gray-light': '#E5E5E5',
        'gray-mention': '#3a3a3a',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(0, 0, 145, 0.12)',
      },
    },
  },
  plugins: [],
}