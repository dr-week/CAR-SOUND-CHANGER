import { createApp } from "vue";
import App from "./app/App.vue";
import "./presentation/styles/app.css";

createApp(App).mount("#app");
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js");
