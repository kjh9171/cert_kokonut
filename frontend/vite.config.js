import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // ✅ [FIX-09] Docker: VITE_API_URL=http://pms-backend:8080 설정
        //             로컬:   미설정 시 localhost:8081 자동 사용
        target: process.env.VITE_API_URL || 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
