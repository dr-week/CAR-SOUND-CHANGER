<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import QRCode from 'qrcode';

const props = withDefaults(
  defineProps<{
    value: string;
    size?: number;
    color?: string;
    bgColor?: string;
  }>(),
  {
    size: 180,
    color: '#000000',
    bgColor: '#ffffff',
  },
);

const qrDataUrl = ref<string>('');

watchEffect(async () => {
  try {
    const dataUrl = await QRCode.toDataURL(props.value, {
      width: props.size * 2,
      margin: 2,
      color: {
        dark: props.color,
        light: props.bgColor,
      },
      errorCorrectionLevel: 'M',
    });
    qrDataUrl.value = dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
  }
});
</script>

<template>
  <div class="qr-code-wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      class="qr-image"
      alt="QR Code"
      loading="eager"
    />
    <div v-else class="qr-loading">Generating QR...</div>
  </div>
</template>

<style scoped>
.qr-code-wrapper {
  display: grid;
  place-items: center;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  border: 2px solid rgba(217, 255, 120, 0.4);
}
.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: pixelated;
  display: block;
}
.qr-loading {
  font: 600 12px var(--mono);
  color: #111;
}
</style>
