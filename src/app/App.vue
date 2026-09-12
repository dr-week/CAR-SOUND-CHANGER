<script setup lang="ts">
import { computed } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import DriveControls from "../presentation/components/DriveControls.vue";
import GearDisplay from "../presentation/components/GearDisplay.vue";
import SpeedDisplay from "../presentation/components/SpeedDisplay.vue";
import StatusIndicators from "../presentation/components/StatusIndicators.vue";
import VehicleTachometer from "../presentation/components/VehicleTachometer.vue";
const simulator = useVehicleSimulator();
const profileDetails = computed(
  () =>
    `${simulator.vehicle.profile.cylinders}-cylinder · ${simulator.vehicle.profile.gears}-speed manual · suggested shift ${simulator.vehicle.profile.shiftRpm.toLocaleString()} RPM`,
);
const audioMessage = computed(
  () =>
    ({
      inactive: "Audio is off.",
      active: "Audio is active.",
      unsupported: "Web Audio is unavailable in this browser.",
      blocked: "Audio was blocked. Tap Enable audio again.",
    })[simulator.audioStatus.value],
);
const gpsMessage = computed(
  () =>
    ({
      inactive: "GPS is off.",
      active: "GPS speed is active and remains on this device.",
      unavailable: "GPS is unavailable in this browser.",
      denied: "GPS permission was denied.",
      error: "GPS could not provide a position.",
      stale: "GPS data is stale; simulation remains available.",
    })[simulator.telemetryStatus.value],
);
function onProfileChange(event: Event): void {
  simulator.selectProfile((event.target as HTMLSelectElement).value);
}
function onGpsChange(event: Event): void {
  simulator.setGps((event.target as HTMLInputElement).checked);
}
</script>
<template>
  <main class="shell">
    <header>
      <div>
        <p class="eyebrow">Browser sound simulator</p>
        <h1>Car Sound Mod</h1>
      </div>
      <button class="primary" type="button" @click="simulator.enableAudio">
        {{ simulator.audioEnabled.value ? "Mute audio" : "Enable audio" }}
      </button>
    </header>
    <section class="instrument-cluster">
      <VehicleTachometer :rpm="simulator.vehicle.rpm" :profile="simulator.vehicle.profile" />
      <div class="digital-displays">
        <GearDisplay :gear="simulator.vehicle.gear" />
        <SpeedDisplay
          :speed-kph="simulator.vehicle.gpsSpeedKph ?? simulator.vehicle.speedKph"
          :source="simulator.telemetryStatus.value === 'active' ? 'GPS' : 'Simulation'"
        />
      </div>
    </section>
    <DriveControls
      :accelerating="simulator.vehicle.throttle > 0"
      :braking="simulator.vehicle.brake > 0"
      @control="simulator.setControl"
      @shift="simulator.shift"
      @reset="simulator.reset"
    />
    <StatusIndicators
      :audio-status="simulator.audioStatus.value"
      :telemetry-status="simulator.telemetryStatus.value"
      :green-score="simulator.greenScore.points"
    />
    <p
      v-if="simulator.audioStatus.value === 'blocked' || simulator.audioStatus.value === 'unsupported'"
      class="status"
      role="alert"
    >
      {{ audioMessage }}
    </p>
    <section class="panel">
      <label for="volume">Volume · {{ simulator.volume.value }}%</label>
      <input id="volume" type="range" min="0" max="100" :value="simulator.volume.value" @input="simulator.setVolume(Number(($event.target as HTMLInputElement).value))" />
      <label for="profile">Vehicle profile</label
      ><select id="profile" :value="simulator.vehicle.profile.id" @change="onProfileChange">
        <option v-for="profile in simulator.profiles" :key="profile.id" :value="profile.id">{{ profile.name }}</option>
      </select>
      <p>{{ profileDetails }}</p>
    </section>
    <section class="panel compact">
      <label
        ><input type="checkbox" :checked="simulator.gpsEnabled.value" @change="onGpsChange" /> Use device GPS
        speed</label
      >
      <p>{{ gpsMessage }}</p>
      <p>
        W accelerate · S brake · 1 upshift · 2 downshift. Bluetooth output is selected in your device controls. GPS
        stays on this device.
      </p>
    </section>
  </main>
</template>
