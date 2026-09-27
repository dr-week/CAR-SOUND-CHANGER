<script setup lang="ts">
export type ViewMode = "home" | "gauges" | "engine" | "media" | "navigate" | "apps" | "connect" | "settings";

defineProps<{
  currentView: ViewMode;
}>();

const emit = defineEmits<{
  "update:currentView": [view: ViewMode];
}>();

const navItems = [
  { id: "media" as const, label: "Media", icon: "music" },
  { id: "navigate" as const, label: "Navigate", icon: "nav" },
  { id: "apps" as const, label: "All apps", icon: "grid" },
  { id: "connect" as const, label: "Companion link", icon: "companion" },
];
</script>

<template>
  <aside class="rail" aria-label="Launcher dock">
    <div class="dock-pill" role="navigation" aria-label="Main navigation pill">
      <button
        type="button"
        class="dock-circle-btn brand"
        :class="{ active: currentView === 'home' }"
        aria-label="Home Cockpit"
        :aria-current="currentView === 'home' ? 'page' : undefined"
        @click="emit('update:currentView', 'home')"
      >
        <svg><use href="#i-home" /></svg>
        <span class="sr-only">Home</span>
      </button>

      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="dock-circle-btn rail-button"
        :class="[{ active: currentView === item.id }, `dock-${item.id}-btn`]"
        :aria-label="item.label"
        :aria-current="currentView === item.id ? 'page' : undefined"
        @click="emit('update:currentView', item.id)"
      >
        <svg><use :href="`#i-${item.icon}`" /></svg>
        <span class="sr-only">{{ item.label }}</span>
      </button>

      <button
        type="button"
        class="dock-circle-btn rail-button settings-link"
        :class="{ active: currentView === 'settings' }"
        aria-label="Settings"
        :aria-current="currentView === 'settings' ? 'page' : undefined"
        @click="emit('update:currentView', 'settings')"
      >
        <svg><use href="#i-settings" /></svg>
        <span class="sr-only">Settings</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Keep the pill shape; reserve enough rail width for larger circular targets. */
.rail {
  width: 104px;
  flex-basis: 104px;
  padding: 0 6px;
}
.dock-pill {
  gap: 10px;
  padding: 10px 8px;
}
.dock-pill .dock-circle-btn {
  width: clamp(64px, 12vh, 80px);
  height: clamp(64px, 12vh, 80px);
  min-height: 0;
  flex-shrink: 0;
}
.dock-pill .dock-circle-btn svg {
  width: 36px;
  height: 36px;
}
</style>
