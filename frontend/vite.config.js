import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// ✅ 버그 수정:
//   1. 포트: 8081 → 8080 (백엔드 실제 포트)
//   2. host: localhost → pms-backend (Docker 내부 서비스명)
//   3. changeOrigin: true 추가

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
        target: 'http://pms-backend:8080',  // ✅ 수정: localhost:8081 → pms-backend:8080
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
})