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
    strictPort: false,       // ポートが使用中の場合は別のポートを使用
    cors: true,              // CORS有効化
    hmr: {
      overlay: true,         // エラーオーバーレイ表示
      clientPort: 24678,     // HMRクライアントポート
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],  // 監視除外
      usePolling: false,     // ネイティブファイル監視を使用（Windowsでは通常これで十分）
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
