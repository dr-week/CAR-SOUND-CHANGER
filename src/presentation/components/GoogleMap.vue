<script setup lang="ts">
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { computed, onMounted, ref } from "vue";
import { mapDarkStyle } from "./map/mapDarkStyle";

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const emit = defineEmits<{ openNavigation: [] }>();
const mapElement = ref<HTMLElement>();
const status = ref<"loading" | "ready" | "unconfigured" | "error">("loading");
const locating = ref(false);
const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim();
const statusLabel = computed(
  () =>
    ({ loading: "Loading map", ready: "Live Google map", unconfigured: "Offline map", error: "Map unavailable" })[
      status.value
    ],
);
let map: google.maps.Map | undefined;
let marker: google.maps.Marker | undefined;
let MarkerClass: typeof google.maps.Marker | undefined;

async function initialiseMap() {
  if (!mapsKey || !mapElement.value) {
    status.value = "unconfigured";
    return;
  }
  try {
    setOptions({ key: mapsKey, v: "weekly", language: "en", region: "IN" });
    const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
    const { Marker } = (await importLibrary("marker")) as google.maps.MarkerLibrary;
    MarkerClass = Marker;
    const center = { lat: 28.5562, lng: 77.1 };
    map = new Map(mapElement.value, {
      center,
      zoom: props.compact ? 13 : 14,
      mapId: mapId || undefined,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: props.compact ? "none" : "greedy",
      keyboardShortcuts: false,
      styles: mapId ? undefined : mapDarkStyle,
    });
    status.value = "ready";
    locate(false);
  } catch {
    status.value = "error";
  }
}

function locate(announce = true) {
  if (!navigator.geolocation || !map) return;
  locating.value = announce;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const position = { lat: coords.latitude, lng: coords.longitude };
      map?.panTo(position);
      map?.setZoom(15);
      if (marker) {
        marker.setPosition(position);
      } else if (MarkerClass) {
        marker = new MarkerClass({ map, position, title: "Current position" });
      }
      locating.value = false;
    },
    () => {
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 },
  );
}

onMounted(initialiseMap);
</script>

<template>
  <div class="google-map" :class="{ compact }">
    <div ref="mapElement" class="google-map__canvas"></div>
    <div v-if="status !== 'ready'" class="google-map__fallback" aria-live="polite">
      <i class="fallback-road road-a"></i><i class="fallback-road road-b"></i><i class="fallback-road road-c"></i>
      <span class="fallback-pin"></span>

      <!-- Compass & Navigation HUD Overlay -->
      <div v-if="compact" class="compact-compass-hud">
        <div class="compass-badge">
          <svg viewBox="0 0 24 24" class="compass-icon">
            <circle cx="12" cy="12" r="10" stroke="rgba(217, 255, 120, 0.3)" stroke-width="1.2" fill="none" />
            <polygon points="12,4 15,12 12,10 9,12" fill="var(--acid)" />
            <polygon points="12,20 15,12 12,14 9,12" fill="var(--muted)" />
          </svg>
          <div class="compass-text">
            <strong>{{ locating ? 'LOCATING...' : status === 'unconfigured' ? 'OFFLINE PREVIEW' : 'GPS STANDBY' }}</strong>
            <small>NAVIGATION</small>
          </div>
        </div>
      </div>
    </div>
    <span class="map-provider" :class="status">{{ statusLabel }}</span>
    <button
      v-if="!compact && status === 'ready'"
      class="locate-button"
      type="button"
      :aria-label="locating ? 'Finding location' : 'Show my location'"
      @click="locate()"
    >
      <span></span>{{ locating ? "Locating" : "My location" }}
    </button>
    <button
      v-if="compact"
      class="map-hit-area"
      type="button"
      aria-label="Open navigation"
      @click="emit('openNavigation')"
    ></button>
  </div>
</template>

<style scoped src="./map/googleMap.css"></style>
