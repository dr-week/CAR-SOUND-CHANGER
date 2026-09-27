<script setup lang="ts">
import DriverPanel from "./home/DriverPanel.vue";
import MediaPanel from "./home/MediaPanel.vue";
import HomeShortcuts from "./home/HomeShortcuts.vue";
import type { ExternalTrackInfo } from "../../infrastructure/android/AndroidLauncherBridge";
import type { ActiveCallState } from "./home/callTypes";
import type { AutomotiveNotification } from "../../domain/notification/types";

withDefaults(
  defineProps<{
    playing?: boolean;
    audioSource?: "Bluetooth" | "FM Radio";
    masterVolume?: number;
    externalTrack?: ExternalTrackInfo | null;
    speedKph?: number;
    headingDegrees?: number | null;
    gear?: number;
    rpm?: number;
    telemetryStatus?: string;
    batteryLevel?: number | null;
    activeCall?: ActiveCallState | null;
    notifications?: AutomotiveNotification[];
    isAudioBroadcasting?: boolean;
  }>(),
  {
    playing: false,
    audioSource: "Bluetooth",
    masterVolume: 70,
    externalTrack: null,
    speedKph: 0,
    headingDegrees: null,
    gear: 0,
    rpm: 800,
    telemetryStatus: "inactive",
    batteryLevel: null,
    activeCall: null,
    notifications: () => [],
    isAudioBroadcasting: false,
  },
);

const emit = defineEmits<{
  "update:playing": [value: boolean];
  "update:audioSource": [value: "Bluetooth" | "FM Radio"];
  "update:masterVolume": [value: number];
  openNavigate: [];
  openPhone: [];
  answerCall: [];
  endCall: [];
  launchApp: [packageName: string];
  notice: [msg: string];
  dismissNotification: [id: string];
  clearNotifications: [];
  simulateNotification: [];
  sonicPair: [];
}>();
</script>

<template>
  <div class="page home-page">
    <div class="home-dual-cockpit">
      <DriverPanel
        :speed-kph="speedKph"
        :heading-degrees="headingDegrees"
        :telemetry-status="telemetryStatus"
        @open-navigate="emit('openNavigate')"
      />
      <MediaPanel
        :playing="playing"
        :audio-source="audioSource"
        :external-track="externalTrack"
        :active-call="activeCall"
        :notifications="notifications"
        :is-audio-broadcasting="isAudioBroadcasting"
        @update:playing="emit('update:playing', $event)"
        @update:audio-source="emit('update:audioSource', $event)"
        @open-phone="emit('openPhone')"
        @answer-call="emit('answerCall')"
        @end-call="emit('endCall')"
        @notice="emit('notice', $event)"
        @dismiss-notification="emit('dismissNotification', $event)"
        @clear-notifications="emit('clearNotifications')"
        @simulate-notification="emit('simulateNotification')"
        @sonic-pair="emit('sonicPair')"
      />
    </div>
    <div class="home-footer">
      <div class="home-information"><slot name="information" /></div>
      <HomeShortcuts :volume="masterVolume" @volume="emit('update:masterVolume', $event)" />
    </div>
  </div>
</template>
<style scoped src="./home/layout.css"></style>
