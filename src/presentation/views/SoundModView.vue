<script setup lang="ts">
/**
 * SoundModView
 *
 * Modular Car Sound Changer orchestrator coordinating the vehicle acoustic profile
 * rack, real-time harmonic telemetry hero, acoustic soundstage blueprint,
 * output & ducking controls, and tactile driving pads.
 */
import type { VehicleProfile } from "../../domain/vehicle/types";
import type { DriveAction } from "../../domain/vehicle/controls";
import SoundProfileCard from "../components/SoundProfileCard.vue";
import HarmonicVisualizer from "../components/HarmonicVisualizer.vue";
import DriveControls from "../components/DriveControls.vue";
import SoundstageCard from "./sound/SoundstageCard.vue";
import AudioOutputCard from "./sound/AudioOutputCard.vue";

defineProps<{
  audioEnabled: boolean;
  profiles: Record<string, VehicleProfile>;
  activeProfile: VehicleProfile;
  rpm: number;
  gear: number;
  frequencyData: Uint8Array | null;
  engineVolume: number;
  effectiveEngineVolume: number;
  engineZone: string;
  duckEngine: boolean;
  duckAmount: number;
  playing: boolean;
  accelerating: boolean;
  braking: boolean;
}>();

const emit = defineEmits<{
  "toggleEngine": [];
  "selectProfile": [id: string];
  "update:engineVolume": [val: number];
  "update:engineZone": [val: string];
  "update:duckEngine": [val: boolean];
  "update:duckAmount": [val: number];
  "control": [action: DriveAction, active: boolean];
  "shift": [delta: number];
  "reset": [];
}>();
</script>

<template>
  <div class="page engine-page">
    <!-- Header: Dedicated Car Sound Changer Title & Ignition Switch -->
    <div class="page-title">
      <div>
        <p class="eyebrow">AUTOMOTIVE ACOUSTIC MOD</p>
        <h1>Car Sound Changer</h1>
      </div>
      <button
        type="button"
        class="power-button"
        :class="{ on: audioEnabled }"
        aria-label="Toggle car sound changer acoustic engine"
        @click="emit('toggleEngine')"
      >
        <i></i>{{ audioEnabled ? "Mod Active · Stop" : "Ignite Sound Mod" }}
      </button>
    </div>

    <!-- Sound Profiles Rack -->
    <div class="sound-rack-section">
      <p class="eyebrow">VEHICLE ACOUSTIC PROFILES</p>
      <SoundProfileCard
        :profiles="profiles"
        :active-profile-id="activeProfile.id"
        @select="(id) => emit('selectProfile', id)"
      />
    </div>

    <!-- Main Acoustic Studio Layout: Balanced 3-Card Deck -->
    <div class="engine-layout">
      <!-- 1. Left: Dynamic Orbit & Harmonic Spectrum Wave -->
      <section class="engine-hero card" aria-label="Live engine harmonics">
        <div class="engine-orbit" :class="{ 'engine-orbit--on': audioEnabled }">
          <span>{{ gear > 0 ? gear : "N" }}</span>
        </div>
        <p>{{ activeProfile.name }}</p>
        <strong>{{ Math.round(rpm).toLocaleString() }}</strong>
        <small>RPM</small>

        <HarmonicVisualizer
          :rpm="rpm"
          :profile="activeProfile"
          :audio-enabled="audioEnabled"
          :frequency-data="frequencyData"
        />
      </section>

      <!-- 2. Middle: Sculptural Acoustic Soundstage Blueprint -->
      <SoundstageCard
        :engine-zone="engineZone"
        :audio-enabled="audioEnabled"
        @update:engine-zone="(zone) => emit('update:engineZone', zone)"
      />

      <!-- 3. Right: Master Engine Output & Ducking Controls -->
      <AudioOutputCard
        :engine-volume="engineVolume"
        :effective-engine-volume="effectiveEngineVolume"
        :duck-engine="duckEngine"
        :duck-amount="duckAmount"
        :playing="playing"
        @update:engine-volume="(val) => emit('update:engineVolume', val)"
        @update:duck-engine="(val) => emit('update:duckEngine', val)"
        @update:duck-amount="(val) => emit('update:duckAmount', val)"
      />
    </div>

    <!-- Bottom: Tactile Driving Controls Tray -->
    <div class="engine-drive-tray">
      <DriveControls
        :accelerating="accelerating"
        :braking="braking"
        @control="(action, active) => emit('control', action, active)"
        @shift="(delta) => emit('shift', delta)"
        @reset="emit('reset')"
      />
    </div>
  </div>
</template>

<style scoped src="./sound/soundModView.css"></style>
