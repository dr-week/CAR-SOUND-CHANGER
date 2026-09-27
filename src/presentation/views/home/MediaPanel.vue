<script setup lang="ts">
import { ref, watch } from "vue";
import SwipeSurface from "./SwipeSurface.vue";
import PhoneWidget from "./PhoneWidget.vue";
import NotificationWidget from "./NotificationWidget.vue";
import MediaPlayer from "../../components/MediaPlayer.vue";
import type { ExternalTrackInfo } from "../../../infrastructure/android/AndroidLauncherBridge";
import type { ActiveCallState } from "./callTypes";
import type { AutomotiveNotification } from "../../../domain/notification/types";

const props = withDefaults(
  defineProps<{
    playing: boolean;
    audioSource: "Bluetooth" | "FM Radio";
    externalTrack: ExternalTrackInfo | null;
    activeCall: ActiveCallState | null;
    notifications?: AutomotiveNotification[];
    isAudioBroadcasting?: boolean;
  }>(),
  {
    notifications: () => [],
    isAudioBroadcasting: false,
  },
);

const emit = defineEmits<{
  "update:playing": [value: boolean];
  "update:audioSource": [value: "Bluetooth" | "FM Radio"];
  openPhone: [];
  answerCall: [];
  endCall: [];
  notice: [message: string];
  dismissNotification: [id: string];
  clearNotifications: [];
  simulateNotification: [];
  sonicPair: [];
}>();

const rightMode = ref<"music" | "call" | "messages">("music");
const modeLabels: Record<"music" | "call" | "messages", string> = {
  music: "Music",
  call: "Phone",
  messages: "Messages",
};

function cycleRight(direction: -1 | 1) {
  const modes = ["music", "call", "messages"] as const;
  rightMode.value = modes[(modes.indexOf(rightMode.value) + direction + modes.length) % modes.length];
}

const setRightMode = (mode: "music" | "call" | "messages") => {
  rightMode.value = mode;
};

watch(
  () => props.activeCall,
  (call) => {
    if (call) rightMode.value = "call";
  },
  { immediate: true },
);
</script>

<template>
  <SwipeSurface class="home-panel home-panel--right" aria-label="Infotainment and Communication" @swipe="cycleRight">
    <!-- Panel Header: Minimal & Aesthetic -->
    <header class="panel-header">
      <div class="panel-tag-group">
        <span class="panel-tag">{{ modeLabels[rightMode] }}</span>
        <span v-if="isAudioBroadcasting" class="panel-tag-live">⚡ LIVE STREAM</span>
      </div>
      <div class="panel-tabs" role="group" aria-label="Right panel modes">
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="rightMode === 'music'"
          :class="{ active: rightMode === 'music' }"
          aria-label="Music Player"
          @click="setRightMode('music')"
        >
          <svg class="panel-tab-icon"><use href="#i-music-note" /></svg>
          <span class="sr-only">Music</span>
        </button>
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="rightMode === 'call'"
          :class="{ active: rightMode === 'call' }"
          aria-label="Phone Calls"
          @click="setRightMode('call')"
        >
          <svg class="panel-tab-icon"><use href="#i-phone-call" /></svg>
          <span class="sr-only">Call</span>
        </button>
        <button
          type="button"
          class="panel-tab-btn"
          :aria-pressed="rightMode === 'messages'"
          :class="{ active: rightMode === 'messages' }"
          aria-label="Messages & Notifications"
          @click="setRightMode('messages')"
        >
          <svg class="panel-tab-icon"><use href="#i-message" /></svg>
          <span v-if="notifications.length > 0" class="panel-tab-dot" aria-label="New notifications" />
          <span class="sr-only">Messages</span>
        </button>
      </div>
    </header>

    <!-- Right Content 1: Music Player & Turntable -->
    <div v-if="rightMode === 'music'" class="panel-content panel-content--music">
      <div class="media-turntable-wrapper">
        <MediaPlayer
          variant="launcher"
          :playing="playing"
          :audio-source="audioSource"
          :external-track="externalTrack"
          @update:playing="(val) => emit('update:playing', val)"
          @update:audio-source="(val) => emit('update:audioSource', val)"
          @notice="(msg) => emit('notice', msg)"
        />
      </div>
    </div>

    <!-- Right Content 2: Hands-Free Phone & Active Call HUD -->
    <PhoneWidget
      v-else-if="rightMode === 'call'"
      :active-call="activeCall"
      @open-phone="emit('openPhone')"
      @answer-call="emit('answerCall')"
      @end-call="emit('endCall')"
      @sonic-pair="emit('sonicPair')"
    />

    <!-- Right Content 3: Automotive Notifications & Messages -->
    <NotificationWidget
      v-else-if="rightMode === 'messages'"
      :notifications="notifications"
      @dismiss="(id) => emit('dismissNotification', id)"
      @clear-all="emit('clearNotifications')"
      @simulate="emit('simulateNotification')"
    />
  </SwipeSurface>
</template>

<style scoped src="./panel.css"></style>
<style scoped src="./music.css"></style>
<style scoped src="./glass.css"></style>
