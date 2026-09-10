<script setup lang="ts">
import type { GreenScore } from "../../domain/scoring/greenScore";
import type { VehicleState } from "../../domain/vehicle/types";
import { getGreenScoreSummary } from "../../domain/scoring/greenScore";
defineProps<{ vehicle: VehicleState; greenScore: GreenScore }>();
</script>
<template><section class="telemetry"><div><span>RPM</span><strong>{{ Math.round(vehicle.rpm).toLocaleString() }}</strong></div><div><span>Gear</span><strong>{{ vehicle.gear }}</strong></div><div><span>Speed</span><strong>{{ Math.round(vehicle.gpsSpeedKph ?? vehicle.speedKph) }} km/h</strong></div><div class="green-score" :title="getGreenScoreSummary(greenScore)"><span>Green score</span><strong>{{ greenScore.points }}/100</strong></div></section></template>
