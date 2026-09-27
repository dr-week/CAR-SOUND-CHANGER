<script setup lang="ts">
import { computed, ref } from "vue";
import SwipeSurface from "./SwipeSurface.vue";
import SpeedometerGauge from "../../components/SpeedometerGauge.vue";
import GoogleMap from "../../components/GoogleMap.vue";
import ClockWidget from "./ClockWidget.vue";

const props = defineProps<{
  speedKph: number;
  telemetryStatus: string;
  headingDegrees?: number | null;
}>();

const emit = defineEmits<{ openNavigate: [] }>();

const modes = ["speed", "map", "clock"] as const;
const leftMode = ref<(typeof modes)[number]>("speed");

function cycleLeft(direction: -1 | 1) {
  leftMode.value = modes[(modes.indexOf(leftMode.value) + direction + modes.length) % modes.length];
}

const setLeftMode = (mode: (typeof modes)[number]) => {
  leftMode.value = mode;
};

// Only the adapter's active state confirms a usable GPS reading; zero is valid then.
const speedAvailable = computed(
  () => props.telemetryStatus === "active" && Number.isFinite(props.speedKph) && props.speedKph >= 0,
);
</script>

<template>
  <SwipeSurface
    class="home-panel home-panel--left"
    aria-label="Driver cockpit essentials"
    @swipe="cycleLeft"
  >
    <!-- Panel Header: Minimal & Aesthetic -->
    <header class="panel-header">
      <span class="panel-tag">{{ { speed: 'Speed', map: 'Navigation', clock: 'Time' }[leftMode] }}</span>
      <div class="panel-tabs" role="group" aria-label="Left panel modes">
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="leftMode === 'speed'"
          :class="{ active: leftMode === 'speed' }"
          aria-label="Speedometer View"
          @click="setLeftMode('speed')"
        >
          <svg class="panel-tab-icon"><use href="#i-speedo" /></svg>
          <span class="sr-only">Speedometer</span>
        </button>
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="leftMode === 'map'"
          :class="{ active: leftMode === 'map' }"
          aria-label="Map View"
          @click="setLeftMode('map')"
        >
          <svg class="panel-tab-icon"><use href="#i-map-pin" /></svg>
          <span class="sr-only">3D Map</span>
        </button>
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="leftMode === 'clock'"
          :class="{ active: leftMode === 'clock' }"
          aria-label="Clock View"
          @click="setLeftMode('clock')"
        >
          <svg class="panel-tab-icon"><use href="#i-clock" /></svg>
          <span class="sr-only">Clock</span>
        </button>
      </div>
    </header>

    <!-- Left Content 1: Speedometer Gauge & Telemetry HUD -->
    <div v-if="leftMode === 'speed'" class="panel-content panel-content--speed">
      <div class="speedometer-center-stage">
        <SpeedometerGauge
          :reading-available="speedAvailable"
          :speed-kph="speedKph"
          source="GPS"
          :max-speed-kph="200"
          :telemetry-status="telemetryStatus"
          :heading-degrees="headingDegrees"
        />
      </div>
    </div>

    <!-- Left Content 2: Live 3D Map & Navigation -->
    <div v-else-if="leftMode === 'map'" class="panel-content panel-content--map">
      <div class="map-viewport-frame" data-no-swipe>
        <GoogleMap :compact="true" @open-navigation="emit('openNavigate')" />
        <div class="map-quick-overlay">
          <button type="button" class="map-handoff-btn" aria-label="Open Full Navigation" @click="emit('openNavigate')">
            <svg class="handoff-btn-icon"><use href="#i-nav" /></svg>
            <span>Open Turn-by-Turn Navigation</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Left Content 3: Luxury Automotive Chrono Timepiece -->
    <div v-else-if="leftMode === 'clock'" class="panel-content panel-content--clock">
      <ClockWidget />
    </div>
  </SwipeSurface>
</template>

<style scoped src="./panel.css"></style>
<style scoped src="./speed.css"></style>
<style scoped src="./map.css"></style>
<style scoped src="./glass.css"></style>
