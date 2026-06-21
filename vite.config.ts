import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const env = (globalThis as { process?: { env?: Record<string, string> } }).process?.env || {}
// VITE_BASE=/atelio/ for GitHub Pages; SINGLE_FILE=1 to inline everything into one .html
const base = env.VITE_BASE || '/'
const single = !!env.SINGLE_FILE

export default defineConfig({
  base,
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: single ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 5000 } : {},
  server: { host: true },
})
