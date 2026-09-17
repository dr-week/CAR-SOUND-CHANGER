/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { offlinePlugin } from "./scripts/build/offlinePlugin";

export default defineConfig({
  base: "./",
  plugins: [vue(), offlinePlugin()],
  resolve: {
    alias: {
      // @/ maps to src/ — use in imports: import { X } from '@/domain/vehicle'
      "@": resolve(__dirname, "src"),
    },
  },
  server: { host: "127.0.0.1", strictPort: true },
  preview: { host: "127.0.0.1", strictPort: true },
  test: {
    environment: "happy-dom",
  },
});

