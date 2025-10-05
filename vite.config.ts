import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "www.onlymsg.xyz",
      "onlymsg.xyz",
      "www.fingnet.xyz",
      "fingnet.xyz",
      ".railway.app"
    ]
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 确保生产环境也正确处理路由
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
