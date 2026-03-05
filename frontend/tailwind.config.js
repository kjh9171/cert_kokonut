/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  // ✅ [FIX-11] animate-in, slide-in-from-* 등 활성화
  plugins: [require('tailwindcss-animate')],
}
