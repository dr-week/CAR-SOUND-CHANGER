# Sound Files — Audio Specifications

Audio system design for Car Sound Mod. The app uses **additive synthesis via Web Audio API** — no audio files needed. This document covers the synthesis approach, how to extend it, and how to add real audio samples if desired.

---

## How Sound Is Generated

The engine sound is synthesised in real time using four oscillators layered together. No `.mp3` or `.wav` files are required. The `WebAudioEngine` produces the following signal graph:

```
Oscillator 1 (triangle)  ──→ Gain [0.42] ──┐
Oscillator 2 (sine)      ──→ Gain [0.24] ──┤
Oscillator 3 (sine)      ──→ Gain [0.11] ──┼──→ Output GainNode ──→ BiquadFilter (lowpass) ──→ destination
Oscillator 4 (sine)      ──→ Gain [0.05] ──┘
```

### Harmonic Series

Each oscillator targets a multiple of the base firing frequency:

| Oscillator | Waveform  | Harmonic | Gain  | Role                    |
|------------|-----------|----------|-------|-------------------------|
| 1          | triangle  | ×1       | 0.42  | Fundamental tone        |
| 2          | sine      | ×2       | 0.24  | 2nd harmonic (body)     |
| 3          | sine      | ×4       | 0.11  | 4th harmonic (edge)     |
| 4          | sine      | ×6       | 0.05  | 6th harmonic (fizz)     |

### Base Firing Frequency Formula

```
firingFreq = max(18, (rpm / 60) × (cylinders / 2) × (baseTone / 58))
```

- `baseTone` is a per-profile pitch constant. Suzuki Brezza = **58** (reference).
- Dividing `cylinders / 2` gives firing events per revolution for a 4-stroke engine.
- `baseTone / 58` scales pitch relative to the Brezza reference tone.
- The `max(18)` floor keeps oscillators above audible infrasound range.

### Example: Brezza at 1500 RPM

```
firingFreq = max(18, (1500 / 60) × (4 / 2) × (58 / 58))
           = max(18, 25 × 2 × 1)
           = 50 Hz   ← fundamental
Harmonic 2 = 100 Hz
Harmonic 4 = 200 Hz
Harmonic 6 = 300 Hz
```

### Example: Formula V12 at 10000 RPM

```
firingFreq = max(18, (10000 / 60) × (12 / 2) × (95 / 58))
           = max(18, 166.7 × 6 × 1.638)
           = 1638 Hz ← fundamental
```

---

## Per-Profile Audio Parameters

| Profile       | Cylinders | baseTone | Idle RPM | Redline | Shift RPM |
|---------------|-----------|----------|----------|---------|-----------|
| Suzuki Brezza | 4         | 58       | 800      | 6 500   | 1 500     |
| Ford Mustang  | 8         | 42       | 750      | 7 000   | 2 800     |
| Porsche Flat6 | 6         | 65       | 850      | 7 800   | 3 000     |
| Formula V12   | 12        | 95       | 2 500    | 12 000  | 7 000     |

**`baseTone` tuning guide:**

- Lower value → deeper/bassier sound (Mustang V8 = 42)
- Higher value → higher-pitched/screaming sound (F1 V12 = 95)
- Brezza 4-cyl sits at the 58 reference mid-point

---

## Dynamic Filter

A lowpass `BiquadFilterNode` sweeps from **650 Hz to 1850 Hz** as RPM rises:

```
cutoff = 650 + normalizedRpm × 1200
```

Where `normalizedRpm = clamp(0, 1, rpm / redlineRpm)`.

- At idle: cutoff ≈ 650 Hz — muffled, low rumble
- At redline: cutoff ≈ 1850 Hz — bright, open, screaming
- Q factor: 0.7 (gentle, no resonance peak)

---

## Volume Behaviour

```
output.gain = (0.18 + throttle × 0.12) × userVolume
```

- Idle (no throttle): gain = 0.18 × volume  — quiet background burble
- Full throttle: gain = 0.30 × volume — loud, aggressive
- `userVolume` = 0–1 (mapped from the 0–100% slider)

---

## Smoothing Time Constants

All parameter changes use `setTargetAtTime` for smooth transitions:

| Parameter       | Time Constant | Feel                         |
|-----------------|---------------|------------------------------|
| Oscillator freq | 40 ms         | RPM follows throttle quickly |
| Output gain     | 50 ms         | Volume fades smoothly        |
| Filter cutoff   | 80 ms         | Filter sweeps gradually      |

---

## Adding Real Audio Samples (Optional)

If you want `.wav`/`.mp3` engine samples instead of synthesis, follow this pattern:

### 1. Place files in `public/sounds/`

```
public/
└── sounds/
    ├── brezza-idle.wav
    ├── brezza-rev.wav
    ├── mustang-idle.wav
    └── mustang-rev.wav
```

### 2. Implement a new `SampledAudioEngine`

```typescript
// src/infrastructure/audio/SampledAudioEngine.ts
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';
import type { VehicleProfile, VehicleState } from '@/domain/vehicle/types';

export class SampledAudioEngine implements EngineSoundOutput {
  private context = new AudioContext();
  private idleBuffer: AudioBuffer | null = null;
  private revBuffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;

  async loadProfile(profileId: string): Promise<void> {
    const [idle, rev] = await Promise.all([
      this.loadBuffer(`/sounds/${profileId}-idle.wav`),
      this.loadBuffer(`/sounds/${profileId}-rev.wav`),
    ]);
    this.idleBuffer = idle;
    this.revBuffer = rev;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.context.decodeAudioData(arrayBuffer);
  }

  setProfile(profile: VehicleProfile): void {
    void this.loadProfile(profile.id);
  }

  update(state: VehicleState): void {
    // Cross-fade between idle and rev based on throttle + rpm
    const normalizedRpm = state.rpm / state.profile.redlineRpm;
    // … playback rate modulation logic here
  }
}
```

### 3. Swap in `createSimulatorRuntime.ts`

```typescript
// Replace:
const audio = new WebAudioEngine();
// With:
const audio = new SampledAudioEngine();
```

No other files need to change — the port interface ensures plug-and-play.

---

## Audio File Requirements (if using samples)

| Property       | Requirement              |
|----------------|--------------------------|
| Format         | WAV (preferred) or MP3   |
| Sample rate    | 44 100 Hz or 48 000 Hz   |
| Bit depth      | 16-bit (WAV) / 192 kbps+ (MP3) |
| Channels       | Mono (engine sounds only need one channel) |
| Duration       | 2–4 seconds (loopable)   |
| Loop point     | Must be zero-crossing for gapless loop |
| File size      | ≤ 500 KB per file        |

---

## NFS-Style Sound Characteristics

Need for Speed engine sounds have specific traits to aim for:

1. **Aggressive harmonic content** — rich mid-range crunch (200–800 Hz)
2. **Sharp throttle response** — sound reacts within 1–2 frames of input
3. **Pitch sweep on acceleration** — continuous glide, no discrete steps
4. **Gear-shift pop** — brief gain spike + filter open on upshift
5. **Engine braking** — RPM falls with characteristic tone drop on coast

The current synthesis engine covers points 1–4. Point 5 (engine braking sound) can be enhanced by adding a brief gain pulse in `DrivingSession.shift()`.

---

## Bluetooth Audio

Sound output routes through the browser's default audio output device. Web Audio API → OS audio → selected output (speakers, Bluetooth, wired).

To route to Bluetooth:
1. Connect your Bluetooth speaker in OS settings
2. Set it as the default audio output device
3. The app automatically uses the OS default — no in-app configuration needed

For explicit audio output selection (experimental), see `BluetoothManager.ts`.

---

## Related

- [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md) — high-level audio architecture
- [BLUETOOTH_AUDIO.md](./BLUETOOTH_AUDIO.md) — Bluetooth routing details
- [API_REFERENCE.md](./API_REFERENCE.md) — `WebAudioEngine` API
