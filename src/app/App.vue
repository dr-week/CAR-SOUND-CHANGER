<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from "vue";
import { googleMapsUrl } from "../infrastructure/android/googleMapsUrl";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import { useLauncherNavigation } from "../application/composables/useLauncherNavigation";
import { useLauncherPreferences } from "../application/composables/useLauncherPreferences";
import { useMediaController } from "../application/composables/useMediaController";
import { useDeviceCapabilities } from "../application/composables/useDeviceCapabilities";
import { useOverlayController } from "../application/composables/useOverlayController";
import { useEngineAudio } from "../application/composables/useEngineAudio";
import { usePhoneCommunication } from "../application/composables/usePhoneCommunication";
import { CapabilityRegistry } from "../application/services/CapabilityRegistry";
import type { InstalledCarApp } from "../infrastructure/android/AndroidLauncherBridge";
import { useLauncherAndroidBridge } from "./useLauncherAndroidBridge";
import { useLauncherAppHandlers } from "./useLauncherAppHandlers";
import { useCockpitClock } from "./useCockpitClock";
import SidebarDock from "../presentation/launcher/SidebarDock.vue";
import LauncherSvgSymbols from "../presentation/icons/LauncherSvgSymbols.vue";
import AppStageViews from "./AppStageViews.vue";
import AppStageModals from "./AppStageModals.vue";
const QuickControlsDrawer = defineAsyncComponent(() => import("../presentation/components/QuickControlsDrawer.vue"));
const overlays = useOverlayController();
const nav = useLauncherNavigation({
  hasOpenOverlay: () => overlays.hasOpenOverlay.value,
  closeTopOverlay: () => overlays.closeTopOverlay(),
});
const prefs = useLauncherPreferences();
const media = useMediaController();
const device = useDeviceCapabilities();
const simulator = useVehicleSimulator();
const { time, date } = useCockpitClock();
const phone = usePhoneCommunication({
  onAudioFocusChanged: (isDucked, isPaused) => {
    prefs.handleAudioFocusDucking(isDucked, isPaused);
    if (isPaused && media.playing.value) {
      media.setPlaying(false);
      overlays.showNotice("Audio paused for phone call");
    }
  },
});
const engineAudio = useEngineAudio({
  isMediaPlaying: media.playing,
  setSimulatorVolume: (vol) => simulator.setVolume(vol),
  isAudioEnabled: simulator.audioEnabled,
  getFrequencyData: () => simulator.getFrequencyData(),
});
watch(
  () => phone.remoteMedia.value,
  (track) => {
    if (track) {
      media.setExternalTrack({
        title: track.title,
        artist: track.artist,
        album: track.album,
        isPlaying: track.isPlaying,
      });
    }
  },
  { immediate: true },
);
const appSearch = ref("");
const destinationQuery = ref("");
const installedApps = ref<InstalledCarApp[]>([]);
const bridge = useLauncherAndroidBridge({ nav, overlays, media, prefs, phone, device });
const eq = useLauncherAppHandlers(overlays, bridge);
const capabilityRegistry = new CapabilityRegistry({
  openSoundStudio: () => nav.setView("engine"),
  openGauges: () => nav.setView("gauges"),
  openEqualizerModal: () => {
    overlays.eqOpen.value = true;
  },
  launchNativeEqualizer: () => bridge.launchEqualizer(),
  launchNativePackage: (pkg) => bridge.launchPackage(pkg),
  notify: (msg) => overlays.showNotice(msg),
});
function handleNavigationLaunch() {
  if (prefs.defaultNavApp.value !== "internal" && prefs.defaultNavApp.value !== "com.google.android.apps.maps") {
    const launched = bridge.launchPackage(prefs.defaultNavApp.value);
    if (!launched) nav.setView("navigate");
  } else {
    openGoogleDirections("");
  }
}
async function toggleEngine() {
  await simulator.enableAudio();
  if (simulator.audioEnabled.value) {
    simulator.setGps(true);
    overlays.showNotice("Car Sound Changer: Active");
  } else {
    simulator.setGps(false);
    overlays.showNotice("Car Sound Changer: Stopped");
  }
}
function toggleGps() {
  simulator.setGps(!simulator.gpsEnabled.value);
  overlays.showNotice(simulator.gpsEnabled.value ? "GPS tracking started" : "GPS tracking paused");
}
function openGoogleDirections(destination = destinationQuery.value) {
  const query = destination.trim();
  if (bridge.launchGoogleMaps(query)) return;
  window.open(googleMapsUrl(query), "_blank", "noopener,noreferrer");
}
onMounted(() => {
  installedApps.value = [
    ...capabilityRegistry.getBuiltInLauncherApps(),
    ...bridge.getInstalledApps(),
  ];
  simulator.setGps(true);
});
</script>
<template>
  <main class="launcher" :style="prefs.launcherStyle.value">
    <LauncherSvgSymbols />
    <SidebarDock
      :current-view="nav.currentView.value"
      @update:current-view="(view) => nav.setView(view)"
    />
    <section class="stage">
      <transition name="toast-slide">
        <div v-if="overlays.notice.value" class="launcher-toast" role="status">
          <span>{{ overlays.notice.value }}</span>
        </div>
      </transition>
      <QuickControlsDrawer
        v-if="overlays.quickOpen.value"
        v-model:brightness="prefs.brightness.value"
        v-model:master-volume="prefs.masterVolume.value"
        @simulate-call="phone.simulateIncomingCall()"
        @simulate-notification="phone.postNotification('WhatsApp', 'Sarah Connor', 'Arriving at coordinates in 5 min.', 'message')"
        @close="overlays.quickOpen.value = false"
      />
      <AppStageViews
        :nav="nav"
        :simulator="simulator"
        :prefs="prefs"
        :media="media"
        :device="device"
        :phone="phone"
        :engine-audio="engineAudio"
        :overlays="overlays"
        :eq="eq"
        :time="time"
        :date="date"
        :installed-apps="installedApps"
        :destination-query="destinationQuery"
        :app-search="appSearch"
        @update:destination-query="(val) => (destinationQuery = val)"
        @update:app-search="(val) => (appSearch = val)"
        @toggle-gps="toggleGps"
        @toggle-engine="toggleEngine"
        @open-navigate="handleNavigationLaunch"
        @open-phone="eq.handleOpenPhone"
        @open-bluetooth-music="eq.handleOpenBluetoothMusic"
        @open-hardware-dsp="eq.handleOpenHardwareDsp"
        @open-system-settings="bridge.launchSettings()"
        @launch-app="(pkg) => capabilityRegistry.handleAppLaunch(pkg)"
        @navigate="openGoogleDirections"
      />
      <AppStageModals
        :eq-open="overlays.eqOpen.value"
        :eq="eq"
        @open-hardware-dsp="eq.handleOpenHardwareDsp"
        @close="overlays.eqOpen.value = false"
      />
    </section>
  </main>
</template>
