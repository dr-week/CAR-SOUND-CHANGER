import type { VehicleState } from "../vehicle/types";

export interface GreenScore { points: number; earned: number; penalties: { harshBrake: number; highRpm: number; harshThrottle: number }; previousThrottle: number; }
export function createGreenScore(): GreenScore { return { points: 100, earned: 0, penalties: { harshBrake: 0, highRpm: 0, harshThrottle: 0 }, previousThrottle: 0 }; }
export function updateGreenScore(score: GreenScore, vehicle: VehicleState, dt: number): void {
  const throttleChange = Math.abs(vehicle.throttle - score.previousThrottle) / Math.max(dt, 0.016);
  const harshBrake = vehicle.brake > 0.8 && (vehicle.gpsSpeedKph ?? vehicle.speedKph) > 15;
  const highRpm = vehicle.rpm > vehicle.profile.shiftRpm + 1200;
  const harshThrottle = throttleChange > 8;
  if (harshBrake) score.penalties.harshBrake += 1.5 * dt;
  if (highRpm) score.penalties.highRpm += 0.4 * dt;
  if (harshThrottle) score.penalties.harshThrottle += 0.25 * dt;
  if (!harshBrake && !highRpm && !harshThrottle && vehicle.throttle > 0 && vehicle.brake === 0) score.earned += 0.15 * dt;
  score.points = Math.round(Math.max(0, Math.min(100, 100 + score.earned - Object.values(score.penalties).reduce((a, b) => a + b, 0))));
  score.previousThrottle = vehicle.throttle;
}
export function getGreenScoreSummary(score: GreenScore): string { return `Brake ${score.penalties.harshBrake.toFixed(1)} · RPM ${score.penalties.highRpm.toFixed(1)} · throttle ${score.penalties.harshThrottle.toFixed(1)} penalty points`; }
