<script setup lang="ts">
import type { InstalledCarApp } from "../../infrastructure/android/AndroidLauncherBridge";
import SettingsDisplayCard from "./settings/SettingsDisplayCard.vue";
import SettingsThemesCard from "./settings/SettingsThemesCard.vue";
import SettingsDefaultAppsCard from "./settings/SettingsDefaultAppsCard.vue";
import SettingsBluetoothCard from "./settings/SettingsBluetoothCard.vue";

withDefaults(
  defineProps<{
    brightness: number;
    uiScale: number;
    bluetoothName: string | null;
    bluetoothStatus: string;
    muteOnReverse?: boolean;
    defaultNavApp?: string;
    defaultMusicApp?: string;
    installedApps?: InstalledCarApp[];
    themeId?: string;
  }>(),
  {
    muteOnReverse: true,
    defaultNavApp: "internal",
    defaultMusicApp: "internal",
    installedApps: () => [],
    themeId: "german-precision",
  },
);

const emit = defineEmits<{
  "update:brightness": [val: number];
  "update:uiScale": [val: number];
  "update:muteOnReverse": [val: boolean];
  "update:defaultNavApp": [val: string];
  "update:defaultMusicApp": [val: string];
  "update:themeId": [val: string];
  "connectBluetooth": [];
  "openSystemSettings": [];
  "openHardwareDsp": [];
  "openBluetoothMusic": [];
  "openPhone": [];
}>();
</script>

<template>
  <div class="page settings-page">
    <div class="page-title">
      <div class="settings-title-group">
        <svg class="settings-title-icon" width="22" height="22"><use href="#i-settings" /></svg>
        <h1>Settings</h1>
      </div>
      <div class="settings-actions">
        <button
          type="button"
          class="bt-music-settings-btn"
          aria-label="Open Bluetooth Audio"
          @click="emit('openBluetoothMusic')"
        >
          <svg class="settings-action-icon"><use href="#i-music-note" /></svg>
          <span>Audio</span>
        </button>
        <button
          type="button"
          class="phone-settings-btn"
          aria-label="Open Phone"
          @click="emit('openPhone')"
        >
          <svg class="settings-action-icon"><use href="#i-phone-call" /></svg>
          <span>Phone</span>
        </button>
        <button
          type="button"
          class="dsp-settings-btn"
          aria-label="Open Hardware DSP"
          @click="emit('openHardwareDsp')"
        >
          <svg class="settings-action-icon"><use href="#i-sliders" /></svg>
          <span>DSP</span>
        </button>
        <button
          type="button"
          class="system-settings-btn"
          aria-label="Open System Settings"
          @click="emit('openSystemSettings')"
        >
          <svg class="settings-action-icon"><use href="#i-settings" /></svg>
          <span>System</span>
        </button>
      </div>
    </div>

    <div class="settings-grid">
      <SettingsDisplayCard
        :brightness="brightness"
        :ui-scale="uiScale"
        :mute-on-reverse="muteOnReverse"
        @update:brightness="emit('update:brightness', $event)"
        @update:ui-scale="emit('update:uiScale', $event)"
        @update:mute-on-reverse="emit('update:muteOnReverse', $event)"
      />

      <SettingsThemesCard
        :theme-id="themeId"
        @update:theme-id="emit('update:themeId', $event)"
      />

      <SettingsDefaultAppsCard
        :default-nav-app="defaultNavApp"
        :default-music-app="defaultMusicApp"
        :installed-apps="installedApps"
        @update:default-nav-app="emit('update:defaultNavApp', $event)"
        @update:default-music-app="emit('update:defaultMusicApp', $event)"
      />

      <SettingsBluetoothCard
        :bluetooth-name="bluetoothName"
        :bluetooth-status="bluetoothStatus"
        @connect-bluetooth="emit('connectBluetooth')"
      />
    </div>
  </div>
</template>

<style scoped src="./settings/settings.css"></style>
