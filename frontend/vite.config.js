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
        // ✅ [도커 보안 복구] 컨테이너 내부 통신을 위해 서비스명(pms-backend) 사용
        // localhost 대신 도커 네트워크의 호스트 네임을 조준합니다.
        target: 'http://pms-backend:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
