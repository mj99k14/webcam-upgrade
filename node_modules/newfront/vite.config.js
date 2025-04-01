import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ @를 src로 연결
    },
  },
  server: {
    port: 5173, // ✅ 포트 번호 설정
  },
});
