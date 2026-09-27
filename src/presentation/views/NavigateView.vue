<script setup lang="ts">
import { ref } from "vue";
import GoogleMapEmbed from "../components/GoogleMapEmbed.vue";

const props = defineProps<{
  destinationQuery: string;
}>();

const emit = defineEmits<{
  "update:destinationQuery": [val: string];
  "navigate": [destination?: string];
}>();

const localQuery = ref(props.destinationQuery || "");

function submitSearch(query = localQuery.value) {
  const target = query.trim();
  localQuery.value = target;
  emit("update:destinationQuery", target);
}

function selectDestination(dest: string) {
  submitSearch(dest);
  emit("navigate", dest);
}
</script>

<template>
  <div class="page nav-page">
    <div class="nav-map-wrap">
      <GoogleMapEmbed :query="localQuery || destinationQuery" />
    </div>

    <aside class="nav-hud-card">
      <div class="nav-hud-header">
        <div class="nav-brand-badge">
          <svg width="14" height="14"><use href="#i-nav" /></svg>
          <span>GOOGLE MAPS</span>
        </div>
      </div>

      <form class="nav-search-box" @submit.prevent="submitSearch()">
        <svg><use href="#i-search" /></svg>
        <input
          v-model="localQuery"
          type="text"
          class="nav-search-input"
          placeholder="Search destination in Google Maps..."
          aria-label="Destination"
        />
        <button type="submit" class="nav-search-btn">FIND</button>
      </form>

      <div class="nav-pills-row">
        <button type="button" class="nav-cat-pill" @click="selectDestination('Petrol Pump / EV Charger')">
          <svg><use href="#i-fuel" /></svg>
          <span>Fuel / EV</span>
        </button>
        <button type="button" class="nav-cat-pill" @click="selectDestination('Parking')">
          <svg><use href="#i-parking" /></svg>
          <span>Parking</span>
        </button>
        <button type="button" class="nav-cat-pill" @click="selectDestination('Coffee')">
          <svg><use href="#i-coffee" /></svg>
          <span>Coffee</span>
        </button>
      </div>

      <div class="nav-saved-places">
        <div class="saved-place-item" role="button" tabindex="0" @click="selectDestination('Home')">
          <div class="saved-place-meta">
            <strong>Home</strong>
            <small>Navigate via Google Maps</small>
          </div>
          <svg width="16" height="16" color="var(--acid)"><use href="#i-nav" /></svg>
        </div>

        <div class="saved-place-item" role="button" tabindex="0" @click="selectDestination('Work')">
          <div class="saved-place-meta">
            <strong>Work</strong>
            <small>Navigate via Google Maps</small>
          </div>
          <svg width="16" height="16" color="var(--acid)"><use href="#i-nav" /></svg>
        </div>
      </div>

      <button type="button" class="nav-start-btn" @click="emit('navigate', localQuery || destinationQuery)">
        <svg width="16" height="16"><use href="#i-nav" /></svg>
        <span>Start Navigation in Google Maps</span>
      </button>
    </aside>
  </div>
</template>

<style scoped src="./navigation/navigateView.css"></style>
