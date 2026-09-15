# Architecture Overview

Complete system architecture for Car Sound Changer - Vue 3 web app with DDD/Clean Architecture.

## Architecture Pattern: DDD + Clean Architecture

This project follows **Domain-Driven Design (DDD)** with **Clean Architecture** principles:

```
                    Presentation Layer (UI)
                            ↓
                    Application Layer (Use Cases)
                            ↓
                    Domain Layer (Business Logic)
                            ↓
                    Infrastructure Layer (Adapters)
```

### Key Principles

1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Separation of Concerns**: Each layer has single responsibility
3. **Testability**: No framework dependencies in domain/application layers
4. **Independence**: Can swap implementations without changing business logic

## Layer Architecture

### 1. Domain Layer (Core Business Logic)

**Purpose**: Pure business logic with NO framework dependencies

**Location**: `src/domain/`

#### Vehicle Domain Model

```typescript
// src/domain/vehicle/types.ts
export interface VehicleProfile {
  make: string;
  model: string;
  year: number;
  displacement: number; // cc
  maxRPM: number;
  maxPower: number; // bhp
  maxTorque: number; // nm
}

export interface VehicleState {
  speed: number; // km/h
  gear: number; // 1-5
  rpm: number; // 0-6000
  throttle: number; // 0-1
}

export interface GearRatio {
  gear: number;
  ratio: number;
  speedRange: [number, number]; // [min, max] km/h
}
```

#### Vehicle Physics

```typescript
// src/domain/vehicle/vehiclePhysics.ts
export function calculateRPM(
  speed: number,
  gear: number,
  gearRatios: GearRatio[]
): number {
  const ratio = gearRatios.find(r => r.gear === gear);
  if (!ratio) return 0;

  const [minSpeed, maxSpeed] = ratio.speedRange;
  const idleRPM = 900;
  const shiftRPM = 2000;
  
  if (speed <= minSpeed) return idleRPM;
  if (speed >= maxSpeed) return shiftRPM;
  
  const percentage = (speed - minSpeed) / (maxSpeed - minSpeed);
  return idleRPM + percentage * (shiftRPM - idleRPM);
}

export function calculateGear(
  speed: number,
  gearRatios: GearRatio[]
): number {
  for (const ratio of gearRatios) {
    const [minSpeed, maxSpeed] = ratio.speedRange;
    if (speed >= minSpeed && speed < maxSpeed) {
      return ratio.gear;
    }
  }
  return 5; // Default to highest gear
}

export function shouldShift(rpm: number, speed: number): boolean {
  return rpm >= 1800; // Shift at ~1800 RPM
}
```

#### Car Profiles (Suzuki Brezza Configuration)

```typescript
// src/domain/vehicle/carProfiles.ts
export const SUZUKI_BREZZA: VehicleProfile = {
  make: 'Suzuki',
  model: 'Brezza',
  year: 2023,
  displacement: 1197, // 1.2L
  maxRPM: 6000,
  maxPower: 83, // bhp
  maxTorque: 113, // nm
};

export const BREZZA_GEAR_RATIOS: GearRatio[] = [
  { gear: 1, ratio: 3.808, speedRange: [0, 15] },
  { gear: 2, ratio: 2.235, speedRange: [15, 30] },
  { gear: 3, ratio: 1.481, speedRange: [30, 50] },
  { gear: 4, ratio: 1.134, speedRange: [50, 70] },
  { gear: 5, ratio: 0.893, speedRange: [70, 180] },
];
```

#### Scoring Domain

```typescript
// src/domain/scoring/greenScore.ts
export function calculateGreenScore(
  avgRPM: number,
  shiftCount: number,
  hardAccelerations: number
): number {
  // 0-100 score
  // Higher score = more eco-friendly driving
  const rpmScore = Math.max(0, 100 - (avgRPM / 60)); // Penalize high RPM
  const shiftScore = Math.max(0, 100 - (shiftCount * 5)); // Penalize excessive shifts
  const accelScore = Math.max(0, 100 - (hardAccelerations * 10)); // Penalize hard acceleration
  
  return (rpmScore + shiftScore + accelScore) / 3;
}
```

### 2. Application Layer (Orchestration & Use Cases)

**Purpose**: Orchestrate domain logic and adapt to framework/infrastructure

**Location**: `src/application/`

#### Services (Use Cases)

```typescript
// src/application/services/DrivingSession.ts
import { calculateRPM, calculateGear, shouldShift } from '@/domain/vehicle/vehiclePhysics';
import type { EngineSoundOutput } from '../ports/EngineSoundOutput';

export class DrivingSession {
  private sessionStartTime: number = 0;
  private totalDistance: number = 0;
  private rpm: number = 900;
  private currentGear: number = 1;

  constructor(
    private soundOutput: EngineSoundOutput,
    private gearRatios: GearRatio[]
  ) {
    this.sessionStartTime = Date.now();
  }

  /**
   * Called on each speed update from GPS
   * Orchestrates: GPS → Calculate Gear → Calculate RPM → Play Sound → Update Telemetry
   */
  onSpeedUpdate(speed: number): void {
    // 1. Calculate new gear based on speed
    const newGear = calculateGear(speed, this.gearRatios);
    
    // 2. Handle gear shifts
    if (newGear !== this.currentGear) {
      this.handleGearShift(newGear);
    }

    // 3. Calculate RPM
    this.rpm = calculateRPM(speed, this.currentGear, this.gearRatios);

    // 4. Play engine sound
    this.soundOutput.playEngineSound({
      rpm: this.rpm,
      gear: this.currentGear,
      volume: this.calculateVolume(speed)
    });

    // 5. Update metrics
    this.totalDistance += speed * (100 / 1000); // ~100ms updates
  }

  private handleGearShift(newGear: number): void {
    const oldGear = this.currentGear;
    this.currentGear = newGear;
    
    // Trigger sound effect
    this.soundOutput.playShiftSound({
      fromGear: oldGear,
      toGear: newGear
    });
  }

  private calculateVolume(speed: number): number {
    // Volume increases with speed
    return Math.min(1, speed / 100);
  }

  getSessionMetrics() {
    return {
      duration: Date.now() - this.sessionStartTime,
      distance: this.totalDistance,
      rpm: this.rpm,
      gear: this.currentGear
    };
  }
}
```

#### Ports (Interfaces)

```typescript
// src/application/ports/EngineSoundOutput.ts
export interface EngineSoundOutput {
  playEngineSound(params: {
    rpm: number;
    gear: number;
    volume: number;
  }): void;

  playShiftSound(params: {
    fromGear: number;
    toGear: number;
  }): void;

  stop(): void;
}

// src/application/ports/TelemetryStatus.ts
export interface TelemetryStatus {
  onSpeedUpdate(speed: number): void;
  onLocationUpdate(lat: number, lon: number): void;
  getStatus(): {
    isTracking: boolean;
    gpsAccuracy: number;
  };
}
```

#### Vue Composables

```typescript
// src/application/composables/useVehicleSimulator.ts
import { ref, watch } from 'vue';
import { DrivingSession } from '../services/DrivingSession';

export function useVehicleSimulator(soundOutput: EngineSoundOutput) {
  const speed = ref(0);
  const rpm = ref(900);
  const gear = ref(1);
  const drivingSession = new DrivingSession(soundOutput, BREZZA_GEAR_RATIOS);

  // Listen to speed changes and update simulator
  watch(speed, (newSpeed) => {
    drivingSession.onSpeedUpdate(newSpeed);
    rpm.value = drivingSession.getRPM();
    gear.value = drivingSession.getGear();
  });

  return {
    speed,
    rpm,
    gear,
    metrics: () => drivingSession.getSessionMetrics()
  };
}
```

### 3. Infrastructure Layer (Adapters & External Services)

**Purpose**: Implement interfaces from application layer using framework/external APIs

**Location**: `src/infrastructure/`

#### Web Audio API Adapter

```typescript
// src/infrastructure/audio/WebAudioEngine.ts
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';

export class WebAudioEngine implements EngineSoundOutput {
  private audioContext: AudioContext;
  private engineBuffer: AudioBuffer | null = null;
  private source: AudioBufferSource | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async loadEngineSound(gear: number): Promise<void> {
    const response = await fetch(`/sounds/engine-gear-${gear}.wav`);
    const arrayBuffer = await response.arrayBuffer();
    this.engineBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  playEngineSound(params: { rpm: number; gear: number; volume: number }): void {
    if (!this.engineBuffer) return;

    // Stop previous sound
    this.source?.stop();

    // Create new source
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.engineBuffer;

    // Adjust playback rate based on RPM (900-6000 RPM → 0.5-2.5x speed)
    const playbackRate = 0.5 + (params.rpm / 6000) * 2;
    this.source.playbackRate.value = playbackRate;

    // Set volume
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = params.volume;

    // Connect and play
    this.source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    this.source.start();
  }

  playShiftSound(params: { fromGear: number; toGear: number }): void {
    // Load and play shift sound effect
  }

  stop(): void {
    this.source?.stop();
  }
}
```

#### Geolocation Adapter

```typescript
// src/infrastructure/gps/GPSService.ts
import type { TelemetryStatus } from '@/application/ports/TelemetryStatus';

export class GPSService implements TelemetryStatus {
  private watchId: number | null = null;
  private lastLocation: { lat: number; lon: number } | null = null;
  private lastSpeed: number = 0;
  private speedCallback: ((speed: number) => void) | null = null;

  startTracking(onSpeedUpdate: (speed: number) => void): void {
    this.speedCallback = onSpeedUpdate;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (this.lastLocation) {
          // Calculate speed from position changes
          const distance = this.calculateDistance(
            this.lastLocation.lat,
            this.lastLocation.lon,
            latitude,
            longitude
          );
          
          // GPS updates roughly every 1 second, so distance ≈ speed in m/s
          const speedMS = distance;
          const speedKMH = speedMS * 3.6;
          
          this.lastSpeed = speedKMH;
          onSpeedUpdate(speedKMH);
        }

        this.lastLocation = { lat: latitude, lon: longitude };
      },
      (error) => {
        console.error('GPS Error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  getStatus() {
    return {
      isTracking: this.watchId !== null,
      gpsAccuracy: 10 // meters (approximate)
    };
  }
}
```

#### Keyboard Input Adapter

```typescript
// src/infrastructure/input/KeyboardInput.ts
export class KeyboardInput {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => this.keys.add(e.key));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));
  }

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }

  getThrottle(): number {
    // For testing: arrow keys
    if (this.isPressed('ArrowUp')) return 0.5;
    if (this.isPressed('ArrowDown')) return 0;
    return 0;
  }

  getGear(): number {
    if (this.isPressed('1')) return 1;
    if (this.isPressed('2')) return 2;
    if (this.isPressed('3')) return 3;
    if (this.isPressed('4')) return 4;
    if (this.isPressed('5')) return 5;
    return 1;
  }
}
```

### 4. Presentation Layer (Vue Components)

**Purpose**: UI components that display state and capture user input

**Location**: `src/presentation/`

#### Components

```vue
<!-- src/presentation/components/RPMGauge.vue -->
<template>
  <div class="gauge-container">
    <svg viewBox="0 0 200 200" class="gauge">
      <!-- Gauge background -->
      <circle cx="100" cy="100" r="90" fill="none" stroke="#ddd" stroke-width="2" />
      
      <!-- RPM needle -->
      <line
        x1="100"
        y1="100"
        :x2="needleX"
        :y2="needleY"
        stroke="red"
        stroke-width="3"
      />
    </svg>
    <div class="rpm-text">{{ rpm }} RPM</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  rpm: number; // 0-6000
}

const props = defineProps<Props>();

// Calculate needle position (angle from RPM)
const angle = computed(() => {
  const maxRPM = 6000;
  const maxAngle = 240; // degrees
  return (props.rpm / maxRPM) * maxAngle - 120; // -120 to 120
});

const needleX = computed(() => {
  const rad = (angle.value * Math.PI) / 180;
  return 100 + 70 * Math.sin(rad);
});

const needleY = computed(() => {
  const rad = (angle.value * Math.PI) / 180;
  return 100 - 70 * Math.cos(rad);
});
</script>

<style scoped>
.gauge-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.gauge {
  width: 100%;
  height: 100%;
}

.rpm-text {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: bold;
}
</style>
```

#### Views

```vue
<!-- src/presentation/views/HomeView.vue -->
<template>
  <div class="home-view">
    <RPMGauge :rpm="rpm" />
    <SpeedDisplay :speed="speed" />
    <GearIndicator :gear="gear" />
    <div class="controls">
      <button @click="startSession">Start</button>
      <button @click="stopSession">Stop</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useVehicleSimulator } from '@/application/composables/useVehicleSimulator';
import { WebAudioEngine } from '@/infrastructure/audio/WebAudioEngine';
import { GPSService } from '@/infrastructure/gps/GPSService';
import RPMGauge from '../components/RPMGauge.vue';
import SpeedDisplay from '../components/SpeedDisplay.vue';
import GearIndicator from '../components/GearIndicator.vue';

const audioEngine = new WebAudioEngine();
const gpsService = new GPSService();
const { speed, rpm, gear, metrics } = useVehicleSimulator(audioEngine);

const startSession = () => {
  gpsService.startTracking((speed_val) => {
    speed.value = speed_val;
  });
};

const stopSession = () => {
  gpsService.stopTracking();
};

onMounted(async () => {
  await audioEngine.loadEngineSound(1);
});
</script>

<style scoped>
.home-view {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
```

## Data Flow Diagram

```
GPS Location Data
    ↓
GPSService (Infrastructure)
    ↓ [Calculate Speed]
Speed (0-200 km/h)
    ↓
DrivingSession.onSpeedUpdate (Application)
    ↓
calculateGear (Domain)
calculateRPM (Domain)
    ↓ [Update State]
rpm: 900-6000
gear: 1-5
    ↓
WebAudioEngine.playEngineSound (Infrastructure)
    ↓ [Web Audio API]
Audio Output
    ↓
Vue Components (Presentation)
    ↓ [RPMGauge.vue]
Visual Update
    ↓
User sees RPM on gauge
```

## Dependency Diagram

```
Presentation Layer (Views, Components)
           ↓ depends on
Application Layer (Services, Composables)
           ↓ depends on
Domain Layer (Pure Business Logic)
           ↑ implemented by
Infrastructure Layer (Adapters)
```

**Key Rule**: Lower layers never depend on upper layers

## Benefits of This Architecture

✅ **Testability**: Domain logic is 100% testable without framework  
✅ **Reusability**: Can use domain logic in different frameworks  
✅ **Maintainability**: Clear separation makes code easy to understand  
✅ **Scalability**: Easy to add new features without modifying existing layers  
✅ **Flexibility**: Can swap implementations (e.g., Web Audio → Native Audio)

## Related Documentation

- [MODULAR_STRUCTURE.md](./MODULAR_STRUCTURE.md) - Project structure
- [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) - Code organization rules
- [DEV_RULES.md](./DEV_RULES.md) - Development standards
- [GEAR_LOGIC.md](./GEAR_LOGIC.md) - Gear calculation details

