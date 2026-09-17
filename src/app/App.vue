<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useVehicleSimulator } from "../application/composables/useVehicleSimulator";
import GoogleMap from "../presentation/components/GoogleMap.vue";

type View = "home" | "media" | "navigate" | "apps" | "engine" | "settings";
const simulator = useVehicleSimulator();
const view = ref<View>("home");
const now = ref(new Date());
const playing = ref(true);
const brightness = ref(74);
const quickOpen = ref(false);
const appSearch = ref("");
const destinationQuery = ref("");
const uiScale = ref(Number(localStorage.getItem("launcher-ui-scale") || 110));
const engineVolume = ref(Number(localStorage.getItem("engine-volume") || 62));
const engineZone = ref(localStorage.getItem("engine-zone") || "rear");
const duckEngine = ref(localStorage.getItem("engine-duck") !== "false");
const duckAmount = ref(Number(localStorage.getItem("engine-duck-amount") || 38));
let clock: number | undefined;

const nav = [
  { id: "media", label: "Media", icon: "music" },
  { id: "navigate", label: "Navigate", icon: "nav" },
  { id: "apps", label: "All apps", icon: "grid" },
] as const;
const apps = [
  ["Phone", "phone", "blue"],
  ["Radio", "radio", "amber"],
  ["Bluetooth", "bluetooth", "violet"],
  ["Engine", "car", "silver"],
  ["Camera", "camera", "green"],
] as const;

const time = computed(() =>
  now.value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
);
const date = computed(() => now.value.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }));
const greeting = computed(() =>
  now.value.getHours() < 12 ? "Good morning" : now.value.getHours() < 18 ? "Good afternoon" : "Good evening",
);
const filteredApps = computed(() => apps.filter((app) => app[0].toLowerCase().includes(appSearch.value.toLowerCase())));
const effectiveEngineVolume = computed(() =>
  playing.value && duckEngine.value
    ? Math.round(engineVolume.value * (1 - duckAmount.value / 100))
    : engineVolume.value,
);
const launcherStyle = computed(() => ({ "--ui-scale": `${uiScale.value / 100}` }));
const notice = ref<string | null>(null);
let noticeTimer: number | undefined;

function showNotice(msg: string) {
  notice.value = msg;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    if (notice.value === msg) notice.value = null;
  }, 3500);
}

function openApp(name: string) {
  if (name === "Engine") {
    view.value = "engine";
  } else if (name === "Radio") {
    view.value = "media";
  } else if (name === "Bluetooth") {
    view.value = "settings";
    simulator.connectBluetooth();
  } else if (name === "Camera") {
    showNotice("Reverse Camera: Requires native Android video-in / reverse gear trigger.");
  } else if (name === "Phone") {
    showNotice("Phone: Connect Bluetooth to make hands-free calls.");
  }
}

async function toggleEngine() {
  await simulator.enableAudio();
  if (simulator.audioEnabled.value) {
    simulator.setGps(true);
  } else {
    simulator.setGps(false);
  }
}

function toggleGps() {
  simulator.setGps(!simulator.gpsEnabled.value);
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
});
onBeforeUnmount(() => window.clearInterval(clock));
</script>

<template>
  <main class="launcher" :style="launcherStyle">
    <svg class="symbols" aria-hidden="true">
      <symbol id="i-home" viewBox="0 0 24 24">
        <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
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

    <aside class="rail">
      <button class="brand" :class="{ active: view === 'home' }" aria-label="Home" @click="view = 'home'">m</button>
      <nav>
        <button
          v-for="item in nav"
          :key="item.id"
          class="rail-button"
          :class="{ active: view === item.id }"
          :aria-label="item.label"
          @click="view = item.id"
        >
          <svg><use :href="`#i-${item.icon}`" /></svg><span>{{ item.label }}</span>
        </button>
      </nav>
      <button
        class="rail-button settings-link"
        :class="{ active: view === 'settings' }"
        aria-label="Settings"
        @click="view = 'settings'"
      >
        <svg><use href="#i-settings" /></svg><span>Settings</span>
      </button>
    </aside>

    <section class="stage">
      <header class="statusbar">
        <div class="ready"><i></i><span class="sr-only">System ready</span>18°C</div>
        <button class="clock" @click="quickOpen = !quickOpen">
          <strong>{{ time }}</strong
          ><small>{{ date }}</small>
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
          <b class="battery">84</b>
        </div>
      </header>

      <aside v-if="quickOpen" class="quick-panel">
        <p class="eyebrow">QUICK CONTROLS</p>
        <label
          ><svg><use href="#i-sun" /></svg
          ><input v-model="brightness" type="range" min="10" max="100" aria-label="Brightness"
        /></label>
        <label
          ><svg><use href="#i-volume" /></svg
          ><input v-model="engineVolume" type="range" min="0" max="100" aria-label="Volume"
        /></label>
      </aside>

      <div v-if="view === 'home'" class="page home-page">
        <section class="welcome">
          <h1>{{ greeting }},<br /><em>where shall we go?</em></h1>
          <form class="destination" @submit.prevent="openGoogleDirections()">
            <svg><use href="#i-search" /></svg>
            <input
              v-model="destinationQuery"
              autocomplete="off"
              enterkeyhint="go"
              placeholder="Search a destination"
              aria-label="Search a destination"
              @focus="view = 'navigate'"
            />
            <button type="submit">GO</button>
          </form>
        </section>
        <section class="map-card" aria-label="Google Maps preview">
          <GoogleMap compact @open-navigation="view = 'navigate'" />
          <div class="map-caption"><strong>Open map</strong></div>
        </section>
        <section class="media-card card">
          <div class="album">NO.<br />07</div>
          <div class="track">
            <span>NOW PLAYING · BLUETOOTH</span>
            <h2>Midnight City</h2>
            <p>M83 · Hurry Up, We're Dreaming</p>
            <i class="progress"></i>
          </div>
          <div class="controls">
            <button aria-label="Previous">
              <svg><use href="#i-back" /></svg></button
            ><button class="play" :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing">
              <i v-if="playing"></i><svg v-else><use href="#i-play" /></svg></button
            ><button aria-label="Next">
              <svg><use href="#i-next" /></svg>
            </button>
          </div>
        </section>
      </div>

      <div v-else-if="view === 'apps'" class="page apps-page">
        <div class="page-title">
          <div>
            <h1>All apps</h1>
          </div>
          <label
            ><svg><use href="#i-search" /></svg
            ><input v-model="appSearch" placeholder="Search apps" aria-label="Search apps"
          /></label>
        </div>
        <div class="app-grid">
          <button v-for="app in filteredApps" :key="app[0]" class="app" :class="app[2]" @click="openApp(app[0])">
            <i
              ><svg><use :href="`#i-${app[1]}`" /></svg></i
            ><strong>{{ app[0] }}</strong>
          </button>
        </div>
      </div>

      <div v-else-if="view === 'media'" class="page media-page">
        <p class="eyebrow">NOW PLAYING · BLUETOOTH</p>
        <div class="album album-large">NO.<br />07</div>
        <h1>Midnight City</h1>
        <p>M83 · Hurry Up, We're Dreaming</p>
        <i class="wide-progress"></i>
        <div class="big-controls">
          <button type="button" aria-label="Previous track" @click="showNotice('Track: Midnight City')">
            <svg><use href="#i-back" /></svg></button
          ><button
            type="button"
            class="play"
            :aria-label="playing ? 'Pause' : 'Play'"
            @click="playing = !playing"
          >
            <i v-if="playing"></i><svg v-else><use href="#i-play" /></svg></button
          ><button type="button" aria-label="Next track" @click="showNotice('Next track requested')">
            <svg><use href="#i-next" /></svg>
          </button>
        </div>
      </div>

      <div v-else-if="view === 'navigate'" class="page nav-page">
        <div class="full-map">
          <GoogleMap />
        </div>
        <section class="nav-sheet">
          <p class="eyebrow">WHERE TO?</p>
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
          <button @click="openGoogleDirections('Home')">
            <strong>Home</strong><small>Saved place · Open in Google Maps</small>
          </button>
          <button @click="openGoogleDirections('Work')">
            <strong>Work</strong><small>Recent · Open in Google Maps</small>
          </button>
        </section>
      </div>

      <div v-else-if="view === 'engine'" class="page engine-page">
        <div class="page-title">
          <div>
            <h1>Engine sound</h1>
          </div>
          <button class="power-button" :class="{ on: simulator.audioEnabled.value }" @click="toggleEngine">
            <i></i>{{ simulator.audioEnabled.value ? "Running" : "Start engine" }}
          </button>
        </div>
        <div class="engine-layout">
          <section class="engine-hero card">
            <div class="engine-orbit">
              <span>{{ simulator.vehicle.gear || "N" }}</span>
            </div>
            <p>{{ simulator.vehicle.profile.name }}</p>
            <strong>{{ Math.round(simulator.vehicle.rpm).toLocaleString() }}</strong
            ><small>RPM</small>
            <div class="speed-stat">
              <strong>{{ Math.round(simulator.vehicle.speedKph) }}</strong>
              <small>KM/H</small>
            </div>
            <div class="engine-pedals">
              <button
                type="button"
                class="touch-pedal brake"
                :class="{ active: simulator.braking.value }"
                aria-label="Brake"
                @pointerdown.prevent="simulator.setControl('brake', true)"
                @pointerup="simulator.setControl('brake', false)"
                @pointercancel="simulator.setControl('brake', false)"
                @lostpointercapture="simulator.setControl('brake', false)"
              >
                <span>BRAKE</span><small>Hold to stop</small>
              </button>
              <button
                type="button"
                class="touch-pedal gas"
                :class="{ active: simulator.accelerating.value }"
                aria-label="Rev / Accelerate"
                @pointerdown.prevent="simulator.setControl('accelerate', true)"
                @pointerup="simulator.setControl('accelerate', false)"
                @pointercancel="simulator.setControl('accelerate', false)"
                @lostpointercapture="simulator.setControl('accelerate', false)"
              >
                <span>REV / GAS</span><small>Hold to rev</small>
              </button>
            </div>
            <div class="engine-shifts">
              <button type="button" aria-label="Shift down" @click="simulator.shift(-1)">↓ Gear -</button>
              <button type="button" aria-label="Shift up" @click="simulator.shift(1)">↑ Gear +</button>
              <button type="button" aria-label="Reset simulation" @click="simulator.reset()">↺ Reset</button>
            </div>
          </section>
          <div class="engine-controls">
            <section class="control-card card">
              <div>
                <p class="eyebrow">CHARACTER</p>
              </div>
              <select
                :value="simulator.vehicle.profile.id"
                @change="simulator.selectProfile(($event.target as HTMLSelectElement).value)"
              >
                <option v-for="profile in simulator.profiles" :key="profile.id" :value="profile.id">
                  {{ profile.name }}
                </option>
              </select>
            </section>
            <section class="control-card card">
              <div>
                <p class="eyebrow">ENGINE LEVEL</p>
                <h2>
                  {{ effectiveEngineVolume }}%
                  <small v-if="playing && duckEngine">ducked from {{ engineVolume }}%</small>
                </h2>
              </div>
              <input v-model="engineVolume" type="range" min="0" max="100" aria-label="Engine sound level" />
            </section>
            <section class="control-card card speaker-card">
              <div>
                <p class="eyebrow">SPEAKERS</p>
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
              <div class="car-plan" :class="`zone-${engineZone}`">
                <span class="front-left"></span><span class="front-right"></span><i>FRONT</i><b></b
                ><span class="rear-left"></span><span class="rear-right"></span><i>REAR</i>
              </div>
            </section>
            <section class="control-card card duck-card">
              <div>
                <p class="eyebrow">WHEN MUSIC PLAYS</p>
                <h2>Reduce engine</h2>
              </div>
              <button
                class="switch"
                :class="{ on: duckEngine }"
                :aria-pressed="duckEngine"
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

      <div v-else class="page settings-page">
        <div class="page-title">
          <div>
            <h1>Settings</h1>
          </div>
        </div>
        <div class="settings-grid">
          <section>
            <i class="mint"
              ><svg><use href="#i-sun" /></svg
            ></i>
            <div>
              <h2>Display</h2>
              <p>Brightness · {{ brightness }}%</p>
              <input v-model="brightness" type="range" min="10" max="100" />
            </div>
          </section>
          <section class="scale-setting">
            <i class="coral"><span class="type-icon">Aa</span></i>
            <div>
              <h2>Interface size</h2>
              <p>{{ uiScale }}% · Variable screen density</p>
              <input v-model="uiScale" type="range" min="100" max="130" step="5" aria-label="Interface size" />
              <div class="scale-labels"><span>Default</span><span>Largest</span></div>
            </div>
          </section>
          <section>
            <i class="violet"
              ><svg><use href="#i-bluetooth" /></svg
            ></i>
            <div>
              <h2>Bluetooth</h2>
              <p>{{ simulator.bluetoothDeviceName.value ? `Connected: ${simulator.bluetoothDeviceName.value}` : `Status: ${simulator.bluetoothStatus.value}` }}</p>
              <button
                type="button"
                :disabled="!simulator.isBluetoothSupported"
                @click="simulator.bluetoothStatus.value === 'connected' ? simulator.disconnectBluetooth() : simulator.connectBluetooth()"
              >
                {{ simulator.bluetoothStatus.value === 'connected' ? 'Disconnect' : 'Connect / Pair' }}
              </button>
            </div>
          </section>
        </div>
        <p class="note">English · 1024 × 600 landscape</p>
      </div>
    </section>
    <aside v-if="notice" class="toast-banner" role="status">{{ notice }}</aside>
  </main>
</template>
