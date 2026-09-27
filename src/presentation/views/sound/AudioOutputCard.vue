<script setup lang="ts">
/**
 * AudioOutputCard
 *
 * Compact, unified audio controls uniting master engine output level
 * and intelligent media ducking reduction.
 */
defineProps<{
  engineVolume: number;
  effectiveEngineVolume: number;
  duckEngine: boolean;
  duckAmount: number;
  playing?: boolean;
}>();

const emit = defineEmits<{
  "update:engineVolume": [val: number];
  "update:duckEngine": [val: boolean];
  "update:duckAmount": [val: number];
}>();
</script>

<template>
  <section class="output-card card" aria-label="Engine audio output and ducking controls">
    <!-- Section 1: Primary Engine Output Level -->
    <div class="control-block">
      <div class="block-header">
        <p class="eyebrow">ENGINE OUTPUT</p>
        <div class="level-badge">
          <strong>{{ effectiveEngineVolume }}%</strong>
          <span v-if="playing && duckEngine && effectiveEngineVolume !== engineVolume" class="duck-badge">
            ducked from {{ engineVolume }}%
          </span>
        </div>
      </div>
      <input
        :value="engineVolume"
        type="range"
        min="0"
        max="100"
        class="audio-slider"
        aria-label="Engine sound output level"
        @input="(e) => emit('update:engineVolume', Number((e.target as HTMLInputElement).value))"
      />
    </div>

    <div class="card-divider"></div>

    <!-- Section 2: Smart Acoustic Ducking -->
    <div class="control-block">
      <div class="block-header">
        <div>
          <p class="eyebrow">ACOUSTIC DUCKING</p>
          <span class="sub-label">Reduce engine when music plays</span>
        </div>
        <button
          type="button"
          class="switch"
          :class="{ on: duckEngine }"
          :aria-pressed="duckEngine"
          aria-label="Toggle acoustic ducking during music playback"
          @click="emit('update:duckEngine', !duckEngine)"
        >
          <i></i>
        </button>
      </div>

      <div class="duck-slider-group" :class="{ disabled: !duckEngine }">
        <input
          :value="duckAmount"
          :disabled="!duckEngine"
          type="range"
          min="10"
          max="80"
          class="audio-slider"
          aria-label="Engine volume reduction percentage"
          @input="(e) => emit('update:duckAmount', Number((e.target as HTMLInputElement).value))"
        />
        <div class="duck-footer">
          <small>Attenuation</small>
          <strong class="mono-amount">-{{ duckAmount }}%</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped src="./audioOutputCard.css"></style>
