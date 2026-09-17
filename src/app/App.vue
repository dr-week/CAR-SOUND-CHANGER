<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import GoogleMap from "../presentation/components/GoogleMap.vue";
import CockpitTelemetry from "../presentation/components/CockpitTelemetry.vue";
import HarmonicVisualizer from "../presentation/components/HarmonicVisualizer.vue";
import SoundProfileCard from "../presentation/components/SoundProfileCard.vue";
import InstrumentDashboard from "../presentation/dashboard/InstrumentDashboard.vue";

type View = "home" | "gauges" | "engine" | "media" | "navigate" | "apps" | "settings";
const simulator = useVehicleSimulator();
const view = ref<View>("home");
const now = ref(new Date());
const playing = ref(true);
const brightness = ref(74);
const masterVolume = ref(80);
const quickOpen = ref(false);
const appSearch = ref("");
const destinationQuery = ref("");
const uiScale = ref(Number(localStorage.getItem("launcher-ui-scale") || 110));
const engineVolume = ref(Number(localStorage.getItem("engine-volume") || 62));
const engineZone = ref(localStorage.getItem("engine-zone") || "rear");
const duckEngine = ref(localStorage.getItem("engine-duck") !== "false");
const duckAmount = ref(Number(localStorage.getItem("engine-duck-amount") || 38));
const audioSource = ref<"Bluetooth" | "FM Radio" | "Soundstage">("Bluetooth");
const cameraActive = ref(false);
const diagnosticsActive = ref(false);
const isOnline = ref(navigator.onLine);
const batteryLevel = ref<number | null>(null);
const notice = ref<string | null>(null);

let clock: number | undefined;
let noticeTimer: number | undefined;

const nav = [
  { id: "gauges", label: "Gauges", icon: "gauge" },
  { id: "engine", label: "Sound Lab", icon: "car" },
  { id: "media", label: "Media", icon: "music" },
  { id: "navigate", label: "Navigate", icon: "nav" },
  { id: "apps", label: "All apps", icon: "grid" },
] as const;

// De-duplicated: secondary & dedicated automotive tools only
const apps = [
  ["Hands-Free Phone", "phone", "blue", "phone"],
  ["FM Radio Tuner", "radio", "amber", "radio"],
  ["360° / Rear Camera", "camera", "green", "camera"],
  ["Vehicle Diagnostics", "car", "coral", "diagnostics"],
  ["Bluetooth Pairing", "bluetooth", "violet", "bluetooth"],
] as const;

const time = computed(() =>
  now.value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
);
const date = computed(() => now.value.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
const greeting = computed(() =>
  now.value.getHours() < 12 ? "Good morning" : now.value.getHours() < 18 ? "Good afternoon" : "Good evening",
);
const filteredApps = computed(() =>
  apps.filter((app) => app[0].toLowerCase().includes(appSearch.value.toLowerCase())),
);
const effectiveEngineVolume = computed(() =>
  playing.value && duckEngine.value
    ? Math.round(engineVolume.value * (1 - duckAmount.value / 100))
    : engineVolume.value,
);
const launcherStyle = computed(() => ({ "--ui-scale": `${uiScale.value / 100}` }));

function showNotice(msg: string) {
  notice.value = msg;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    if (notice.value === msg) notice.value = null;
  }, 3500);
}

function openApp(id: string) {
  if (id === "radio") {
    audioSource.value = "FM Radio";
    view.value = "media";
    showNotice("FM Tuner: 98.3 FM Live");
  } else if (id === "bluetooth") {
    simulator.connectBluetooth();
    showNotice("Web Bluetooth: Searching for devices...");
  } else if (id === "camera") {
    cameraActive.value = true;
  } else if (id === "diagnostics") {
    diagnosticsActive.value = true;
  } else if (id === "phone") {
    showNotice("Hands-free: Ready for incoming calls via Bluetooth.");
  }
}

async function toggleEngine() {
  await simulator.enableAudio();
  if (simulator.audioEnabled.value) {
    simulator.setGps(true);
    showNotice("Engine ignited · Telemetry active");
  } else {
    simulator.setGps(false);
    showNotice("Engine stopped");
  }
}

function toggleGps() {
  simulator.setGps(!simulator.gpsEnabled.value);
  showNotice(simulator.gpsEnabled.value ? "GPS tracking started" : "GPS tracking paused");
}

function openGoogleDirections(destination = destinationQuery.value) {
  const query = destination.trim();
  if (!query) {
    view.value = "navigate";
    return;
  }
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", query);
  url.searchParams.set("travelmode", "driving");
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

watch(effectiveEngineVolume, (volume) => simulator.setVolume(volume), { immediate: true });
watch(uiScale, (value) => localStorage.setItem("launcher-ui-scale", String(value)));
watch(engineVolume, (value) => localStorage.setItem("engine-volume", String(value)));
watch(engineZone, (value) => localStorage.setItem("engine-zone", value));
watch(duckEngine, (value) => localStorage.setItem("engine-duck", String(value)));
watch(duckAmount, (value) => localStorage.setItem("engine-duck-amount", String(value)));

onMounted(() => {
  clock = window.setInterval(() => (now.value = new Date()), 1000);
  window.addEventListener("online", () => (isOnline.value = true));
  window.addEventListener("offline", () => (isOnline.value = false));

  if ("getBattery" in navigator) {
    (navigator as unknown as { getBattery: () => Promise<{ level: number; addEventListener: (type: string, fn: () => void) => void }> })
      .getBattery?.()
      .then((battery) => {
        batteryLevel.value = Math.round(battery.level * 100);
        battery.addEventListener("levelchange", () => {
          batteryLevel.value = Math.round(battery.level * 100);
        });
      })
      .catch(() => {});
  }
});

onBeforeUnmount(() => {
  window.clearInterval(clock);
  window.clearTimeout(noticeTimer);
});
</script>

<template>
  <main class="launcher" :style="launcherStyle">
    <!-- SVG Icon Symbols -->
    <svg class="symbols" aria-hidden="true">
      <symbol id="i-home" viewBox="0 0 24 24">
        <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
      </symbol>
      <symbol id="i-gauge" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l3-5" />
        <path d="M7 16a6 6 0 0 1 10 0" />
      </symbol>
      <symbol id="i-music" viewBox="0 0 24 24">
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </symbol>
      <symbol id="i-nav" viewBox="0 0 24 24"><path d="m4 4 16 6-7 3-3 7z" /></symbol>
      <symbol id="i-grid" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </symbol>
      <symbol id="i-settings" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19 15a2 2 0 0 0 .4 2l.1.1-2.4 2.4-.1-.1a2 2 0 0 0-2-.4 2 2 0 0 0-1 1.7v.2h-3.5v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2 .4l-.1.1-2.4-2.4.1-.1A2 2 0 0 0 5 15a2 2 0 0 0-1.7-1h-.2v-3.5h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2l-.1-.1 2.4-2.4.1.1A2 2 0 0 0 9 5a2 2 0 0 0 1-1.7v-.2h3.5v.2A2 2 0 0 0 15 5a2 2 0 0 0 2-.4l.1-.1 2.4 2.4-.1.1A2 2 0 0 0 19 9a2 2 0 0 0 1.7 1h.2v3.5h-.2A2 2 0 0 0 19 15z"
        />
      </symbol>
      <symbol id="i-phone" viewBox="0 0 24 24">
        <path
          d="M22 17v3a2 2 0 0 1-2 2A20 20 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2c.1 1 .4 2 .8 3a2 2 0 0 1-.5 2l-1.2 1.3a16 16 0 0 0 5.6 5.6l1.3-1.2a2 2 0 0 1 2-.5c1 .4 2 .7 3 .8a2 2 0 0 1 2 2z"
        />
      </symbol>
      <symbol id="i-radio" viewBox="0 0 24 24">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="m7 6 10-4M7 11h5" />
        <circle cx="16" cy="14" r="3" />
      </symbol>
      <symbol id="i-maps" viewBox="0 0 24 24"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" /></symbol>
      <symbol id="i-bluetooth" viewBox="0 0 24 24"><path d="m7 7 10 10-5 4V3l5 4L7 17" /></symbol>
      <symbol id="i-camera" viewBox="0 0 24 24">
        <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
        <circle cx="12" cy="13" r="4" />
      </symbol>
      <symbol id="i-car" viewBox="0 0 24 24">
        <path d="m5 17-2-2v-4l2-5h14l2 5v4l-2 2M5 17v3M19 17v3M3 12h18M7 15h.01M17 15h.01" />
      </symbol>
      <symbol id="i-sun" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M5 5l1.4 1.4M17.6 17.6 19 19M2 12h2M20 12h2M5 19l1.4-1.4M17.6 6.4 19 5" />
      </symbol>
      <symbol id="i-volume" viewBox="0 0 24 24">
        <path d="M11 5 6 9H2v6h4l5 4zM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12" />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </symbol>
      <symbol id="i-back" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></symbol>
      <symbol id="i-next" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></symbol>
      <symbol id="i-play" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z" /></symbol>
    </svg>

    <!-- Tactile Left Navigation Rail -->
    <aside class="rail" aria-label="Launcher dock">
      <button class="brand" :class="{ active: view === 'home' }" aria-label="Home Cockpit" @click="view = 'home'">m</button>
      <nav>
        <button
          v-for="item in nav"
          :key="item.id"
          class="rail-button"
          :class="{ active: view === item.id }"
          :aria-label="item.label"
          @click="view = item.id"
        >
          <svg><use :href="`#i-${item.icon}`" /></svg>
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <button
        class="rail-button settings-link"
        :class="{ active: view === 'settings' }"
        aria-label="Settings"
        @click="view = 'settings'"
      >
        <svg><use href="#i-settings" /></svg>
        <span>Settings</span>
      </button>
    </aside>

    <!-- Main Stage -->
    <section class="stage">
      <!-- Status Bar with Genuine Telemetry -->
      <header class="statusbar">
        <div class="ready">
          <i :class="{ 'engine-live': simulator.audioEnabled.value }"></i>
          <span class="sr-only">Engine status</span>
          {{ simulator.audioEnabled.value ? 'ENGINE ON' : 'STANDBY' }}
        </div>

        <button class="clock" :class="{ 'clock-open': quickOpen }" aria-label="Toggle quick controls" @click="quickOpen = !quickOpen">
          <strong>{{ time }}</strong>
          <small>{{ date }}</small>
          <span class="quick-pill-dot" title="Quick Controls"></span>
        </button>

        <div class="system-status">
          <button
            type="button"
            class="status-btn"
            :title="`Bluetooth: ${simulator.bluetoothStatus.value}`"
            @click="simulator.connectBluetooth()"
          >
            <svg :class="{ active: simulator.bluetoothStatus.value === 'connected' }"><use href="#i-bluetooth" /></svg>
          </button>

          <button
            type="button"
            class="status-btn gps-btn"
            :class="simulator.telemetryStatus.value"
            :title="`GPS: ${simulator.telemetryStatus.value} · ${Math.round(simulator.vehicle.speedKph)} km/h`"
            @click="toggleGps"
          >
            <b>GPS {{ Math.round(simulator.vehicle.speedKph) }}</b>
          </button>

          <b v-if="batteryLevel !== null" class="battery">{{ batteryLevel }}%</b>
          <b v-else class="net-status" :class="{ online: isOnline }">{{ isOnline ? 'ONLINE' : 'OFFLINE' }}</b>
        </div>
      </header>

      <!-- Toast Feedback Bar -->
      <transition name="toast-slide">
        <div v-if="notice" class="launcher-toast" role="status">
          <span>{{ notice }}</span>
        </div>
      </transition>

      <!-- Quick Controls Drawer -->
      <aside v-if="quickOpen" class="quick-panel">
        <div class="quick-header">
          <p class="eyebrow">QUICK CONTROLS</p>
          <button class="quick-close" aria-label="Close" @click="quickOpen = false">✕</button>
        </div>
        <label>
          <svg><use href="#i-sun" /></svg>
          <input v-model="brightness" type="range" min="10" max="100" aria-label="Screen Brightness" />
          <span>{{ brightness }}%</span>
        </label>
        <label>
          <svg><use href="#i-volume" /></svg>
          <input v-model="masterVolume" type="range" min="0" max="100" aria-label="Master Media Volume" />
          <span>{{ masterVolume }}%</span>
        </label>
        <div class="quick-engine-toggle">
          <span>Engine Sound</span>
          <button
            type="button"
            class="quick-power-btn"
            :class="{ on: simulator.audioEnabled.value }"
            @click="toggleEngine"
          >
            {{ simulator.audioEnabled.value ? 'Active' : 'Ignite' }}
          </button>
        </div>
      </aside>

      <!-- ── 1. HOME VIEW: FUSED AVANT-GARDE COCKPIT ── -->
      <div v-if="view === 'home'" class="page home-page">
        <!-- Living Kinetic Telemetry Ribbon -->
        <CockpitTelemetry
          :rpm="simulator.vehicle.rpm"
          :gear="simulator.vehicle.gear"
          :speed-kph="simulator.vehicle.speedKph"
          :profile="simulator.vehicle.profile"
          :telemetry-status="simulator.telemetryStatus.value"
          :green-score="simulator.greenScore.points"
          :audio-enabled="simulator.audioEnabled.value"
          :accelerating="simulator.accelerating.value"
          :braking="simulator.braking.value"
          @control="(action, active) => simulator.setControl(action, active)"
          @shift="(delta) => simulator.shift(delta)"
          @reset="simulator.reset()"
        />

        <div class="home-deck">
          <div class="home-left">
            <section class="welcome">
              <h1>{{ greeting }},<br /><em>where shall we go?</em></h1>
              <form class="destination" @submit.prevent="openGoogleDirections()">
                <svg><use href="#i-search" /></svg>
                <input
                  v-model="destinationQuery"
                  autocomplete="off"
                  enterkeyhint="go"
                  placeholder="Search destination or place"
                  aria-label="Search destination"
                />
                <button type="submit">GO</button>
              </form>
            </section>

            <section class="media-card card" aria-label="Now playing media">
              <div class="album">NO.<br />07</div>
              <div class="track">
                <span>NOW PLAYING · {{ audioSource.toUpperCase() }}</span>
                <h2>Midnight City</h2>
                <p>M83 · Hurry Up, We're Dreaming</p>
                <i class="progress"></i>
              </div>
              <div class="controls">
                <button type="button" aria-label="Previous track" @click="showNotice('Track: Midnight City')">
                  <svg><use href="#i-back" /></svg>
                </button>
                <button class="play" :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
                  <i v-if="playing"></i><svg v-else><use href="#i-play" /></svg>
                </button>
                <button type="button" aria-label="Next track" @click="showNotice('Track: Outro')">
                  <svg><use href="#i-next" /></svg>
                </button>
              </div>
            </section>
          </div>

          <section class="map-card" aria-label="Google Maps preview">
            <GoogleMap compact @open-navigation="view = 'navigate'" />
            <div class="map-caption">
              <strong>Open full navigation</strong>
            </div>
          </section>
        </div>
      </div>

      <!-- ── 2. GAUGES VIEW: DEDICATED FULL-SCREEN COCKPIT CLUSTER ── -->
      <div v-else-if="view === 'gauges'" class="page gauges-page">
        <div class="page-title">
          <div>
            <p class="eyebrow">COCKPIT INSTRUMENTATION</p>
            <h1>Gauges Cluster</h1>
          </div>
          <button class="power-button" :class="{ on: simulator.audioEnabled.value }" @click="toggleEngine">
            <i></i>{{ simulator.audioEnabled.value ? "Running" : "Start ignition" }}
          </button>
        </div>

        <InstrumentDashboard
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
      </div>

      <!-- ── 3. SOUND LAB VIEW: ELEVATED ACOUSTIC STUDIO ── -->
      <div v-else-if="view === 'engine'" class="page engine-page">
        <div class="page-title">
          <div>
            <p class="eyebrow">ACOUSTIC COCKPIT</p>
            <h1>Sound Lab</h1>
          </div>
          <button class="power-button" :class="{ on: simulator.audioEnabled.value }" @click="toggleEngine">
            <i></i>{{ simulator.audioEnabled.value ? "Running" : "Start ignition" }}
          </button>
        </div>

        <div class="sound-rack-section">
          <p class="eyebrow">VEHICLE ACOUSTIC CHARACTER</p>
          <SoundProfileCard
            :profiles="simulator.profiles"
            :active-profile-id="simulator.vehicle.profile.id"
            @select="(id) => simulator.selectProfile(id)"
          />
        </div>

        <div class="engine-layout">
          <!-- Left Hero: Dynamic Orbit & Harmonic Spectrum Wave -->
          <section class="engine-hero card">
            <div class="engine-orbit" :class="{ 'engine-orbit--on': simulator.audioEnabled.value }">
              <span>{{ simulator.vehicle.gear > 0 ? simulator.vehicle.gear : "N" }}</span>
            </div>
            <p>{{ simulator.vehicle.profile.name }}</p>
            <strong>{{ Math.round(simulator.vehicle.rpm).toLocaleString() }}</strong>
            <small>RPM</small>

            <HarmonicVisualizer
              :rpm="simulator.vehicle.rpm"
              :profile="simulator.vehicle.profile"
              :audio-enabled="simulator.audioEnabled.value"
            />
          </section>

          <!-- Right Controls: Engine Output, Soundstage, Ducking -->
          <div class="engine-controls">
            <section class="control-card card">
              <div>
                <p class="eyebrow">ENGINE OUTPUT</p>
                <h2>
                  {{ effectiveEngineVolume }}%
                  <small v-if="playing && duckEngine">ducked from {{ engineVolume }}%</small>
                </h2>
              </div>
              <input v-model="engineVolume" type="range" min="0" max="100" aria-label="Engine sound level" />
            </section>

            <!-- Elevated Sculptural Acoustic Blueprint -->
            <section class="control-card card speaker-card">
              <div>
                <p class="eyebrow">ACOUSTIC SOUNDSTAGE BLUEPRINT</p>
              </div>
              <div class="zone-picker" role="group" aria-label="Engine speaker zone">
                <button
                  v-for="zone in ['front', 'rear', 'all']"
                  :key="zone"
                  :class="{ active: engineZone === zone }"
                  @click="engineZone = zone"
                >
                  {{ zone }}
                </button>
              </div>

              <!-- Sculptural SVG Soundstage Map -->
              <div class="soundstage-canvas-wrap">
                <svg viewBox="0 0 220 130" class="soundstage-svg" aria-label="Acoustic speaker map">
                  <path d="M 60 22 C 80 18, 140 18, 160 22 C 175 28, 185 45, 185 65 C 185 85, 175 102, 160 108 C 140 112, 80 112, 60 108 C 45 102, 35 85, 35 65 C 35 45, 45 28, 60 22 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(241, 239, 232, 0.2)" stroke-width="1.4" />
                  <path d="M 75 36 C 95 32, 125 32, 145 36 C 155 42, 155 88, 145 94 C 125 98, 95 98, 75 94 C 65 88, 65 42, 75 36 Z" fill="rgba(21, 26, 23, 0.65)" stroke="rgba(241, 239, 232, 0.12)" stroke-width="1" />
                  <line x1="110" y1="32" x2="110" y2="98" stroke="rgba(241,239,232,0.12)" stroke-dasharray="2 2" />

                  <!-- Front Waves -->
                  <g v-if="engineZone === 'front' || engineZone === 'all'">
                    <circle cx="85" cy="42" r="12" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" class="acoustic-wave" />
                    <circle cx="85" cy="42" r="20" fill="none" stroke="var(--acid)" stroke-width="1" opacity="0.3" class="acoustic-wave" />
                    <circle cx="85" cy="88" r="12" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" class="acoustic-wave" />
                    <circle cx="85" cy="88" r="20" fill="none" stroke="var(--acid)" stroke-width="1" opacity="0.3" class="acoustic-wave" />
                  </g>

                  <!-- Rear Waves -->
                  <g v-if="engineZone === 'rear' || engineZone === 'all'">
                    <circle cx="138" cy="42" r="12" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" class="acoustic-wave" />
                    <circle cx="138" cy="42" r="20" fill="none" stroke="var(--acid)" stroke-width="1" opacity="0.3" class="acoustic-wave" />
                    <circle cx="138" cy="88" r="12" fill="none" stroke="var(--acid)" stroke-width="1.2" opacity="0.6" class="acoustic-wave" />
                    <circle cx="138" cy="88" r="20" fill="none" stroke="var(--acid)" stroke-width="1" opacity="0.3" class="acoustic-wave" />
                  </g>

                  <!-- Speaker Nodes -->
                  <circle cx="85" cy="42" r="4.5" :fill="engineZone === 'front' || engineZone === 'all' ? 'var(--acid)' : '#505852'" />
                  <circle cx="85" cy="88" r="4.5" :fill="engineZone === 'front' || engineZone === 'all' ? 'var(--acid)' : '#505852'" />
                  <circle cx="138" cy="42" r="4.5" :fill="engineZone === 'rear' || engineZone === 'all' ? 'var(--acid)' : '#505852'" />
                  <circle cx="138" cy="88" r="4.5" :fill="engineZone === 'rear' || engineZone === 'all' ? 'var(--acid)' : '#505852'" />

                  <text x="46" y="68" fill="var(--muted)" font-size="7" font-weight="700" letter-spacing="1">FRONT</text>
                  <text x="168" y="68" fill="var(--muted)" font-size="7" font-weight="700" letter-spacing="1">REAR</text>
                </svg>
              </div>
            </section>

            <section class="control-card card duck-card">
              <div>
                <p class="eyebrow">ACOUSTIC DUCKING</p>
                <h2>Reduce engine when music plays</h2>
              </div>
              <button
                class="switch"
                :class="{ on: duckEngine }"
                :aria-pressed="duckEngine"
                aria-label="Toggle engine ducking"
                @click="duckEngine = !duckEngine"
              >
                <i></i>
              </button>
              <input
                v-model="duckAmount"
                type="range"
                min="10"
                max="80"
                aria-label="Engine reduction while music plays"
              />
              <small>Reduce engine by {{ duckAmount }}%</small>
            </section>
          </div>
        </div>
      </div>

      <!-- ── 4. MEDIA VIEW: NOW PLAYING STUDIO ── -->
      <div v-else-if="view === 'media'" class="page media-page">
        <div class="page-title">
          <div>
            <p class="eyebrow">NOW PLAYING</p>
            <h1>Media Studio</h1>
          </div>
          <div class="source-pills">
            <button
              v-for="src in ['Bluetooth', 'FM Radio', 'Soundstage']"
              :key="src"
              type="button"
              class="source-pill"
              :class="{ active: audioSource === src }"
              @click="audioSource = src as any"
            >
              {{ src }}
            </button>
          </div>
        </div>

        <div class="media-stage-deck">
          <div class="album album-large">NO.<br />07</div>
          <div class="media-info">
            <span class="eyebrow">{{ audioSource.toUpperCase() }} AUDIO · STEREO</span>
            <h2>Midnight City</h2>
            <p>M83 · Hurry Up, We're Dreaming</p>
            <i class="wide-progress"></i>

            <div class="big-controls">
              <button type="button" aria-label="Previous" @click="showNotice('Track: Midnight City')">
                <svg><use href="#i-back" /></svg>
              </button>
              <button
                type="button"
                class="play"
                :aria-label="playing ? 'Pause' : 'Play'"
                @click="playing = !playing"
              >
                <i v-if="playing"></i><svg v-else><use href="#i-play" /></svg>
              </button>
              <button type="button" aria-label="Next" @click="showNotice('Track: Outro')">
                <svg><use href="#i-next" /></svg>
              </button>
            </div>

            <div class="ducking-indicator" :class="{ active: duckEngine && playing }">
              <svg><use href="#i-car" /></svg>
              <span>Engine ducking {{ duckEngine ? `active (-${duckAmount}%)` : 'off' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── 5. NAVIGATE VIEW: DETAILED GOOGLE MAPS ── -->
      <div v-else-if="view === 'navigate'" class="page nav-page">
        <div class="full-map">
          <GoogleMap />
        </div>
        <section class="nav-sheet">
          <p class="eyebrow">NAVIGATION</p>
          <h1>Find a place</h1>
          <form class="destination" @submit.prevent="openGoogleDirections()">
            <svg><use href="#i-search" /></svg>
            <input
              v-model="destinationQuery"
              autocomplete="off"
              enterkeyhint="go"
              placeholder="Search destination"
              aria-label="Destination"
            />
            <button type="submit">GO</button>
          </form>

          <!-- Smart Quick Category Pills -->
          <div class="quick-nav-pills">
            <button type="button" class="nav-pill" @click="openGoogleDirections('Petrol Pump / EV Charger')">⛽ Fuel / EV</button>
            <button type="button" class="nav-pill" @click="openGoogleDirections('Parking')">🅿️ Parking</button>
            <button type="button" class="nav-pill" @click="openGoogleDirections('Coffee')">☕ Coffee</button>
          </div>

          <button type="button" @click="openGoogleDirections('Home')">
            <strong>Home</strong><small>Saved place · Open in Google Maps</small>
          </button>
          <button type="button" @click="openGoogleDirections('Work')">
            <strong>Work</strong><small>Recent · Open in Google Maps</small>
          </button>
        </section>
      </div>

      <!-- ── 6. ALL APPS VIEW: SYSTEM DRAWER (DE-DUPLICATED) ── -->
      <div v-else-if="view === 'apps'" class="page apps-page">
        <div class="page-title">
          <div>
            <p class="eyebrow">APPLICATIONS & UTILITIES</p>
            <h1>Automotive Apps</h1>
          </div>
          <label>
            <svg><use href="#i-search" /></svg>
            <input v-model="appSearch" placeholder="Search apps" aria-label="Search apps" />
          </label>
        </div>
        <div class="app-grid">
          <button
            v-for="app in filteredApps"
            :key="app[0]"
            type="button"
            class="app"
            :class="app[2]"
            @click="openApp(app[3])"
          >
            <i><svg><use :href="`#i-${app[1]}`" /></svg></i>
            <strong>{{ app[0] }}</strong>
          </button>
        </div>
      </div>

      <!-- ── 7. SETTINGS VIEW ── -->
      <div v-else class="page settings-page">
        <div class="page-title">
          <div>
            <p class="eyebrow">SYSTEM PREFERENCES</p>
            <h1>Settings</h1>
          </div>
        </div>
        <div class="settings-grid">
          <section>
            <i class="mint"><svg><use href="#i-sun" /></svg></i>
            <div>
              <h2>Display</h2>
              <p>Brightness · {{ brightness }}%</p>
              <input v-model="brightness" type="range" min="10" max="100" aria-label="Brightness" />
            </div>
          </section>

          <section class="scale-setting">
            <i class="coral"><span class="type-icon">Aa</span></i>
            <div>
              <h2>Interface size</h2>
              <p>{{ uiScale }}% · Variable screen density</p>
              <input v-model="uiScale" type="range" min="100" max="130" step="5" aria-label="Interface size" />
              <div class="scale-labels"><span>Standard</span><span>130% Large</span></div>
            </div>
          </section>

          <section>
            <i class="violet"><svg><use href="#i-bluetooth" /></svg></i>
            <div>
              <h2>Bluetooth</h2>
              <p>{{ simulator.bluetoothDeviceName.value || simulator.bluetoothStatus.value }}</p>
              <button type="button" @click="simulator.connectBluetooth()">Connect</button>
            </div>
          </section>
        </div>
        <p class="note">Car Sound Launcher · 1024 × 600 landscape automotive standard</p>
      </div>

      <!-- ── REVERSE CAMERA HUD MODAL ── -->
      <div v-if="cameraActive" class="camera-modal" role="dialog" aria-label="Rear parking camera">
        <div class="camera-stream">
          <!-- Top Telemetry Header -->
          <div class="cam-telemetry-header">
            <div class="radar-tag">
              <span class="radar-pulse"></span>
              <strong>PARK ASSIST: RADAR ACTIVE</strong>
            </div>
            <span class="distance-metric">DISTANCE: 1.2M · ZONE CLEAR</span>
          </div>

          <!-- Dynamic Parking Sensor Guidelines -->
          <div class="guidelines">
            <div class="traj-line left-traj"></div>
            <div class="traj-line right-traj"></div>
            <div class="guide-bars">
              <span class="guide green-guide"></span>
              <span class="guide yellow-guide"></span>
              <span class="guide red-guide"></span>
            </div>
          </div>

          <p class="camera-status">REVERSE CAMERA ACTIVE · CHECK SURROUNDINGS BEFORE MOVING</p>
          <button type="button" class="close-camera" @click="cameraActive = false">DISMISS CAMERA</button>
        </div>
      </div>

      <!-- ── VEHICLE DIAGNOSTICS MODAL ── -->
      <div v-if="diagnosticsActive" class="diagnostics-modal" role="dialog" aria-label="Vehicle Diagnostics">
        <div class="diag-card card">
          <div class="diag-header">
            <div>
              <p class="eyebrow">TELEMETRY & OBD-II DIAGNOSTICS</p>
              <h2>Vehicle Systems Inspector</h2>
            </div>
            <button type="button" class="quick-close" aria-label="Close" @click="diagnosticsActive = false">✕</button>
          </div>
          <div class="diag-grid">
            <div class="diag-item">
              <span>ACTIVE PROFILE</span>
              <strong>{{ simulator.vehicle.profile.name }}</strong>
            </div>
            <div class="diag-item">
              <span>ENGINE RPM</span>
              <strong>{{ Math.round(simulator.vehicle.rpm) }} RPM</strong>
            </div>
            <div class="diag-item">
              <span>VEHICLE SPEED</span>
              <strong>{{ Math.round(simulator.vehicle.speedKph) }} KM/H ({{ simulator.telemetryStatus.value.toUpperCase() }})</strong>
            </div>
            <div class="diag-item">
              <span>THROTTLE / BRAKE</span>
              <strong>{{ Math.round(simulator.vehicle.throttle * 100) }}% / {{ Math.round(simulator.vehicle.brake * 100) }}%</strong>
            </div>
            <div class="diag-item">
              <span>GREEN ECO SCORE</span>
              <strong>{{ simulator.greenScore.points }}/100</strong>
            </div>
            <div class="diag-item">
              <span>PENALTIES (HARSH DRIVING)</span>
              <small>Brake: {{ simulator.greenScore.penalties.harshBrake.toFixed(1) }} | RPM: {{ simulator.greenScore.penalties.highRpm.toFixed(1) }} | Throttle: {{ simulator.greenScore.penalties.harshThrottle.toFixed(1) }}</small>
            </div>
            <div class="diag-item">
              <span>AUDIO ENGINE STATUS</span>
              <strong>{{ simulator.audioStatus.value.toUpperCase() }} (Sample Rate 44.1kHz)</strong>
            </div>
            <div class="diag-item">
              <span>BLUETOOTH GATT</span>
              <strong>{{ simulator.bluetoothDeviceName.value || simulator.bluetoothStatus.value.toUpperCase() }}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
