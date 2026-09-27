import type { VehicleState } from "../../domain/vehicle/types";
import { bodyTimbre, engineSoundParameters, engineTimbre } from "../../domain/audio/engineSound";
import type { Voice } from "./WebAudioGraphBuilder";

export function applyPeriodicWaveform(
  context: AudioContext,
  exhaust: Voice,
  body: Voice,
  state: VehicleState,
  now: number,
): void {
  for (const [voice, harmonics] of [
    [exhaust, engineTimbre(state.profile.cylinders)],
    [body, bodyTimbre(state.profile.cylinders)],
  ] as const) {
    const coefficients = new Float32Array(harmonics);
    voice.source.setPeriodicWave(
      context.createPeriodicWave(new Float32Array(coefficients.length), coefficients),
    );
  }
  const initial = engineSoundParameters(state);
  for (const [voice, hz] of [
    [exhaust, initial.firingHz],
    [body, initial.bodyHz],
  ] as const) {
    voice.source.frequency.cancelScheduledValues(now);
    voice.source.frequency.setValueAtTime(hz, now);
  }
}
