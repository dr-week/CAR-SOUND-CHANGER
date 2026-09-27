<script setup lang="ts">
defineProps<{
  time: string;
  date: string;
  quickOpen: boolean;
  bluetoothStatus: string;
  bluetoothName?: string | null;
  telemetryStatus: string;
  speedKph: number;
  batteryLevel: number | null;
  isOnline: boolean;
  isNight?: boolean;
  currentView?: string;
  inline?: boolean;
}>();

const emit = defineEmits<{
  toggleQuick: [];
  toggleBluetooth: [];
  toggleGps: [];
}>();
</script>

<template>
  <header class="telltale-strip" :class="{ 'telltale-strip--inline': inline }" aria-label="Vehicle status telltales">
    <!-- Left Automotive Cluster: Driving Telltales -->
    <div class="telltale-cluster left-cluster">
      <span v-if="isNight" class="telltale-illum" title="Headlights Active (Night Mode)">
        <svg class="telltale-icon-svg"><use href="#i-sun" /></svg>
        <span>ILLUM</span>
      </span>
      <div v-if="currentView !== 'home'" class="telltale-speed" title="Current vehicle speed">
        <strong>{{ Math.round(speedKph) }}</strong>
        <small>KM/H</small>
      </div>
    </div>

    <!-- Right Automotive Cluster: Clock & Connection Status -->
    <div class="telltale-cluster right-cluster">
      <!-- Clock & Quick Controls Trigger -->
      <button
        type="button"
        class="telltale-clock"
        :class="{ 'clock-open': quickOpen }"
        aria-label="Toggle quick controls drawer"
        :aria-expanded="quickOpen"
        @click="emit('toggleQuick')"
      >
        <span class="clock-time">{{ time }}</span>
        <span v-if="inline" class="clock-date">{{ date }}</span>
      </button>

      <button
        type="button"
        class="telltale-btn gps-pill"
        :class="telemetryStatus"
        :title="`GPS: ${telemetryStatus} · ${Math.round(speedKph)} km/h`"
        aria-label="GPS telemetry tracking"
        @click="emit('toggleGps')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          <circle v-if="telemetryStatus === 'live'" cx="12" cy="12" r="2" />
        </svg>
      </button>

      <span class="internet-indicator" role="img" :aria-label="isOnline ? 'Network connected' : 'Network offline'" :title="isOnline ? 'Network connected' : 'Network offline'">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0m-9 4a4 4 0 0 1 6 0" />
          <circle cx="12" cy="20" r=".7" />
          <path v-if="!isOnline" d="m3 3 18 18" />
        </svg>
      </span>

      <button
        type="button"
        class="telltale-btn bluetooth-control"
        :title="`Bluetooth: ${bluetoothStatus}`"
        aria-label="Bluetooth connection"
        @click="emit('toggleBluetooth')"
      >
        <svg aria-hidden="true" :class="{ active: bluetoothStatus === 'connected' }"><use href="#i-bluetooth" /></svg>
        <span v-if="bluetoothStatus === 'connected' && bluetoothName" class="device-name">{{ bluetoothName }}</span>
      </button>
    </div>
  </header>
</template>

<style scoped src="./infotainmentHeader.css"></style>
