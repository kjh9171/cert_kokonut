import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/cert_kokonut/', // GitHub 리포지토리 이름에 맞게 설정 (GitHub Pages용)
})
