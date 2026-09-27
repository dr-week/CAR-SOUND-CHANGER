<script setup lang="ts">
defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  "close": [];
}>();
</script>

<template>
  <div v-if="active" class="camera-modal" role="dialog" aria-label="Rear parking camera">
    <div class="camera-stream">
      <!-- Camera Stream Status Header -->
      <div class="cam-telemetry-header">
        <div class="cam-feed-tag">
          <span class="cam-live-indicator"></span>
          <strong>REVERSE CAMERA INPUT</strong>
        </div>
        <span class="safety-disclaimer">CHECK SURROUNDINGS FOR SAFETY</span>
      </div>

      <!-- Dynamic Parking Sensor Guidelines -->
      <div class="guidelines">
        <div class="traj-line left-traj"></div>
        <div class="traj-line right-traj"></div>
        <div class="guide-bars">
          <span class="guide green-guide"></span>
          <span class="guide yellow-guide"></span>
          <span class="guide red-guide"></span>
        </div>
      </div>

      <p class="camera-status">REVERSE CAMERA ACTIVE · CHECK SURROUNDINGS BEFORE MOVING</p>
      <button type="button" class="close-camera" @click="emit('close')">DISMISS CAMERA</button>
    </div>
  </div>
</template>
