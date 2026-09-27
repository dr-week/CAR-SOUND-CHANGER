<script setup lang="ts">
defineProps<{
  isConnected: boolean;
  phoneTelemetry?: {
    battery: number;
    charging: boolean;
    network: string;
    phoneName: string;
  } | null;
  isAudioBroadcasting?: boolean;
}>();

const emit = defineEmits<{
  (e: 'simulateNotification'): void;
  (e: 'simulateCall'): void;
}>();
</script>

<template>
  <aside class="connect-details-card">
    <div class="detail-row">
      <span>Broadcaster Status</span>
      <b>{{ isConnected ? '🟢 Online' : '⚪ Waiting' }}</b>
    </div>
    <div class="detail-row">
      <span>Battery Level</span>
      <b>{{ phoneTelemetry ? `${phoneTelemetry.battery}%` : 'N/A' }}</b>
    </div>
    <div class="detail-row">
      <span>Audio Streaming</span>
      <b>{{ isAudioBroadcasting ? '🔊 Active (44.1 kHz)' : 'Idle' }}</b>
    </div>
    <div class="detail-row">
      <span>Network</span>
      <b>{{ phoneTelemetry?.network ?? 'LAN' }}</b>
    </div>

    <div class="test-btn-group">
      <button type="button" class="test-btn" @click="emit('simulateNotification')">
        💬 Test Alert
      </button>
      <button type="button" class="test-btn" @click="emit('simulateCall')">
        📞 Test Call
      </button>
    </div>
  </aside>
</template>
