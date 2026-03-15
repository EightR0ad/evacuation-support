import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  base: "/evacuation-support/",
  plugins: [react(), cesium()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
})
