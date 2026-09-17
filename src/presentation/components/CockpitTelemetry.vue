<script setup lang="ts">
import { computed, ref } from "vue";
import type { TelemetryStatus } from "../../application/ports/TelemetryStatus";
import type { DriveAction } from "../../domain/vehicle/controls";
import type { VehicleProfile } from "../../domain/vehicle/types";

const props = defineProps<{
  rpm: number;
  gear: number;
  speedKph: number;
  profile: VehicleProfile;
  telemetryStatus: TelemetryStatus;
  greenScore: number;
  audioEnabled: boolean;
  accelerating: boolean;
  braking: boolean;
}>();

const emit = defineEmits<{
  control: [action: DriveAction, active: boolean];
  shift: [delta: number];
  reset: [];
}>();

const showPedals = ref(false);

const isShiftRecommended = computed(() => {
  return props.profile.shiftRpm > 0 && props.rpm >= props.profile.shiftRpm;
});

const isRedline = computed(() => {
  return props.rpm >= props.profile.redlineRpm;
});

// Tachometer Arc Math: 180-degree sweep (-90 to +90 degrees)
const maxRpm = computed(() => Math.max(8000, props.profile.redlineRpm + 1000));
const rpmFraction = computed(() => Math.min(1, Math.max(0, props.rpm / maxRpm.value)));
const redlineFraction = computed(() => Math.min(1, Math.max(0, props.profile.redlineRpm / maxRpm.value)));

// Polar to Cartesian for SVG Arc
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const backgroundArc = computed(() => describeArc(100, 100, 76, -110, 110));
const currentRpmArc = computed(() => {
  const endAngle = -110 + rpmFraction.value * 220;
  return describeArc(100, 100, 76, -110, endAngle);
});
const redlineArc = computed(() => {
  const startAngle = -110 + redlineFraction.value * 220;
  return describeArc(100, 100, 76, startAngle, 110);
});

// Green score color
const scoreBadgeColor = computed(() => {
  if (props.greenScore >= 80) return "var(--acid)";
  if (props.greenScore >= 50) return "var(--amber)";
  return "var(--red)";
});

function handlePointerPedal(event: PointerEvent, action: DriveAction, active: boolean) {
  if (event.button !== 0) return;
  if (active) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  emit("control", action, active);
}
</script>

<template>
  <div class="cockpit-hud" aria-label="Cockpit telemetry HUD">
    <!-- Top instrument cluster ribbon -->
    <div class="hud-cluster">
      <!-- Speedometer Module -->
      <div class="hud-module speedo-module">
        <span class="hud-label">
          <svg class="icon-gps" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          {{ telemetryStatus === "active" ? "GPS" : "SIM" }} SPEED
        </span>
        <div class="speed-readout">
          <strong>{{ Math.round(speedKph) }}</strong>
          <small>KM/H</small>
        </div>
        <span class="top-speed-note">MAX {{ profile.topSpeedKph }}</span>
      </div>

      <!-- Center Tachometer Arc Module -->
      <div class="hud-module tacho-module">
        <svg viewBox="0 0 200 120" class="tacho-svg" aria-hidden="true">
          <!-- Background track -->
          <path :d="backgroundArc" fill="none" stroke="rgba(241, 239, 232, 0.08)" stroke-width="8" stroke-linecap="round" />
          <!-- Redline zone track -->
          <path :d="redlineArc" fill="none" stroke="rgba(231, 191, 118, 0.28)" stroke-width="8" stroke-linecap="round" />
          <!-- Active RPM arc -->
          <path
            :d="currentRpmArc"
            fill="none"
            :stroke="isRedline ? 'var(--amber)' : 'var(--acid)'"
            stroke-width="8"
            stroke-linecap="round"
            class="rpm-active-arc"
          />
        </svg>

        <div class="tacho-center">
          <span class="hud-label">ENGINE RPM</span>
          <strong class="rpm-number" :class="{ 'rpm-alert': isRedline }">
            {{ Math.round(rpm).toLocaleString() }}
          </strong>
          <small class="profile-tag">{{ profile.name.split(" ")[0] }} · {{ profile.cylinders }}CYL</small>
        </div>
      </div>

      <!-- Gear & Shift Light Module -->
      <div class="hud-module gear-module">
        <span class="hud-label">ENGAGED</span>
        <div class="gear-badge" :class="{ 'shift-glow': isShiftRecommended }">
          <strong class="gear-num">{{ gear > 0 ? gear : "N" }}</strong>
          <span v-if="isShiftRecommended" class="shift-hint">SHIFT ↑</span>
        </div>
        <span class="gear-total">{{ profile.gears }} SPD</span>
      </div>

      <!-- Eco Score & Drive Pad Toggle -->
      <div class="hud-module score-module">
        <span class="hud-label">ECO SCORE</span>
        <div class="score-pill" :style="{ borderColor: scoreBadgeColor }">
          <svg class="eco-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4.5 11-10 11z" />
          </svg>
          <strong :style="{ color: scoreBadgeColor }">{{ greenScore }}</strong>
        </div>
        <button
          type="button"
          class="pedal-toggle"
          :class="{ active: showPedals }"
          aria-label="Toggle virtual pedals"
          @click="showPedals = !showPedals"
        >
          {{ showPedals ? "Hide Pedals" : "Drive Pedals" }}
        </button>
      </div>
    </div>

    <!-- Expandable Virtual Pedals (For Bench / Touch Testing) -->
    <transition name="slide-pedals">
      <div v-if="showPedals" class="pedals-deck">
        <button
          type="button"
          class="pedal-btn brake-btn"
          :class="{ active: braking }"
          @pointerdown.prevent="handlePointerPedal($event, 'brake', true)"
          @pointerup="handlePointerPedal($event, 'brake', false)"
          @pointercancel="handlePointerPedal($event, 'brake', false)"
          @lostpointercapture="handlePointerPedal($event, 'brake', false)"
        >
          <span>BRAKE</span>
          <kbd>S</kbd>
        </button>

        <button
          type="button"
          class="pedal-btn accel-btn"
          :class="{ active: accelerating }"
          @pointerdown.prevent="handlePointerPedal($event, 'accelerate', true)"
          @pointerup="handlePointerPedal($event, 'accelerate', false)"
          @pointercancel="handlePointerPedal($event, 'accelerate', false)"
          @lostpointercapture="handlePointerPedal($event, 'accelerate', false)"
        >
          <span>THROTTLE</span>
          <kbd>W</kbd>
        </button>

        <div class="gear-shifters">
          <button type="button" class="shift-btn" aria-label="Shift down" @click="emit('shift', -1)">-</button>
          <button type="button" class="shift-btn" aria-label="Shift up" @click="emit('shift', 1)">+</button>
          <button type="button" class="reset-btn" aria-label="Reset simulation" @click="emit('reset')">↺</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.cockpit-hud {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--panel-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--panel-border);
  border-radius: 20px;
  padding: 12px 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
}

.hud-cluster {
  display: grid;
  grid-template-columns: 1fr 1.3fr 0.9fr 1fr;
  align-items: center;
  gap: 12px;
}

.hud-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.hud-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font: 500 calc(9px * var(--ui-scale)) var(--mono);
  letter-spacing: 0.12em;
  color: var(--muted);
  text-transform: uppercase;
}

.icon-gps {
  width: 12px;
  height: 12px;
  stroke: var(--acid);
}

.speed-readout {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 2px 0;
}

.speed-readout strong {
  font: 700 calc(36px * var(--ui-scale)) var(--mono);
  color: var(--ink);
  line-height: 1;
}

.speed-readout small {
  font: 600 calc(10px * var(--ui-scale)) var(--mono);
  color: var(--muted);
}

.top-speed-note,
.gear-total {
  font: 500 calc(8.5px * var(--ui-scale)) var(--mono);
  color: #6a746d;
}

/* Tachometer Module */
.tacho-module {
  position: relative;
  height: 90px;
}

.tacho-svg {
  position: absolute;
  top: -8px;
  width: 170px;
  height: 100px;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.4));
}

.rpm-active-arc {
  transition: stroke-dashoffset 0.08s ease-out;
  filter: drop-shadow(0 0 6px var(--acid-glow));
}

.tacho-center {
  position: absolute;
  top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rpm-number {
  font: 600 calc(20px * var(--ui-scale)) var(--mono);
  color: var(--ink);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.rpm-alert {
  color: var(--amber) !important;
  text-shadow: 0 0 12px var(--amber-glow);
}

.profile-tag {
  font: 500 calc(8px * var(--ui-scale)) var(--mono);
  color: var(--acid);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Gear Module */
.gear-badge {
  position: relative;
  min-width: 44px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3px 0;
  transition: all 0.2s ease;
}

.gear-num {
  font: 700 calc(28px * var(--ui-scale)) var(--mono);
  color: var(--acid);
}

.shift-glow {
  border-color: var(--amber) !important;
  background: rgba(231, 191, 118, 0.16) !important;
  box-shadow: 0 0 16px var(--amber-glow);
  animation: shift-pulse 0.4s ease-in-out infinite alternate;
}

@keyframes shift-pulse {
  from { transform: scale(1); }
  to { transform: scale(1.06); }
}

.shift-hint {
  position: absolute;
  top: -9px;
  font: 700 8px var(--mono);
  background: var(--amber);
  color: #1a1608;
  padding: 1px 4px;
  border-radius: 4px;
  letter-spacing: 0.06em;
}

/* Score Module */
.score-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.25);
  margin: 4px 0;
}

.eco-icon {
  width: 14px;
  height: 14px;
  stroke: currentColor;
}

.score-pill strong {
  font: 700 calc(15px * var(--ui-scale)) var(--mono);
}

.pedal-toggle {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  border-radius: 8px;
  padding: 3px 8px;
  font: 500 calc(8.5px * var(--ui-scale)) var(--mono);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pedal-toggle.active {
  color: var(--acid);
  border-color: var(--acid);
  background: rgba(217, 255, 120, 0.08);
}

/* Virtual Pedals Deck */
.pedals-deck {
  display: grid;
  grid-template-columns: 1fr 1.3fr auto;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.pedal-btn {
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font: 700 calc(11px * var(--ui-scale)) var(--mono);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  transition: all 0.12s ease;
}

.brake-btn {
  background: rgba(255, 255, 255, 0.04);
  color: #ff8577;
  border-color: rgba(255, 133, 119, 0.2);
}

.brake-btn.active {
  background: #ff8577;
  color: #1a0806;
  box-shadow: 0 0 16px rgba(255, 133, 119, 0.4);
}

.accel-btn {
  background: rgba(217, 255, 120, 0.06);
  color: var(--acid);
  border-color: rgba(217, 255, 120, 0.25);
}

.accel-btn.active {
  background: var(--acid);
  color: #10140e;
  box-shadow: 0 0 20px var(--acid-glow);
}

.gear-shifters {
  display: flex;
  gap: 6px;
}

.shift-btn,
.reset-btn {
  min-width: 44px;
  min-height: 48px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ink);
  font: 700 16px var(--mono);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.shift-btn:active,
.reset-btn:active {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(0.96);
}

.slide-pedals-enter-active,
.slide-pedals-leave-active {
  transition: all 0.2s ease;
}

.slide-pedals-enter-from,
.slide-pedals-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 800px) {
  .hud-cluster {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}
</style>
