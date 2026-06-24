/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'proflow-blue': '#0066FF',
        'proflow-dark': '#001F3F',
        'proflow-gray': '#F5F7FA',
      }
    },
  },
  plugins: [],
}