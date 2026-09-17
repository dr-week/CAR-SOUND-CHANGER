<script setup lang="ts">
/**
 * SidebarDock
 *
 * Fixed left vertical navigation bar for Android Car Head Units (Landscape mode).
 * Features icon-first touch targets (56px+) for safe 1-tap switching while driving.
 */
defineProps<{
  activeTab: "cockpit" | "media" | "sound" | "settings";
  drawerOpen: boolean;
}>();

const emit = defineEmits<{
  "select-tab": [tab: "cockpit" | "media" | "sound" | "settings"];
  "toggle-drawer": [];
}>();
</script>

<template>
  <aside class="sidebar-dock" aria-label="Car Launcher Navigation">
    <!-- Brand / Launcher Home Logo -->
    <button
      type="button"
      class="dock-btn dock-brand"
      :class="{ 'dock-btn--active': activeTab === 'cockpit' && !drawerOpen }"
      aria-label="Home Cockpit"
      @click="emit('select-tab', 'cockpit')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    </button>

    <div class="dock-divider"></div>

    <!-- Navigation / Cockpit Cluster -->
    <button
      type="button"
      class="dock-btn"
      :class="{ 'dock-btn--active': activeTab === 'cockpit' && !drawerOpen }"
      aria-label="Cockpit Gauges"
      @click="emit('select-tab', 'cockpit')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 12l3-5"/>
        <path d="M7 16a6 6 0 0 1 10 0"/>
      </svg>
    </button>

    <!-- Music & Media -->
    <button
      type="button"
      class="dock-btn"
      :class="{ 'dock-btn--active': activeTab === 'media' && !drawerOpen }"
      aria-label="Music and Media"
      @click="emit('select-tab', 'media')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    </button>

    <!-- Sound Engine Tuning -->
    <button
      type="button"
      class="dock-btn"
      :class="{ 'dock-btn--active': activeTab === 'sound' && !drawerOpen }"
      aria-label="Engine Sound Lab"
      @click="emit('select-tab', 'sound')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      </svg>
    </button>

    <!-- All Apps Grid Drawer Trigger -->
    <button
      type="button"
      class="dock-btn dock-btn--drawer"
      :class="{ 'dock-btn--active': drawerOpen }"
      aria-label="All Apps Drawer"
      @click="emit('toggle-drawer')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    </button>

    <!-- System Settings -->
    <button
      type="button"
      class="dock-btn dock-btn--bottom"
      :class="{ 'dock-btn--active': activeTab === 'settings' && !drawerOpen }"
      aria-label="Settings"
      @click="emit('select-tab', 'settings')"
    >
      <svg class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  </aside>
</template>

<style scoped>
.sidebar-dock {
  width: 72px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 6px;
  background: rgba(10, 13, 18, 0.95);
  border-right: 1px solid var(--line);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 10;
  flex-shrink: 0;
}

.dock-btn {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.18s ease;
}

.dock-btn:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: scale(1.04);
}

.dock-btn--active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.25), rgba(255, 71, 87, 0.1));
  border-color: var(--accent);
  box-shadow: 0 0 16px var(--accent-glow);
}

.dock-btn--drawer.dock-btn--active {
  background: linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(0, 242, 254, 0.1));
  border-color: var(--cyan);
  box-shadow: 0 0 16px rgba(0, 242, 254, 0.4);
}

.dock-brand {
  color: var(--accent);
}

.dock-divider {
  width: 32px;
  height: 1px;
  background: var(--line);
  margin: 2px 0;
}

.dock-icon {
  width: 24px;
  height: 24px;
}

.dock-btn--bottom {
  margin-top: auto;
}
</style>
