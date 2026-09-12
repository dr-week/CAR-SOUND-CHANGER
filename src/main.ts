import { createApp } from "vue";
import App from "./app/App.vue";
import "./presentation/styles/app.css";

createApp(App).mount("#app");
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("./service-worker.js").catch(() => {
      console.warn("Offline installation is unavailable; online operation remains available.");
    });
  });
}
