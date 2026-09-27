<script setup lang="ts">
import type { EqualizerBands, EqualizerPresetName } from "../../domain/audio/EqualizerTypes";

defineProps<{
  bands: EqualizerBands;
  activePreset: EqualizerPresetName;
  isBypassed: boolean;
}>();

const emit = defineEmits<{
  "update:band": [band: keyof EqualizerBands, gain: number];
  "selectPreset": [preset: EqualizerPresetName];
  "toggleBypass": [];
  "launchHardwareDsp": [];
  "close": [];
}>();

const presetNames: EqualizerPresetName[] = [
  "Flat",
  "Rock",
  "Pop",
  "Jazz",
  "Electronic",
  "Bass Boost",
  "Vocal",
];

const bandLabels: { key: keyof EqualizerBands; label: string; freq: string }[] = [
  { key: "sub60", label: "SUB", freq: "60Hz" },
  { key: "bass250", label: "BASS", freq: "250Hz" },
  { key: "mid1k", label: "MID", freq: "1kHz" },
  { key: "presence4k", label: "PRESENCE", freq: "4kHz" },
  { key: "treble16k", label: "AIR", freq: "16kHz" },
];
</script>

<template>
  <div class="eq-modal" role="dialog" aria-modal="true" aria-label="Launcher audio equalizer">
    <div class="eq-dialog card">
      <!-- Header -->
      <div class="eq-header">
        <div>
          <p class="eyebrow">LAUNCHER AUDIO & DSP</p>
          <h2>Graphic Equalizer</h2>
        </div>
        <div class="eq-header-actions">
          <button
            type="button"
            class="eq-bypass-btn"
            :class="{ active: !isBypassed }"
            :aria-pressed="!isBypassed"
            @click="emit('toggleBypass')"
          >
            {{ isBypassed ? "EQ BYPASSED" : "EQ ACTIVE" }}
          </button>
          <button type="button" class="quick-close" aria-label="Close Equalizer" @click="emit('close')">✕</button>
        </div>
      </div>

      <!-- Presets Shelf -->
      <div class="eq-presets-shelf" role="group" aria-label="Equalizer Presets">
        <button
          v-for="preset in presetNames"
          :key="preset"
          type="button"
          class="eq-preset-chip"
          :class="{ active: activePreset === preset && !isBypassed }"
          @click="emit('selectPreset', preset)"
        >
          {{ preset }}
        </button>
      </div>

      <!-- 5-Band Slider Stage -->
      <div class="eq-sliders-stage">
        <div v-for="b in bandLabels" :key="b.key" class="eq-band-col">
          <div class="eq-db-readout">
            {{ bands[b.key] > 0 ? `+${bands[b.key]}` : bands[b.key] }} dB
          </div>
          <div class="eq-slider-track-wrap">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              :value="bands[b.key]"
              :disabled="isBypassed"
              :aria-label="`${b.label} ${b.freq}`"
              class="eq-vertical-slider"
              @input="(e) => emit('update:band', b.key, Number((e.target as HTMLInputElement).value))"
            />
          </div>
          <div class="eq-band-meta">
            <strong>{{ b.label }}</strong>
            <small>{{ b.freq }}</small>
          </div>
        </div>
      </div>

      <!-- Footer: Native DSP Launch & Info -->
      <div class="eq-footer">
        <button
          type="button"
          class="eq-native-dsp-btn eq-hardware-dsp-btn"
          aria-label="Open Head Unit Hardware DSP Equalizer App"
          @click="emit('launchHardwareDsp')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z" />
          </svg>
          <span>OPEN HEAD UNIT HARDWARE DSP</span>
        </button>
        <p class="eq-info-note">
          5-band curve tunes launcher audio · Hardware DSP controls full vehicle amplifier & speakers
        </p>
      </div>
    </div>
  </div>
</template>
