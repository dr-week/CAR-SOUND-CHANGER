<script setup lang="ts">
import type { VehicleProfile } from "../../domain/vehicle/types";

defineProps<{
  profiles: Record<string, VehicleProfile>;
  activeProfileId: string;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<template>
  <div class="sound-profiles-rack" aria-label="Vehicle acoustic profiles">
    <div class="profiles-scroll">
      <button
        v-for="profile in Object.values(profiles)"
        :key="profile.id"
        type="button"
        class="profile-card"
        :class="{ 'profile-card--active': profile.id === activeProfileId }"
        :aria-pressed="profile.id === activeProfileId"
        @click="emit('select', profile.id)"
      >
        <div class="card-eyebrow">
          <span class="cyl-badge">{{ profile.cylinders }} CYL</span>
          <span v-if="profile.induction" class="ind-badge">{{ profile.induction.toUpperCase() }}</span>
        </div>
        <strong class="profile-name">{{ profile.name }}</strong>
        <div class="card-specs">
          <span>{{ profile.redlineRpm }} RPM</span>
          <span class="dot">·</span>
          <span>{{ profile.topSpeedKph }} KM/H</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sound-profiles-rack {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.profiles-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 4px 2px 8px;
}

.profiles-scroll::-webkit-scrollbar {
  display: none;
}

.profile-card {
  flex: 0 0 200px;
  min-height: 84px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.profile-card:hover {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
}

.profile-card--active {
  background: rgba(217, 255, 120, 0.08) !important;
  border-color: var(--acid) !important;
  box-shadow: 0 0 16px rgba(217, 255, 120, 0.15);
}

.card-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cyl-badge,
.ind-badge {
  font: 700 calc(8px * var(--ui-scale)) var(--mono);
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 6px;
}

.cyl-badge {
  background: rgba(241, 239, 232, 0.08);
  color: var(--ink);
}

.ind-badge {
  background: rgba(231, 191, 118, 0.2);
  color: var(--amber);
}

.profile-name {
  font: 600 calc(12px * var(--ui-scale)) var(--sans);
  color: var(--ink);
  margin: 4px 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-card--active .profile-name {
  color: var(--acid);
}

.card-specs {
  display: flex;
  align-items: center;
  gap: 6px;
  font: 500 calc(9px * var(--ui-scale)) var(--mono);
  color: var(--muted);
}

.dot {
  opacity: 0.5;
}
</style>
