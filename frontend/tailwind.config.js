/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          light: '#f8fafc',
          dark: '#0f172a',
          brand: '#3b82f6'
        }
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 10px -1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'premium': '1rem'
      }
    },
  },
  plugins: [],
}
