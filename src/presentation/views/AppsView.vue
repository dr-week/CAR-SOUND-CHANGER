<script setup lang="ts">
import { computed } from "vue";
import type { InstalledCarApp } from "../../infrastructure/android/AndroidLauncherBridge";

const props = defineProps<{
  appSearch: string;
  installedApps: InstalledCarApp[];
}>();

const emit = defineEmits<{
  "update:appSearch": [val: string];
  "launchApp": [app: InstalledCarApp];
}>();

const filteredApps = computed(() => {
  const q = props.appSearch.toLowerCase().trim();
  if (!q) return props.installedApps;
  return props.installedApps.filter(
    (app) => app.label.toLowerCase().includes(q) || app.packageName.toLowerCase().includes(q),
  );
});

function getIconId(icon: string): string {
  switch (icon) {
    case "equalizer":
      return "i-music";
    case "radio":
      return "i-radio";
    case "camera":
      return "i-camera";
    case "car":
      return "i-car";
    case "gauge":
      return "i-gauge";
    case "bluetooth":
      return "i-bluetooth";
    case "phone":
      return "i-phone";
    default:
      return "i-grid";
  }
}

function getAppColor(icon: string): string {
  switch (icon) {
    case "equalizer":
      return "mint";
    case "radio":
      return "amber";
    case "camera":
      return "green";
    case "car":
      return "coral";
    case "bluetooth":
      return "violet";
    case "phone":
      return "blue";
    default:
      return "mint";
  }
}
</script>

<template>
  <div class="page apps-page">
    <div class="page-title">
      <div>
        <p class="eyebrow">APPLICATIONS & UTILITIES</p>
        <h1>Automotive Apps</h1>
      </div>
      <label>
        <svg><use href="#i-search" /></svg>
        <input
          :value="appSearch"
          placeholder="Search apps"
          aria-label="Search apps"
          @input="(e) => emit('update:appSearch', (e.target as HTMLInputElement).value)"
        />
      </label>
    </div>
    <div class="app-grid">
      <button
        v-for="app in filteredApps"
        :key="app.packageName"
        type="button"
        class="app"
        :class="getAppColor(app.icon)"
        @click="emit('launchApp', app)"
      >
        <i><svg><use :href="`#${getIconId(app.icon)}`" /></svg></i>
        <strong>{{ app.label }}</strong>
      </button>
      <p v-if="filteredApps.length === 0" class="apps-empty" role="status">
        Installed Android apps will appear here on the head unit.
      </p>
    </div>
  </div>
</template>
