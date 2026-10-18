import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
 root:'source',plugins:[react()],
 build:{outDir:'../client',emptyOutDir:true,rollupOptions:{input:'source/work/index.html',output:{entryFileNames:'assets/portfolio-app.js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:'assets/[name][extname]'}}}
});
