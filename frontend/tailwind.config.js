/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A00',
          dark: '#E06B00',
          light: '#FFA500',
          royal: '#FF8C00'
        },
        darkBg: '#0F172A',
        darkCard: '#1E293B',
        darkBorder: '#334155',
        accentGray: '#F5F5F5',
        textDark: '#1F2937'
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 30px rgb(0 0 0 / 0.12)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }
    },
  },
  plugins: [],
}
