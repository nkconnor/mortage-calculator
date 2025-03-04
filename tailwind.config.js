/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#1a1a1a',
          card: '#2a2a2a',
          text: '#f3f4f6',
          muted: '#9ca3af',
          border: '#4b5563'
        }
      }
    },
  },
  plugins: [],
}