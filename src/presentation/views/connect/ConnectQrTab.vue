<script setup lang="ts">
import { ref, computed } from 'vue';
import QrCodeSvg from '../../components/QrCodeSvg.vue';

const qrMode = ref<'web' | 'wifi'>('web');
const copied = ref(false);

const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const webUrl = `http://${host}:8088/phone`;
const wifiQrString = 'WIFI:T:WPA;S:Cockpit-CarLink;P:cockpit2026;;';

const currentQrValue = computed(() => (qrMode.value === 'web' ? webUrl : wifiQrString));

function copyLink() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(webUrl);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  }
}
</script>

<template>
  <section class="connect-card qr-card">
    <div class="qr-mode-switcher">
      <button
        type="button"
        class="qr-mode-btn"
        :class="{ active: qrMode === 'web' }"
        @click="qrMode = 'web'"
      >
        <svg width="14" height="14"><use href="#i-companion" /></svg>
        <span>Web Companion</span>
      </button>
      <button
        type="button"
        class="qr-mode-btn"
        :class="{ active: qrMode === 'wifi' }"
        @click="qrMode = 'wifi'"
      >
        <svg width="14" height="14"><use href="#i-wifi-radar" /></svg>
        <span>One-Tap Wi-Fi</span>
      </button>
    </div>

    <div class="qr-preview-box">
      <QrCodeSvg :value="currentQrValue" :size="180" />
    </div>

    <p v-if="qrMode === 'web'" class="qr-hint">
      Point your phone camera to open companion controls without installing any app.
    </p>
    <p v-else class="qr-hint">
      Point camera to connect to car hotspot automatically with 0 password typing.
    </p>

    <div class="url-copy-box" role="button" tabindex="0" @click="copyLink">
      <code class="url-text">{{ qrMode === 'web' ? webUrl : 'SSID: Cockpit-CarLink' }}</code>
      <span class="copy-tag" :class="{ copied }">{{ copied ? '✓ Copied' : 'Copy' }}</span>
    </div>
  </section>
</template>

<style scoped>
.qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.qr-mode-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 3px;
  gap: 4px;
}

.qr-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--muted);
  font: 600 11px var(--mono);
  cursor: pointer;
  transition: all 0.15s;
}

.qr-mode-btn.active {
  background: rgba(217, 255, 120, 0.15);
  color: var(--acid);
}

.qr-preview-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4px 0;
}

.qr-hint {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
  max-width: 320px;
  text-align: center;
  line-height: 1.4;
}

.url-copy-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.url-copy-box:hover {
  border-color: var(--acid);
}

.url-text {
  font: 600 12px var(--mono);
  color: var(--acid);
}

.copy-tag {
  font: 700 10px var(--mono);
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--ink);
}

.copy-tag.copied {
  background: rgba(52, 199, 89, 0.2);
  color: #34c759;
}
</style>
