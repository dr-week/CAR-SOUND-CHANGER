<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    query?: string;
    compact?: boolean;
  }>(),
  {
    query: "",
    compact: false,
  },
);

const isLoading = ref(true);

const embedUrl = computed(() => {
  const searchQuery = props.query.trim() || "current location";
  return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
});

function onIframeLoad() {
  isLoading.value = false;
}
</script>

<template>
  <div class="google-map-embed-container" :class="{ compact }">
    <div v-if="isLoading" class="map-loading-overlay">
      <svg class="spinner-icon" viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="10" stroke="rgba(217, 255, 120, 0.2)" stroke-width="3" fill="none" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--acid)" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
      <span>Loading Google Maps...</span>
    </div>

    <iframe
      :key="embedUrl"
      :src="embedUrl"
      class="google-map-iframe"
      title="Google Maps Navigation"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      @load="onIframeLoad"
    ></iframe>
  </div>
</template>

<style scoped>
.google-map-embed-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  background: #111513;
  border-radius: inherit;
  overflow: hidden;
}

.google-map-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  filter: contrast(1.05) brightness(0.92);
}

.map-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(13, 18, 15, 0.85);
  backdrop-filter: blur(8px);
  color: var(--muted);
  font: 500 12px var(--mono);
  z-index: 2;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
