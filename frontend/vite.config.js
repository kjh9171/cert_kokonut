import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // ✅ [보안 개정] 로컬 및 컨테이너 환경 모두 대응
        // 로컬 실행 시: http://127.0.0.1:8080
        // Docker 실행 시 서비스명 pms-backend가 127.0.0.1로 해석되지 않도록 주의 필요
        // 사용자가 로컬 환경(Mac)에서 바로 실행하는 경우를 우선 고려하여 127.0.0.1로 변경
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
