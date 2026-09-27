<script setup lang="ts">
import { COCKPIT_THEMES } from "../../../domain/theme/themes";

defineProps<{
  themeId: string;
}>();

const emit = defineEmits<{
  "update:themeId": [val: string];
}>();
</script>

<template>
  <section class="setting-card theme-card">
    <div class="setting-icon-badge violet"><svg><use href="#i-grid" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Atmosphere Theme</h2>
      </div>
      <div class="choice-chips">
        <button
          v-for="theme in COCKPIT_THEMES"
          :key="theme.id"
          type="button"
          class="choice-chip theme-chip"
          :class="{ active: themeId === theme.id }"
          @click="emit('update:themeId', theme.id)"
        >
          <span class="chip-accent-dot" :style="{ backgroundColor: theme.accentColor }" />
          <span>{{ theme.name }}</span>
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
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
}
.setting-icon-badge svg { width: 22px; height: 22px; }
.setting-content { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.setting-content h2 { font-size: 14px; font-weight: 700; margin: 0; color: var(--ink); }
.choice-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.choice-chip {
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
.choice-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
.choice-chip.active {
  background: var(--acid);
  color: #111;
  border-color: var(--acid);
  font-weight: 700;
  box-shadow: 0 0 12px rgba(217, 255, 120, 0.3);
}
.chip-accent-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}
</style>
