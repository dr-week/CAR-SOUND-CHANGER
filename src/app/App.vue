<script setup lang="ts">
import { computed } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import DriveControls from "../presentation/components/DriveControls.vue";
import TelemetryPanel from "../presentation/components/TelemetryPanel.vue";
const simulator = useVehicleSimulator();
const profileDetails = computed(() => `${simulator.vehicle.profile.cylinders}-cylinder · ${simulator.vehicle.profile.gears}-speed manual · suggested shift ${simulator.vehicle.profile.shiftRpm.toLocaleString()} RPM`);
function onProfileChange(event: Event): void { simulator.selectProfile(simulator.profiles[(event.target as HTMLSelectElement).value]); }
function onGpsChange(event: Event): void { simulator.setGps((event.target as HTMLInputElement).checked); }
</script>
<template>
  <main class="shell">
    <header><div><p class="eyebrow">Browser sound simulator</p><h1>Car Sound Mod</h1></div><button class="primary" @click="simulator.enableAudio">{{ simulator.audioEnabled.value ? 'Audio enabled' : 'Enable audio' }}</button></header>
    <TelemetryPanel :vehicle="simulator.vehicle" :green-score="simulator.greenScore" />
    <section class="panel"><label for="profile">Vehicle profile</label><select id="profile" :value="simulator.vehicle.profile.id" @change="onProfileChange"><option v-for="profile in simulator.profiles" :key="profile.id" :value="profile.id">{{ profile.name }}</option></select><p>{{ profileDetails }}</p></section>
    <DriveControls @control="simulator.setControl" @shift="simulator.shift" />
    <section class="panel compact"><label><input type="checkbox" :checked="simulator.gpsEnabled.value" @change="onGpsChange"> Use device GPS speed</label><p>W accelerate · S brake · 1 upshift · 2 downshift. Bluetooth output is selected in your device controls. GPS stays on this device.</p></section>
  </main>
</template>
