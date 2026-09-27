<script setup lang="ts">
import { computed } from 'vue';

const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const gatewayBaseUrl = computed(() => `http://${host}:8088`);
</script>

<template>
  <section class="connect-card">
    <div class="connect-card-icon">
      <svg><use href="#i-settings" /></svg>
    </div>
    <h2>Direct Gateway Connection</h2>
    <p>Set Target IP in Android Companion app to this head unit:</p>
    <code class="gateway-code">{{ gatewayBaseUrl }}</code>
  </section>
</template>
