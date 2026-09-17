# infrastructure/audio

Web Audio API adapter. Implements the `EngineSoundOutput` port from the application layer.

## Files

| File                | Purpose                           |
| ------------------- | --------------------------------- |
| `WebAudioEngine.ts` | 4-voice additive synthesis engine |
| `index.ts`          | Barrel export                     |

## How It Works

Generates engine sound in real time — **no audio files needed**.

```
4 oscillators → per-voice GainNode → output GainNode → BiquadFilter (lowpass) → destination
```

- Harmonics: ×1 (triangle), ×2 (sine), ×4 (sine), ×6 (sine)
- Base frequency: `max(18, rpm/60 × cylinders/2 × baseTone/58)`
- Filter sweeps 650–1850 Hz with RPM
- Output gain: `(0.18 + throttle × 0.12) × volume`

## Port Contract

```ts
interface EngineSoundOutput {
  setProfile(profile: VehicleProfile): void;
  update(state: VehicleState): void;
}
```

`setProfile` rebuilds oscillators. `update` runs every animation frame.

## Swap Guide

To replace with sample-based audio, implement `EngineSoundOutput` and swap in `createSimulatorRuntime.ts`.

## Test location

`src/infrastructure/audio/__tests__/WebAudioEngine.spec.ts`
