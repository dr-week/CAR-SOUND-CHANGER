<script setup lang="ts">
import { computed } from "vue";
import type { ActiveCallState } from "./callTypes";
const props = defineProps<{ activeCall: ActiveCallState | null }>();
const emit = defineEmits<{ openPhone: []; answerCall: []; endCall: []; sonicPair: [] }>();
const duration = computed(() => {
  const seconds = Math.max(0, Math.floor(props.activeCall?.durationSeconds ?? 0));
  return [Math.floor(seconds / 60), seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
});
</script>
<template>
  <div class="panel-content panel-content--call">
    <div class="call-card-hud">
      <div class="caller-avatar">
        <svg class="avatar-svg" aria-hidden="true"><use href="#i-phone-call" /></svg>
      </div>
      <div class="caller-meta">
        <span class="call-state-badge">{{
          activeCall ? (activeCall.isIncoming ? "Incoming call" : duration) : "Connection not verified"
        }}</span>
        <h3 class="caller-name">{{ activeCall?.callerName || "Phone" }}</h3>
        <p class="caller-number">{{ activeCall?.callerNumber || "Open the phone app to check connection" }}</p>
      </div>
      <!-- Commands are exposed only when a provider reports an actual call. -->
      <div v-if="activeCall" class="call-actions-row">
        <button
          v-if="activeCall.isIncoming"
          class="call-action-btn call-action-btn--answer"
          @click="emit('answerCall')"
        >
          Answer
        </button>
        <button class="call-action-btn call-action-btn--decline" @click="emit('endCall')">End call</button>
      </div>
      <button class="speed-dial-chip" @click="emit('openPhone')">Open phone</button>
    </div>
  </div>
</template>
<style scoped src="./phone.css"></style>
<style scoped src="./glass.css"></style>
