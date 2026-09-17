<script setup lang="ts">
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { computed, onMounted, ref } from "vue";

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

async function initialiseMap() {
  if (!mapsKey || !mapElement.value) {
    status.value = "unconfigured";
    return;
  }
  try {
    setOptions({ key: mapsKey, v: "weekly", language: "en", region: "IN" });
    const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
    const { Marker } = (await importLibrary("marker")) as google.maps.MarkerLibrary;
    const center = { lat: 28.5562, lng: 77.1 };
    map = new Map(mapElement.value, {
      center,
      zoom: props.compact ? 13 : 14,
      mapId: mapId || undefined,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: props.compact ? "none" : "greedy",
      keyboardShortcuts: false,
      styles: mapId ? undefined : mapStyle,
    });
    marker = new Marker({ map, position: center, title: "Current position" });
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
      marker?.setPosition(position);
      locating.value = false;
    },
    () => {
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 },
  );
}

const mapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#d1cfc0" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#596058" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#d1cfc0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f1e5" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fffdf4" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8beb7" }] },
];

onMounted(initialiseMap);
</script>

<template>
  <div class="google-map" :class="{ compact }">
    <div ref="mapElement" class="google-map__canvas"></div>
    <div v-if="status !== 'ready'" class="google-map__fallback" aria-live="polite">
      <i class="fallback-road road-a"></i><i class="fallback-road road-b"></i><i class="fallback-road road-c"></i>
      <span class="fallback-pin"></span>
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

<style scoped>
.google-map,
.google-map__canvas,
.google-map__fallback {
  position: absolute;
  inset: 0;
}
.google-map {
  overflow: hidden;
  background: #cfccbd;
}
.google-map__canvas {
  z-index: 1;
}
.google-map__fallback {
  background-color: #c9c6b5;
  background-image:
    linear-gradient(25deg, transparent 48%, rgba(95, 98, 86, 0.13) 49% 51%, transparent 52%),
    linear-gradient(115deg, transparent 48%, rgba(95, 98, 86, 0.1) 49% 51%, transparent 52%);
}
.fallback-road {
  position: absolute;
  height: 12px;
  width: 130%;
  left: -15%;
  top: 46%;
  border-radius: 99px;
  background: #f5f1e4;
  box-shadow: 0 0 0 1px rgba(70, 75, 65, 0.12);
}
.road-a {
  transform: rotate(-18deg);
}
.road-b {
  transform: rotate(58deg);
  top: 22%;
  left: 20%;
  height: 9px;
}
.road-c {
  transform: rotate(40deg);
  top: 70%;
  height: 7px;
}
.fallback-pin {
  position: absolute;
  left: 54%;
  top: 42%;
  width: 18px;
  height: 18px;
  border: 4px solid white;
  border-radius: 50%;
  background: #283327;
  box-shadow: 0 0 0 11px rgba(217, 255, 120, 0.35);
}
.map-provider {
  position: absolute;
  z-index: 3;
  left: 18px;
  top: 16px;
  padding: 7px 10px;
  border-radius: 99px;
  background: rgba(15, 19, 16, 0.76);
  color: #eef0e9;
  font: 600 10px Manrope;
  letter-spacing: 0.03em;
  backdrop-filter: blur(10px);
}
.map-provider.ready::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #d9ff78;
}
.locate-button {
  position: absolute;
  z-index: 4;
  right: 18px;
  bottom: 20px;
  min-height: 48px;
  padding: 0 16px;
  border: 0;
  border-radius: 15px;
  background: #121713;
  color: #f1efe8;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 700;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
.locate-button span {
  width: 9px;
  height: 9px;
  border: 2px solid #d9ff78;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(217, 255, 120, 0.15);
}
.map-hit-area {
  position: absolute;
  z-index: 4;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
}
.compact .map-provider {
  display: none;
}
.compact :deep(.gm-style-cc),
.compact :deep(.gmnoprint) {
  display: none;
}
</style>
