<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ heading?: number | null }>();
// North-up face; the arrow indicates GPS travel direction, not stationary vehicle orientation.
const bearing = computed(() => props.heading != null && Number.isFinite(props.heading) ? ((props.heading % 360) + 360) % 360 : null);
</script>
<template>
  <div class="compass-widget" role="img" :aria-label="bearing === null ? 'Compass: heading unavailable' : `Heading ${Math.round(bearing)} degrees`">
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <circle cx="150" cy="150" r="138" class="rim" />
      <circle cx="150" cy="150" r="118" class="inner" />
      <g v-for="tick in 24" :key="tick" :transform="`rotate(${tick * 15} 150 150)`"><path d="M150 40v8" class="tick" /></g>
      <text x="150" y="32">N</text><text x="271" y="157">E</text><text x="150" y="280">S</text><text x="29" y="157">W</text>
      <g v-if="bearing !== null" :transform="`rotate(${bearing} 150 150)`">
        <path d="M150 75l17 75-17-10-17 10Z" class="north" /><path d="m150 225 17-75-17 10-17-10Z" class="south" />
      </g>
      <g v-else class="unknown"><circle cx="150" cy="150" r="18" /><path d="m140 160 20-20" /></g>
    </svg>
  </div>
</template>
<style scoped>
.compass-widget { flex:1; display:grid; place-items:center; min-height:0; }
.compass-widget svg { width:min(100%,330px); height:auto; max-height:100%; stroke:none; }
.rim { fill:#101918; stroke:#ffffff22; }.inner { fill:none; stroke:#ffffff12; }
.tick { stroke:#9caeaa; stroke-width:2; }
text { fill:#b8c9c3; font:600 38px var(--sans); text-anchor:middle; stroke:none; }
.north { fill:#d9e9bd; }.south { fill:#627a72; }
.unknown { fill:none; stroke:#879b93; stroke-width:2; }
</style>
