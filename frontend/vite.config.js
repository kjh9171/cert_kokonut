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
        // ✅ [보안 복구] macOS 충돌 방지를 위해 변경된 백엔드 포트 8081 조준
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
