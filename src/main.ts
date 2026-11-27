import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import { useTheme } from "@/lib/theme";

useTheme();

createApp(App).use(createPinia()).mount("#app");
