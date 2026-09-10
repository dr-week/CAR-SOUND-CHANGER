<script setup lang="ts">
import type { DriveAction } from "../../infrastructure/input/KeyboardInput";
defineEmits<{ control: [action: DriveAction, active: boolean]; shift: [delta: number] }>();
</script>
<template><section class="controls"><button @click="$emit('shift', 1)">1<br><small>Upshift</small></button><button class="brake" @pointerdown.prevent="$emit('control', 'brake', true)" @pointerup="$emit('control', 'brake', false)" @pointerleave="$emit('control', 'brake', false)">S<br><small>Brake</small></button><button class="accelerate" @pointerdown.prevent="$emit('control', 'accelerate', true)" @pointerup="$emit('control', 'accelerate', false)" @pointerleave="$emit('control', 'accelerate', false)">W<br><small>Accelerate</small></button><button @click="$emit('shift', -1)">2<br><small>Downshift</small></button></section></template>
