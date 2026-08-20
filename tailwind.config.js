/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          critical: '#ef4444', // Red
          high: '#f97316',     // Orange
          medium: '#eab308',   // Yellow
          low: '#06b6d4',      // Cyan/Blue
          dispatched: '#10b981', // Green
        }
      }
    },
  },
  plugins: [],
}
