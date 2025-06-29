import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // ←★ 追加した行
  base: "/taskun/",          // GitHub Pages 上での「貼り付け場所」の指定
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
