<script setup lang="ts">
import { ref } from 'vue';

const proximityPin = ref('7419');
</script>

<template>
  <section class="connect-card">
    <div class="connect-card-icon">
      <svg><use href="#i-wifi-radar" /></svg>
    </div>
    <h2>Wi-Fi mDNS & UDP Beacon</h2>
    <p>Broadcasting presence on UDP port 8090 across local network</p>
    <div class="beacon-badge-row">
      <span class="connect-status-badge connected">Beacon Active (Port 8090)</span>
    </div>
    <div class="proximity-pin-box">
      <span class="pin-label">Proximity PIN:</span>
      <div class="pin-digits">
        <span v-for="(digit, i) in proximityPin" :key="i" class="pin-digit">{{ digit }}</span>
      </div>
    </div>
  </section>
</template>
