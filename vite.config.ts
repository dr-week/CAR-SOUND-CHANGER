import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { offlinePlugin } from "./scripts/build/offlinePlugin";

export default defineConfig({ base: "./", plugins: [vue(), offlinePlugin()], server: { host: "127.0.0.1", strictPort: true }, preview: { host: "127.0.0.1", strictPort: true } });
