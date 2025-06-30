import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/taskun/",          // GitHub Pages 上での「貼り付け場所」の指定
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    open: true,              // 自動でブラウザを開く
    port: 5173,              // デフォルトポート明示
    host: true,              // ネットワークアクセス許可
    hmr: {
      overlay: true,         // エラーオーバーレイ表示
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,         // 本番でもソースマップ生成（デバッグ用）
  },
  css: {
    devSourcemap: true,      // CSS開発時ソースマップ
  },
});
