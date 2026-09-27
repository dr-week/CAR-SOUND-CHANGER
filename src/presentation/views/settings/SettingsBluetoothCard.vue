<script setup lang="ts">
defineProps<{
  bluetoothName: string | null;
  bluetoothStatus: string;
}>();

const emit = defineEmits<{
  connectBluetooth: [];
}>();
</script>

<template>
  <section class="setting-card bluetooth-card">
    <div class="setting-icon-badge violet"><svg><use href="#i-bluetooth" /></svg></div>
    <div class="setting-content">
      <div class="setting-header-row">
        <h2>Bluetooth</h2>
        <span class="value-badge" :class="{ 'badge-active': !!bluetoothName }">
          {{ bluetoothName ? 'Connected' : (bluetoothStatus || 'Idle') }}
        </span>
      </div>
      <div class="bt-device-info">
        <span class="bt-name">{{ bluetoothName || 'No device connected' }}</span>
        <button type="button" class="action-btn" @click="emit('connectBluetooth')">
          <svg width="14" height="14"><use href="#i-bluetooth" /></svg>
          <span>{{ bluetoothName ? 'Re-pair' : 'Pair' }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.setting-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 20px;
  background: var(--panel-glass, rgba(21, 26, 23, 0.75));
  border: 1px solid var(--line);
  backdrop-filter: blur(16px);
}
.setting-icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: rgba(142, 120, 255, 0.12);
  color: #bcaeff;
}
.setting-icon-badge svg { width: 22px; height: 22px; }
.setting-content { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.setting-header-row { display: flex; justify-content: space-between; align-items: center; }
.setting-content h2 { font-size: 14px; font-weight: 700; margin: 0; color: var(--ink); }
.value-badge {
  font: 700 11px var(--mono);
  padding: 3px 10px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--muted);
}
.badge-active {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}
.bt-device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 600 12px var(--mono);
  color: var(--ink);
}
.bt-name { color: var(--muted); }
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 99px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.06);
  color: var(--ink);
  font: 700 11px var(--mono);
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: rgba(217, 255, 120, 0.12);
  border-color: var(--acid);
  color: var(--acid);
}
.action-btn svg { stroke: currentColor; fill: none; }
</style>
