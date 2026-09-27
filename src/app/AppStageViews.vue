<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import type { InstalledCarApp } from "../infrastructure/android/AndroidLauncherBridge";
import HomeView from "../presentation/views/HomeView.vue";
import InfotainmentHeader from "../presentation/launcher/InfotainmentHeader.vue";

const GaugesView = defineAsyncComponent(() => import("../presentation/views/GaugesView.vue"));
const SoundModView = defineAsyncComponent(() => import("../presentation/views/SoundModView.vue"));
const MediaView = defineAsyncComponent(() => import("../presentation/views/MediaView.vue"));
const NavigateView = defineAsyncComponent(() => import("../presentation/views/NavigateView.vue"));
const AppsView = defineAsyncComponent(() => import("../presentation/views/AppsView.vue"));
const ConnectView = defineAsyncComponent(() => import("../presentation/views/ConnectView.vue"));
const SettingsView = defineAsyncComponent(() => import("../presentation/views/SettingsView.vue"));

defineProps<{
  nav: any; simulator: any; prefs: any; media: any; device: any;
  phone: any; engineAudio: any; overlays: any; eq: any;
  time: string; date: string; destinationQuery: string; appSearch: string;
  installedApps: InstalledCarApp[];
}>();

const emit = defineEmits<{
  "update:destinationQuery": [val: string];
  "update:appSearch": [val: string];
  "toggleGps": []; "toggleEngine": []; "openNavigate": [];
  "openPhone": []; "openBluetoothMusic": []; "openHardwareDsp": [];
  "openSystemSettings": []; "launchApp": [pkg: any]; "navigate": [dest?: string];
}>();
</script>

<template>
  <HomeView
    v-if="nav.currentView.value === 'home'"
    v-model:playing="media.playing.value"
    v-model:audio-source="media.audioSource.value"
    v-model:master-volume="prefs.masterVolume.value"
    :heading-degrees="simulator.headingDegrees.value"
    :external-track="media.externalTrack.value"
    :speed-kph="simulator.vehicle.speedKph" :gear="simulator.vehicle.gear" :rpm="simulator.vehicle.rpm"
    :telemetry-status="simulator.telemetryStatus.value"
    :battery-level="device.batteryLevel.value"
    :active-call="phone.activeCall.value"
    :notifications="phone.notifications.value"
    :is-audio-broadcasting="phone.isAudioBroadcasting.value"
    @open-navigate="emit('openNavigate')"
    @open-phone="emit('openPhone')"
    @answer-call="phone.answerCall()"
    @end-call="phone.endCall()"
    @dismiss-notification="(id) => phone.dismissNotification(id)"
    @clear-notifications="phone.clearAllNotifications()"
    @simulate-notification="phone.postNotification('WhatsApp', 'Sarah Connor', 'Arriving in 5m', 'message')"
    @sonic-pair="phone.emitSonicChirp(); overlays.showNotice('Emitting ultrasound pairing chirp...')"
    @launch-app="(pkg) => emit('launchApp', pkg)"
    @notice="(msg) => overlays.showNotice(msg)"
  >
    <template #information>
      <InfotainmentHeader
        inline
        current-view="home"
        :time="time" :date="date"
        :quick-open="overlays.quickOpen.value"
        :bluetooth-status="simulator.bluetoothStatus.value"
        :bluetooth-name="simulator.bluetoothDeviceName.value"
        :telemetry-status="simulator.telemetryStatus.value"
        :speed-kph="simulator.vehicle.speedKph"
        :battery-level="device.batteryLevel.value"
        :is-online="device.isOnline.value"
        :is-night="prefs.isNight.value"
        @toggle-quick="overlays.quickOpen.value = !overlays.quickOpen.value"
        @toggle-bluetooth="simulator.connectBluetooth()"
        @toggle-gps="emit('toggleGps')"
      />
    </template>
  </HomeView>

  <GaugesView
    v-else-if="nav.currentView.value === 'gauges'"
    :rpm="simulator.vehicle.rpm"
    :gear="simulator.vehicle.gear"
    :speed-kph="simulator.vehicle.speedKph"
    :profile="simulator.vehicle.profile"
    :accelerating="simulator.accelerating.value"
    :braking="simulator.braking.value"
    :audio-status="simulator.audioStatus.value"
    :muted="!simulator.audioEnabled.value"
    :telemetry-status="simulator.telemetryStatus.value"
    :green-score="simulator.greenScore.points"
    :bluetooth-status="simulator.bluetoothStatus.value"
    @control="(action, active) => simulator.setControl(action, active)"
    @shift="(delta) => simulator.shift(delta)"
    @reset="simulator.reset()"
  />

  <SoundModView
    v-else-if="nav.currentView.value === 'engine'"
    v-model:engine-volume="engineAudio.engineVolume.value"
    v-model:engine-zone="engineAudio.engineZone.value"
    v-model:duck-engine="engineAudio.duckEngine.value"
    v-model:duck-amount="engineAudio.duckAmount.value"
    :audio-enabled="simulator.audioEnabled.value"
    :profiles="simulator.profiles"
    :active-profile="simulator.vehicle.profile"
    :rpm="simulator.vehicle.rpm" :gear="simulator.vehicle.gear"
    :frequency-data="engineAudio.audioFrequencyData.value"
    :effective-engine-volume="engineAudio.effectiveEngineVolume.value"
    :playing="media.playing.value"
    :accelerating="simulator.accelerating.value"
    :braking="simulator.braking.value"
    @toggle-engine="emit('toggleEngine')"
    @select-profile="(id) => simulator.selectProfile(id)"
    @control="(action, active) => simulator.setControl(action, active)"
    @shift="(delta) => simulator.shift(delta)"
    @reset="simulator.reset()"
  />

  <MediaView
    v-else-if="nav.currentView.value === 'media'"
    v-model:playing="media.playing.value"
    v-model:audio-source="media.audioSource.value"
    :external-track="media.externalTrack.value"
    @open-equalizer="overlays.eqOpen.value = true"
    @launch-bluetooth-music="emit('openBluetoothMusic')"
    @notice="(msg) => overlays.showNotice(msg)"
  />

  <NavigateView
    v-else-if="nav.currentView.value === 'navigate'"
    :destination-query="destinationQuery"
    @update:destination-query="(val) => emit('update:destinationQuery', val)"
    @navigate="(dest) => emit('navigate', dest)"
  />

  <AppsView
    v-else-if="nav.currentView.value === 'apps'"
    :app-search="appSearch"
    :installed-apps="installedApps"
    @update:app-search="(val) => emit('update:appSearch', val)"
    @launch-app="(app) => emit('launchApp', app)"
  />

  <ConnectView
    v-else-if="nav.currentView.value === 'connect'"
    :bridge-connected="phone.bridgeConnected.value"
    :is-audio-broadcasting="phone.isAudioBroadcasting.value"
    :phone-telemetry="phone.phoneTelemetry.value"
    @sonic-pair="phone.emitSonicChirp(); overlays.showNotice('Emitting ultrasound pairing chirp...')"
    @simulate-notification="phone.postNotification('WhatsApp', 'Alex Miller', 'Arrived at the location', 'message')"
    @simulate-call="phone.simulateIncomingCall('Sarah Connor', '+1 (555) 019-2834')"
  />

  <SettingsView
    v-else-if="nav.currentView.value === 'settings'"
    v-model:brightness="prefs.brightness.value"
    v-model:ui-scale="prefs.uiScale.value"
    v-model:theme-id="prefs.themeId.value"
    v-model:mute-on-reverse="prefs.muteOnReverse.value"
    v-model:default-nav-app="prefs.defaultNavApp.value"
    v-model:default-music-app="prefs.defaultMusicApp.value"
    :installed-apps="installedApps"
    :bluetooth-name="simulator.bluetoothDeviceName.value"
    :bluetooth-status="simulator.bluetoothStatus.value"
    @connect-bluetooth="simulator.connectBluetooth()"
    @open-system-settings="emit('openSystemSettings')"
    @open-hardware-dsp="emit('openHardwareDsp')"
    @open-bluetooth-music="emit('openBluetoothMusic')"
    @open-phone="emit('openPhone')"
  />
</template>
