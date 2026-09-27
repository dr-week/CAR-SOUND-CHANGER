<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const EqualizerModal = defineAsyncComponent(() => import("../presentation/components/EqualizerModal.vue"));

defineProps<{
  eqOpen: boolean;
  eq: any;
}>();

const emit = defineEmits<{
  openHardwareDsp: [];
  close: [];
}>();
</script>

<template>
  <EqualizerModal
    v-if="eqOpen"
    :bands="eq.eqBands"
    :active-preset="eq.eqPreset.value"
    :is-bypassed="eq.eqBypassed.value"
    @update:band="eq.handleBandUpdate"
    @select-preset="eq.handleSelectPreset"
    @toggle-bypass="eq.handleToggleBypass"
    @launch-hardware-dsp="emit('openHardwareDsp')"
    @close="emit('close')"
  />
</template>
