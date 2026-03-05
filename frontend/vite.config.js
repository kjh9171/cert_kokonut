import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
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
        // ✅ 수정: localhost:8081 → pms-backend:8080
        // Docker 컨테이너 내부에서 localhost는 ::1(IPv6)로 해석되어 ECONNREFUSED 발생
        // 반드시 Docker 서비스명(pms-backend)과 컨테이너 내부 포트(8080) 사용
        target: 'http://pms-backend:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})