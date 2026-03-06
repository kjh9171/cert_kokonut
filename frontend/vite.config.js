import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // SheetJS (xlsx) 등 대형 라이브러리 빌드 시 메모리 부족 방지를 위한 설정
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
          utils: ['xlsx']
        }
      }
    }
  }
})
