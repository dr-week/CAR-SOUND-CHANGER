<script setup lang="ts">
/**
 * App.vue
 *
 * Avant-garde minimalist main application shell for the Car Sound Mod.
 * Reduces text clutter, highlights clean controls, and presents an artistic dark interface.
 */
import { computed } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import InstrumentDashboard from "../presentation/dashboard/InstrumentDashboard.vue";

const simulator = useVehicleSimulator();

const audioMessage = computed(
  () =>
    ({
      inactive: "AUDIO OFF · TAP START TO IGNITE",
      active:
        simulator.volume.value === 0
          ? "MUTED · INCREASE MASTER VOLUME"
          : "AUDIO LIVE · ACOUSTIC SYNTHESIS ACTIVE",
      unsupported: "WEB AUDIO UNAVAILABLE IN THIS BROWSER",
      blocked: "AUDIO BLOCKED · TAP START TO RETRY",
    })[simulator.audioStatus.value],
);
</script>

<template>
  <main class="shell">
    <!-- ── Avant-Garde Header ── -->
    <header class="masthead">
      <div class="brand-group">
        <p class="eyebrow">ARTISTIC SOUND LAB · N°01</p>
        <h1>CAR SOUND MOD</h1>
      </div>

      <!-- Engine ignition button -->
      <button
        class="primary"
        :class="{ 'primary--active': simulator.audioEnabled.value }"
        :disabled="simulator.audioPending.value"
        type="button"
        :aria-pressed="simulator.audioEnabled.value"
        @click="simulator.enableAudio"
      >
        <span class="power-mark" aria-hidden="true">⏻</span>
        <span>{{ simulator.audioEnabled.value ? "MUTE ENGINE" : "START ENGINE" }}</span>
      </button>
    </header>

    <!-- ── Live Instrument Dashboard ── -->
    <InstrumentDashboard
      id="main-instruments"
      :rpm="simulator.vehicle.rpm"
      :gear="simulator.vehicle.gear"
      :speed-kph="simulator.vehicle.speedKph"
      :profile="simulator.vehicle.profile"
      :accelerating="simulator.vehicle.throttle > 0"
      :braking="simulator.vehicle.brake > 0"
      :audio-status="simulator.audioStatus.value"
      :muted="simulator.volume.value === 0"
      :telemetry-status="simulator.telemetryStatus.value"
      :green-score="simulator.greenScore.points"
      @control="simulator.setControl"
      @shift="simulator.shift"
      @reset="simulator.reset"
    />

    <!-- ── Minimalist Settings & Controls Art Card ── -->
    <section class="configuration" aria-label="Machine settings">
      <!-- Vehicle profile selector -->
      <div class="setting-block">
        <label for="profile" class="setting-label">
          <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
          ENGINE CHARACTER
        </label>
        <select
          id="profile"
          :value="simulator.vehicle.profile.id"
          @change="simulator.selectProfile(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="profile in simulator.profiles" :key="profile.id" :value="profile.id">
            {{ profile.name }}
          </option>
        </select>
        <span class="setting-spec">
          {{ simulator.vehicle.profile.cylinders }}-CYL · {{ simulator.vehicle.profile.gears }}-SPEED · REDLINE {{ simulator.vehicle.profile.redlineRpm.toLocaleString() }} RPM
        </span>
      </div>

      <!-- Master volume slider -->
      <div class="setting-block">
        <label for="volume" class="setting-label">
          <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          VOLUME · {{ simulator.volume.value }}%
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="100"
          :value="simulator.volume.value"
          @input="simulator.setVolume(Number(($event.target as HTMLInputElement).value))"
        />
        <span class="setting-spec">{{ audioMessage }}</span>
      </div>

      <!-- GPS Telemetry switch -->
      <div class="setting-block">
        <label class="gps-label" for="gps">
          <input
            id="gps"
            type="checkbox"
            :checked="simulator.gpsEnabled.value"
            @change="simulator.setGps(($event.target as HTMLInputElement).checked)"
          />
          <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
          </svg>
          LIVE GPS TELEMETRY
        </label>
        <span class="setting-spec">
          {{ simulator.gpsEnabled.value ? "DEVICE GPS TRACKING ACTIVE" : "KEYBOARD & TOUCH DRIVING" }}
        </span>
      </div>
    </section>

    <!-- ── Minimalist Keyboard Shortcuts Strip ── -->
    <footer class="page-footer">
      <div class="shortcut-pills">
        <span class="pill"><strong>W</strong> / <strong>▲</strong> ACCELERATE</span>
        <span class="pill"><strong>S</strong> / <strong>▼</strong> BRAKE</span>
        <span class="pill"><strong>1</strong> / <strong>Q</strong> UPSHIFT</span>
        <span class="pill"><strong>2</strong> / <strong>E</strong> DOWNSHIFT</span>
      </div>
    </footer>
  </main>
</template>
