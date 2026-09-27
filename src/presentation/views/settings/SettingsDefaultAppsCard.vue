<script setup lang="ts">
import type { InstalledCarApp } from "../../../infrastructure/android/AndroidLauncherBridge";

defineProps<{
  defaultNavApp: string;
  defaultMusicApp: string;
  installedApps: InstalledCarApp[];
}>();

const emit = defineEmits<{
  "update:defaultNavApp": [val: string];
  "update:defaultMusicApp": [val: string];
}>();
</script>

<template>
  <!-- 1. Default Navigation -->
  <section class="setting-card default-app-card">
    <div class="setting-icon-badge cyan"><svg><use href="#i-nav" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Default navigation</h2>
      </div>
      <div class="app-chip-group">
        <button
          type="button"
          class="app-chip"
          :class="{ active: defaultNavApp === 'internal' }"
          @click="emit('update:defaultNavApp', 'internal')"
        >
          <svg width="14" height="14"><use href="#i-nav" /></svg>
          <span>Built-in Map</span>
        </button>
        <button
          v-for="app in installedApps.filter((a) => a.category === 'navigation' || a.packageName.includes('map') || a.packageName.includes('waze'))"
          :key="app.packageName"
          type="button"
          class="app-chip"
          :class="{ active: defaultNavApp === app.packageName }"
          @click="emit('update:defaultNavApp', app.packageName)"
        >
          <span>{{ app.label }}</span>
        </button>
      </div>
    </div>
  </section>

  <!-- 2. Default Audio Player -->
  <section class="setting-card default-app-card">
    <div class="setting-icon-badge amber"><svg><use href="#i-music" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Default music app</h2>
      </div>
      <div class="app-chip-group">
        <button
          type="button"
          class="app-chip"
          :class="{ active: defaultMusicApp === 'internal' }"
          @click="emit('update:defaultMusicApp', 'internal')"
        >
          <svg width="14" height="14"><use href="#i-music" /></svg>
          <span>Built-in</span>
        </button>
        <button
          v-for="app in installedApps.filter((a) => a.category === 'media' || a.packageName.includes('music') || a.packageName.includes('spotify'))"
          :key="app.packageName"
          type="button"
          class="app-chip"
          :class="{ active: defaultMusicApp === app.packageName }"
          @click="emit('update:defaultMusicApp', app.packageName)"
        >
          <span>{{ app.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.setting-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 20px;
  background: var(--panel-glass, rgba(21, 26, 23, 0.75));
  border: 1px solid var(--line);
  backdrop-filter: blur(16px);
}
.setting-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.setting-icon-badge svg { width: 22px; height: 22px; }
.cyan { background: rgba(0, 199, 255, 0.12); color: #00c7ff; }
.amber { background: rgba(255, 179, 0, 0.12); color: #ffb300; }
.setting-content { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.setting-content h2 { font-size: 14px; font-weight: 700; margin: 0; color: var(--ink); }
.app-chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
.app-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted);
  font: 600 11px var(--mono);
  cursor: pointer;
  transition: all 0.2s ease;
}
.app-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.app-chip.active {
  background: var(--acid);
  color: #111;
  border-color: var(--acid);
  font-weight: 700;
  box-shadow: 0 0 12px rgba(217, 255, 120, 0.3);
}
.app-chip svg { stroke: currentColor; fill: none; }
</style>
