# Audio System - NFS Style Engine Sounds

Complete audio system implementation with Need for Speed style engine sounds.

## Overview

High-fidelity, dynamic engine sound system that recreates the iconic NFS audio experience with:

- Realistic engine samples
- Dynamic pitch shifting based on RPM
- Smooth gear transitions
- Turbo/supercharger sounds
- Backfire effects on gear shifts

## NFS Audio Characteristics

### What Makes NFS Sounds Special

1. **Aggressive Engine Notes**: Deep, throaty engine sounds
2. **Dynamic Range**: From idle rumble to high-RPM scream
3. **Turbo Whoosh**: Distinctive turbo spool and blow-off valve
4. **Backfire/Pop**: Popping sounds on deceleration and shifts
5. **Transmission Whine**: Subtle gearbox sounds
6. **Layered Audio**: Multiple sound layers blend seamlessly

## Audio Architecture

```
┌─────────────────────────────────────────────────────┐
│              Audio Engine                           │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Engine Loop │  │ Turbo Layer │  │ Effects    │ │
│  │ (Gear 1-5)  │  │             │  │ Layer      │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                 │                │        │
│         └─────────┬───────┴────────────────┘        │
│                   ▼                                 │
│         ┌──────────────────┐                       │
│         │  Audio Mixer     │                       │
│         │  - Volume        │                       │
│         │  - Pitch Shift   │                       │
│         │  - Crossfade     │                       │
│         └────────┬─────────┘                       │
│                  │                                  │
└──────────────────┼──────────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │ Audio Output   │
          │ (Bluetooth/    │
          │  Speaker)      │
          └────────────────┘
```

## Sound File Structure

### Required Audio Files

```
src/assets/sounds/
├── engine/
│   ├── gear1_idle.wav      # Gear 1 at low RPM
│   ├── gear1_mid.wav       # Gear 1 mid RPM
│   ├── gear1_high.wav      # Gear 1 near redline
│   ├── gear2_idle.wav
│   ├── gear2_mid.wav
│   ├── gear2_high.wav
│   ├── gear3_idle.wav
│   ├── gear3_mid.wav
│   ├── gear3_high.wav
│   ├── gear4_idle.wav
│   ├── gear4_mid.wav
│   ├── gear4_high.wav
│   ├── gear5_idle.wav
│   ├── gear5_mid.wav
│   └── gear5_high.wav
├── effects/
│   ├── shift_up.wav        # Gear shift up sound
│   ├── shift_down.wav      # Gear shift down sound
│   ├── backfire.wav        # Backfire/pop
│   ├── turbo_spool.wav     # Turbo spinning up
│   ├── turbo_bov.wav       # Blow-off valve
│   └── limiter.wav         # Rev limiter bounce
└── ambient/
    ├── transmission.wav     # Gearbox whine
    └── wind.wav            # Wind noise (optional)
```

### Audio Specifications

- **Format**: WAV (uncompressed) or OGG (compressed)
- **Sample Rate**: 44100 Hz or 48000 Hz
- **Bit Depth**: 16-bit or 24-bit
- **Channels**: Stereo (2 channels)
- **Loop Points**: Seamless loops for engine sounds
- **Duration**: 2-5 seconds per sample

## Implementation

### AudioService Class

**File**: `src/services/AudioService.ts`

```typescript
import Sound from "react-native-sound";

interface AudioLayer {
  engine: Sound | null;
  turbo: Sound | null;
  effects: Sound | null;
}

export class AudioService {
  private layers: AudioLayer;
  private currentGear: number = 1;
  private currentRPM: number = 900;
  private volume: number = 1.0;

  constructor() {
    Sound.setCategory("Playback");
    this.layers = {
      engine: null,
      turbo: null,
      effects: null,
    };
  }

  // Load all sound files
  async initialize(): Promise<void> {
    await this.preloadAllSounds();
  }

  // Play engine sound based on gear and RPM
  playEngineSound(gear: number, rpm: number): void {
    // Determine which sample to use
    const sample = this.selectSample(gear, rpm);

    // Calculate pitch shift
    const pitch = this.calculatePitch(rpm, gear);

    // Play with pitch shift
    this.playWithPitch(sample, pitch);

    // Add turbo layer if RPM > 1500
    if (rpm > 1500) {
      this.playTurboLayer(rpm);
    }
  }

  // Smooth gear shift with crossfade
  async shiftGear(fromGear: number, toGear: number): Promise<void> {
    // Play shift sound effect
    this.playShiftSound(toGear > fromGear ? "up" : "down");

    // Crossfade between gear sounds
    await this.crossfade(fromGear, toGear);

    // Random backfire chance on upshift
    if (toGear > fromGear && Math.random() > 0.7) {
      this.playBackfire();
    }
  }

  private selectSample(gear: number, rpm: number): string {
    if (rpm < 1200) return `gear${gear}_idle`;
    if (rpm < 1700) return `gear${gear}_mid`;
    return `gear${gear}_high`;
  }

  private calculatePitch(rpm: number, gear: number): number {
    // Map RPM to pitch (0.8 to 1.5)
    const minRPM = 900;
    const maxRPM = 2000;
    const minPitch = 0.8;
    const maxPitch = 1.5;

    const normalized = (rpm - minRPM) / (maxRPM - minRPM);
    return minPitch + normalized * (maxPitch - minPitch);
  }

  private async crossfade(fromGear: number, toGear: number, duration: number = 200): Promise<void> {
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const fadeOut = 1 - progress;
      const fadeIn = progress;

      this.setGearVolume(fromGear, fadeOut);
      this.setGearVolume(toGear, fadeIn);

      await this.sleep(stepDuration);
    }
  }

  private playBackfire(): void {
    const backfire = new Sound("backfire.wav", Sound.MAIN_BUNDLE, (error) => {
      if (!error) {
        backfire.setVolume(0.6);
        backfire.play(() => backfire.release());
      }
    });
  }

  private playTurboLayer(rpm: number): void {
    // Turbo spool volume based on RPM
    const turboVolume = Math.max(0, (rpm - 1500) / 500);

    if (!this.layers.turbo) {
      this.layers.turbo = new Sound("turbo_spool.wav", Sound.MAIN_BUNDLE);
      this.layers.turbo.setNumberOfLoops(-1); // Infinite loop
    }

    this.layers.turbo.setVolume(Math.min(turboVolume, 0.4));

    if (!this.layers.turbo.isPlaying()) {
      this.layers.turbo.play();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  stop(): void {
    // Stop all audio layers
    if (this.layers.engine) this.layers.engine.stop();
    if (this.layers.turbo) this.layers.turbo.stop();
  }

  release(): void {
    // Release all audio resources
    if (this.layers.engine) this.layers.engine.release();
    if (this.layers.turbo) this.layers.turbo.release();
  }
}
```

## Dynamic Audio Mixing

### RPM-Based Mixing

```typescript
function calculateAudioMix(rpm: number, gear: number) {
  const mix = {
    engineVolume: 1.0,
    turboVolume: 0.0,
    transmissionVolume: 0.0,
  };

  // Engine: Always audible, louder at high RPM
  mix.engineVolume = 0.7 + (rpm / 2000) * 0.3;

  // Turbo: Audible above 1500 RPM
  if (rpm > 1500) {
    mix.turboVolume = Math.min((rpm - 1500) / 500, 1.0) * 0.4;
  }

  // Transmission whine: Subtle, increases with gear
  mix.transmissionVolume = (gear / 5) * 0.15;

  return mix;
}
```

## NFS-Style Effects

### 1. Shift Pop/Backfire

```typescript
function playShiftEffect(fromGear: number, toGear: number, rpm: number) {
  // Upshift at high RPM: backfire
  if (toGear > fromGear && rpm > 1800) {
    playBackfire();
  }

  // Downshift: Blip (brief rev)
  if (toGear < fromGear) {
    playRevBlip();
  }

  // Shift clunk
  playShiftClunk();
}
```

### 2. Rev Limiter

```typescript
function handleRevLimiter(rpm: number, maxRPM: number = 2000) {
  if (rpm >= maxRPM) {
    // Bounce RPM
    playLimiterBounce();
    return maxRPM;
  }
  return rpm;
}
```

### 3. Turbo Blow-off Valve

```typescript
function playBOV(wasHighRPM: boolean, isShifting: boolean) {
  // Play BOV when lifting off at high RPM during shift
  if (wasHighRPM && isShifting) {
    const bov = new Sound("turbo_bov.wav", Sound.MAIN_BUNDLE);
    bov.play(() => bov.release());
  }
}
```

## Audio Optimization

### Memory Management

```typescript
class AudioPool {
  private pools: Map<string, Sound[]> = new Map();
  private readonly POOL_SIZE = 3;

  getSound(filename: string): Sound {
    if (!this.pools.has(filename)) {
      this.createPool(filename);
    }

    const pool = this.pools.get(filename)!;
    return pool.find((s) => !s.isPlaying()) || pool[0];
  }

  private createPool(filename: string): void {
    const pool: Sound[] = [];
    for (let i = 0; i < this.POOL_SIZE; i++) {
      pool.push(new Sound(filename, Sound.MAIN_BUNDLE));
    }
    this.pools.set(filename, pool);
  }
}
```

### Performance Tips

1. **Preload All Sounds**: Load on app start, not on demand
2. **Use Object Pooling**: Reuse Sound objects
3. **Limit Concurrent Sounds**: Max 5-7 simultaneous sounds
4. **Compress with OGG**: Reduce file size (WAV for quality)
5. **Native Audio**: Use native modules, not JS for playback

## Integration with GPS/Speed

```typescript
// Main update loop
function updateAudio(speed: number) {
  const gear = calculateGear(speed);
  const rpm = calculateRPM(speed, gear);

  // Check for gear change
  if (gear !== previousGear) {
    audioService.shiftGear(previousGear, gear);
    previousGear = gear;
  }

  // Update engine sound
  audioService.playEngineSound(gear, rpm);
}

// Called every 100ms from GPS service
gpsService.onSpeedChange((speed) => {
  updateAudio(speed);
});
```

## Testing Audio

### Test Scenarios

1. **Idle Sound**: 0 km/h, should play idle loop
2. **Acceleration**: Gradual speed increase, pitch should rise
3. **Gear Shifts**: Each shift should have sound effect
4. **Deceleration**: RPM should drop smoothly
5. **High RPM**: Should add turbo layer
6. **Bluetooth**: Test on Bluetooth speaker for latency

### Debug Audio Panel

```typescript
// Add to settings screen
<View style={styles.debugPanel}>
  <Text>Current Gear: {currentGear}</Text>
  <Text>RPM: {rpm.toFixed(0)}</Text>
  <Text>Speed: {speed.toFixed(1)} km/h</Text>
  <Text>Engine Volume: {engineVolume.toFixed(2)}</Text>
  <Text>Turbo Volume: {turboVolume.toFixed(2)}</Text>
  <Button onPress={() => audioService.playTestSound()}>
    Test Sound
  </Button>
</View>
```

## Sound Pack Support (Future)

### Custom Sound Packs

```typescript
interface SoundPack {
  id: string;
  name: string;
  description: string;
  carModel: string;
  sounds: {
    engine: string[];
    effects: string[];
  };
}

// Example: Different car sounds
const SOUND_PACKS: SoundPack[] = [
  {
    id: "suzuki-brezza",
    name: "Suzuki Brezza Stock",
    carModel: "Suzuki Brezza",
    sounds: {/* ... */},
  },
  {
    id: "v8-muscle",
    name: "V8 Muscle Car",
    carModel: "Generic V8",
    sounds: {/* ... */},
  },
];
```

## Related Documentation

- [BLUETOOTH_AUDIO.md](./BLUETOOTH_AUDIO.md) - Bluetooth integration
- [PERFORMANCE.md](./PERFORMANCE.md) - Audio optimization
- [SOUND_FILES.md](./SOUND_FILES.md) - Creating/sourcing sound files
- [API_REFERENCE.md](./API_REFERENCE.md) - AudioService API

---

**Next**: See [GPS_INTEGRATION.md](./GPS_INTEGRATION.md) for connecting audio to vehicle speed.
