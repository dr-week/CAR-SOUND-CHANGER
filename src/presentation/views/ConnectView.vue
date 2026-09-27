<script setup lang="ts">
import { ref, computed } from 'vue';
import ConnectQrTab from './connect/ConnectQrTab.vue';
import ConnectSonicTab from './connect/ConnectSonicTab.vue';
import ConnectDiscoveryTab from './connect/ConnectDiscoveryTab.vue';
import ConnectIpTab from './connect/ConnectIpTab.vue';
import ConnectStatusCard from './connect/ConnectStatusCard.vue';

const props = defineProps<{
  bridgeConnected?: boolean;
  isAudioBroadcasting?: boolean;
  phoneTelemetry?: {
    battery: number;
    charging: boolean;
    network: string;
    phoneName: string;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'sonicPair'): void;
  (e: 'simulateNotification'): void;
  (e: 'simulateCall'): void;
}>();

const activeTab = ref<'qr' | 'sonic' | 'discovery' | 'ip'>('qr');
const isConnected = computed(() => props.bridgeConnected || !!props.phoneTelemetry);
</script>

<template>
  <div class="page connect-page">
    <header class="connect-header">
      <div class="connect-title-group">
        <svg width="28" height="28"><use href="#i-broadcast" /></svg>
        <h1>Broadcaster Link</h1>
      </div>
      <div class="connect-status-badge" :class="{ connected: isConnected }">
        <span class="status-dot" />
        <span>{{ isConnected ? (phoneTelemetry?.phoneName ?? 'Phone Connected') : 'Ready to Pair' }}</span>
      </div>
    </header>

    <nav class="connect-tabs" role="tablist">
      <button
        type="button"
        class="connect-tab-btn"
        :class="{ active: activeTab === 'qr' }"
        @click="activeTab = 'qr'"
      >
        <svg><use href="#i-qr" /></svg>
        <span>QR Code</span>
      </button>

      <button
        type="button"
        class="connect-tab-btn"
        :class="{ active: activeTab === 'sonic' }"
        @click="activeTab = 'sonic'"
      >
        <svg><use href="#i-broadcast" /></svg>
        <span>Ultrasonic</span>
      </button>

      <button
        type="button"
        class="connect-tab-btn"
        :class="{ active: activeTab === 'discovery' }"
        @click="activeTab = 'discovery'"
      >
        <svg><use href="#i-wifi-radar" /></svg>
        <span>Auto-Discovery</span>
      </button>

      <button
        type="button"
        class="connect-tab-btn"
        :class="{ active: activeTab === 'ip' }"
        @click="activeTab = 'ip'"
      >
        <svg><use href="#i-settings" /></svg>
        <span>Direct IP</span>
      </button>
    </nav>

    <div class="connect-body">
      <ConnectQrTab v-if="activeTab === 'qr'" />
      <ConnectSonicTab v-else-if="activeTab === 'sonic'" @sonic-pair="emit('sonicPair')" />
      <ConnectDiscoveryTab v-else-if="activeTab === 'discovery'" />
      <ConnectIpTab v-else />

      <ConnectStatusCard
        :is-connected="isConnected"
        :phone-telemetry="phoneTelemetry"
        :is-audio-broadcasting="isAudioBroadcasting"
        @simulate-notification="emit('simulateNotification')"
        @simulate-call="emit('simulateCall')"
      />
    </div>
  </div>
</template>

<style scoped src="./connect/connectView.css"></style>
