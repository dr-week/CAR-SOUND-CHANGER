# API Reference

Complete reference for all public interfaces, classes, functions, and composables in Car Sound Mod.

---

## Table of Contents

1. [Domain Layer](#domain-layer)
   - [VehicleProfile](#vehicleprofile)
   - [VehicleState](#vehiclestate)
   - [vehiclePhysics](#vehiclephysics)
   - [carProfiles](#carprofiles)
   - [greenScore](#greenscore)
2. [Application Layer](#application-layer)
   - [EngineSoundOutput (Port)](#enginesoundoutput-port)
   - [TelemetryStatus (Port)](#telemetrystatus-port)
   - [DrivingSession](#drivingsession)
   - [useVehicleSimulator](#usevehiclesimulator)
3. [Infrastructure Layer](#infrastructure-layer)
   - [WebAudioEngine](#webaudioengine)
   - [BrowserGeolocation](#browsergeolocation)
   - [KeyboardInput](#keyboardinput)
   - [BluetoothManager](#bluetoothmanager)
4. [Composition Root](#composition-root)
   - [createSimulatorRuntime](#createsimulatorruntime)

---

## Domain Layer

> Pure TypeScript — no Vue, no DOM, no framework imports.

---

### VehicleProfile

**File**: `src/domain/vehicle/types.ts`

```typescript
interface VehicleProfile {
  id: string;          // Unique identifier, e.g. "brezza"
  name: string;        // Display name, e.g. "Suzuki Brezza 2021"
  cylinders: number;   // Engine cylinder count (affects audio pitch)
  gears: number;       // Number of forward gears
  idleRpm: number;     // RPM at idle, e.g. 800
  redlineRpm: number;  // Max safe RPM, e.g. 6500
  shiftRpm: number;    // Suggested shift point, e.g. 1500
  baseTone: number;    // Audio pitch reference (58 = Brezza baseline)
}
```

---

### VehicleState

**File**: `src/domain/vehicle/types.ts`

```typescript
interface VehicleState {
  profile: VehicleProfile;    // Active vehicle configuration
  rpm: number;                // Current engine RPM
  gear: number;               // Current gear (1 to profile.gears)
  throttle: number;           // Throttle input: 0.0 = off, 1.0 = full
  brake: number;              // Brake input: 0.0 = off, 1.0 = full
  speedKph: number;           // Simulated speed (km/h)
  gpsSpeedKph: number | null; // GPS speed override (null = use simulation)
}
```

**Notes:**
- When `gpsSpeedKph` is non-null, `speedKph` is frozen and physics uses GPS speed for RPM calculation.
- `speedKph` never goes below 0 (clamped in `stepVehicle`).

---

### vehiclePhysics

**File**: `src/domain/vehicle/vehiclePhysics.ts`

#### `createVehicleState(profile)`

```typescript
function createVehicleState(profile: VehicleProfile): VehicleState
```

Creates a fresh vehicle state at idle with the given profile. RPM is set to `profile.idleRpm`, gear is 1, all inputs and speeds are 0.

**Example:**
```typescript
const state = createVehicleState(CAR_PROFILES.brezza);
// state.rpm === 800, state.gear === 1, state.speedKph === 0
```

---

#### `stepVehicle(state, dt)`

```typescript
function stepVehicle(state: VehicleState, dt: number): void
```

Advances simulation by `dt` seconds (mutates `state` in-place). Called every animation frame.

**Physics model:**

```
acceleration = throttle × 14 − brake × 24 − max(0.4, speed × 0.025)
```

- Max acceleration: 14 m/s² (full throttle)
- Max deceleration: 24 m/s² (full brake)
- Rolling resistance: `max(0.4, speed × 0.025)` — increases with speed

```
targetRpm = max(idleRpm, speed × 29 × gearRatio[gear] + throttle × 900)
rpm += (min(redlineRpm, targetRpm) − rpm) × min(1, response × dt)
```

- `response = 6` when accelerating, `3` when coasting (faster rise, slower fall)
- RPM is clamped to `redlineRpm` (never exceeds redline)
- Gear ratios: `[0, 3.6, 2.15, 1.45, 1.1, 0.9, 0.76, 0.64, 0.55]` (index = gear)

**Parameters:**
- `dt` — delta time in seconds. Should be capped to 0.1s by the caller (done in `DrivingSession.step`).

---

### carProfiles

**File**: `src/domain/vehicle/carProfiles.ts`

#### `CAR_PROFILES`

```typescript
const CAR_PROFILES: Record<ProfileId, VehicleProfile>
```

Pre-built profiles:

| Key       | Name               | Cyl | Gears | Idle | Redline | Shift | baseTone |
|-----------|--------------------|-----|-------|------|---------|-------|----------|
| `brezza`  | Suzuki Brezza 2021 | 4   | 5     | 800  | 6 500   | 1 500 | 58       |
| `mustang` | Ford Mustang V8    | 8   | 6     | 750  | 7 000   | 2 800 | 42       |
| `porsche` | Porsche Flat-6     | 6   | 7     | 850  | 7 800   | 3 000 | 65       |
| `f1`      | Formula V12        | 12  | 8     | 2500 | 12 000  | 7 000 | 95       |

#### `isProfileId(value)`

```typescript
function isProfileId(value: string): value is ProfileId
```

Type guard. Returns `true` if `value` is a key of `CAR_PROFILES`.

---

### greenScore

**File**: `src/domain/scoring/greenScore.ts`

#### `GreenScore` interface

```typescript
interface GreenScore {
  points: number;              // 0–100 eco-driving score
  earned: number;              // Accumulated bonus from smooth driving
  penalties: {
    harshBrake: number;        // Penalty seconds accrued from hard braking
    highRpm: number;           // Penalty seconds accrued from over-revving
    harshThrottle: number;     // Penalty seconds accrued from aggressive throttle
  };
  previousThrottle: number;    // Internal: last frame throttle for change-rate calc
}
```

#### `createGreenScore()`

```typescript
function createGreenScore(): GreenScore
```

Returns a fresh score at 100 points with zero penalties.

#### `updateGreenScore(score, vehicle, dt)`

```typescript
function updateGreenScore(score: GreenScore, vehicle: VehicleState, dt: number): void
```

Updates the score in-place each frame. Penalty conditions:

| Condition                                    | Rate      |
|----------------------------------------------|-----------|
| `brake > 0.8` AND `speed > 15 km/h`          | −1.5 pts/s|
| `rpm > profile.shiftRpm + 1200`              | −0.4 pts/s|
| Throttle change rate > 8 units/s             | −0.25 pts/s|
| Smooth driving (throttle > 0, no penalties)  | +0.15 pts/s|

Final: `points = clamp(0, 100, 100 + earned − sum(penalties))`

#### `getGreenScoreSummary(score)`

```typescript
function getGreenScoreSummary(score: GreenScore): string
```

Returns a human-readable penalty breakdown string.

---

## Application Layer

> Orchestrates domain logic. No DOM, no Vue reactivity, no framework imports.

---

### EngineSoundOutput (Port)

**File**: `src/application/ports/EngineSoundOutput.ts`

```typescript
interface EngineSoundOutput {
  setProfile(profile: VehicleProfile): void;
  update(state: VehicleState): void;
}
```

- **`setProfile`** — Called when the vehicle profile changes. The audio engine should rebuild its voice graph.
- **`update`** — Called every animation frame with the current vehicle state. The engine should smoothly adjust pitch, volume, and filter.

Implemented by: `WebAudioEngine`, `SampledAudioEngine` (optional).

---

### TelemetryStatus (Port)

**File**: `src/application/ports/TelemetryStatus.ts`

```typescript
type TelemetryStatus =
  | "inactive"    // GPS not started
  | "active"      // Receiving valid GPS fixes
  | "unavailable" // navigator.geolocation not present
  | "denied"      // User denied permission
  | "error"       // geolocation error (other than denied)
  | "stale"       // Last fix is older than staleAfterMs
```

---

### DrivingSession

**File**: `src/application/services/DrivingSession.ts`

The core application service. Coordinates vehicle physics, scoring, and sound output per frame. Has no knowledge of Vue, DOM, keyboard, GPS, or Web Audio.

```typescript
class DrivingSession {
  constructor(
    vehicle: VehicleState,
    greenScore: GreenScore,
    soundOutput: EngineSoundOutput
  )
}
```

#### Methods

##### `setControl(action, active)`

```typescript
setControl(action: DriveAction, active: boolean): void
// DriveAction = "accelerate" | "brake"
```

Adds or removes a drive action from the active set. Throttle/brake are applied on the next `step()` call.

##### `shift(delta)`

```typescript
shift(delta: 1 | -1): void
```

Increments (`1`) or decrements (`-1`) gear. Clamped to `[1, profile.gears]`. Ignores values other than `1` or `-1`.

##### `selectProfile(profile)`

```typescript
selectProfile(profile: VehicleProfile): void
```

Switches to a new vehicle profile. Resets gear to 1, RPM to `profile.idleRpm`, and calls `soundOutput.setProfile(profile)`.

##### `setGpsSpeed(speedKph)`

```typescript
setGpsSpeed(speedKph: number): void
```

Overrides simulation speed with GPS data. Validates: must be finite, ≥ 0, ≤ 450 km/h. Sets both `vehicle.gpsSpeedKph` and `vehicle.speedKph`.

##### `clearGpsSpeed()`

```typescript
clearGpsSpeed(): void
```

Removes GPS override. Sets `vehicle.gpsSpeedKph = null`; simulation resumes from current `speedKph`.

##### `reset()`

```typescript
reset(): void
```

Resets all controls, vehicle state (rpm → idle, gear → 1, speed → 0), and green score to initial values.

##### `step(dt)`

```typescript
step(dt: number): void
```

Advances one simulation frame. Internally:
1. Maps active controls to `throttle`/`brake` on the vehicle state
2. Calls `stepVehicle(vehicle, dt)`
3. Calls `updateGreenScore(greenScore, vehicle, dt)`
4. Calls `soundOutput.update(vehicle)`

`dt` is capped to 0.1s. Non-finite or non-positive values are ignored.

---

### useVehicleSimulator

**File**: `src/application/composables/useVehicleSimulator.ts`

Vue 3 composable. Owns all reactive state and drives the `requestAnimationFrame` loop.

```typescript
function useVehicleSimulator(): {
  // Reactive state (read)
  vehicle: VehicleState,          // reactive() — direct property access
  greenScore: GreenScore,         // reactive()
  profiles: typeof CAR_PROFILES,  // static
  audioEnabled: Ref<boolean>,
  audioStatus: Ref<AudioStatus>,
  gpsEnabled: Ref<boolean>,
  telemetryStatus: Ref<TelemetryStatus>,
  volume: Ref<number>,            // 0–100

  // Actions
  setControl(action: DriveAction, active: boolean): void,
  shift(delta: number): void,
  selectProfile(id: string): void,
  enableAudio(): Promise<void>,   // toggles audio on/off; handles blocked context
  setGps(enabled: boolean): void,
  reset(): void,
  setVolume(value: number): void, // clamps to 0–100, maps to 0–1 for audio
}
```

**`AudioStatus`** type:
```typescript
type AudioStatus = "inactive" | "active" | "unsupported" | "blocked"
```

**Lifecycle:** mounts keyboard listener and rAF loop; unmounts cleanly via `onBeforeUnmount`.

---

## Infrastructure Layer

> Implements application ports using browser APIs. Depends on application interfaces but not domain logic directly.

---

### WebAudioEngine

**File**: `src/infrastructure/audio/WebAudioEngine.ts`  
**Implements**: `EngineSoundOutput`

```typescript
class WebAudioEngine implements EngineSoundOutput {
  get isSupported(): boolean
  async resume(): Promise<void>
  async suspend(): Promise<void>
  async dispose(): Promise<void>
  setVolume(value: number): void    // 0.0–1.0
  setProfile(profile: VehicleProfile): void
  update(state: VehicleState): void
}
```

| Method        | Description                                                             |
|---------------|-------------------------------------------------------------------------|
| `isSupported` | `true` if `AudioContext` is available in this browser                   |
| `resume()`    | Creates audio graph if not yet created; resumes AudioContext            |
| `suspend()`   | Suspends AudioContext (pauses all sound without destroying graph)       |
| `dispose()`   | Stops all oscillators, closes AudioContext, frees resources             |
| `setVolume()` | Stores volume (0–1); applied multiplicatively in `update()`             |
| `setProfile()`| Clears existing oscillators and rebuilds 4-voice graph for new profile  |
| `update()`    | Called every frame; adjusts frequency, gain, and filter via smooth ramps|

See [SOUND_FILES.md](./SOUND_FILES.md) for synthesis detail.

---

### BrowserGeolocation

**File**: `src/infrastructure/telemetry/BrowserGeolocation.ts`

```typescript
class BrowserGeolocation {
  constructor(
    onSpeed: (speedKph: number) => void,
    onStatus: (status: TelemetryStatus) => void,
    staleAfterMs?: number   // default: 5000 ms
  )

  start(): void
  stop(): void
}
```

**Validation rules applied to each GPS fix:**
- `position.coords.speed` must be finite and ≥ 0
- Speed must be ≤ 450 km/h
- Fix timestamp must be within `staleAfterMs` of `Date.now()`

**Stale detection:** a 1-second interval checks if the last valid fix is older than `staleAfterMs`; emits `"stale"` if so.

---

### KeyboardInput

**File**: `src/infrastructure/input/KeyboardInput.ts`

```typescript
class KeyboardInput {
  constructor(
    onControl: (action: DriveAction, active: boolean) => void,
    onShift: (delta: number) => void
  )

  start(): () => void   // Returns cleanup function
}
```

**Key bindings:**

| Key              | Action                        |
|------------------|-------------------------------|
| W                | Accelerate (hold)             |
| S                | Brake (hold)                  |
| 1 / Numpad1      | Upshift (+1 gear)             |
| 2 / Numpad2      | Downshift (−1 gear)           |
| Window blur      | Release all controls          |

- Ignores repeated keydown events (`event.repeat === true`)
- Ignores events from form elements (input, select, textarea)
- Ignores modifier keys (Ctrl, Alt, Meta)

---

### BluetoothManager

**File**: `src/infrastructure/bluetooth/BluetoothManager.ts`

```typescript
class BluetoothManager {
  get isSupported(): boolean
  get connectedDevice(): BluetoothDevice | null
  get status(): BluetoothStatus    // "idle" | "scanning" | "connected" | "error" | "unsupported"

  async requestDevice(): Promise<void>    // Opens browser device picker
  disconnect(): void
  onStatusChange(cb: (status: BluetoothStatus) => void): () => void  // Returns unsubscribe fn
}
```

**Notes:**
- Uses the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) — requires HTTPS or localhost
- Audio routing is handled by the OS; this class manages connection state for UI feedback only
- Not supported in Firefox; `isSupported` returns `false` gracefully

---

## Composition Root

---

### createSimulatorRuntime

**File**: `src/composition/createSimulatorRuntime.ts`

```typescript
function createSimulatorRuntime(
  vehicle: VehicleState,
  greenScore: GreenScore,
  onTelemetryStatus: (status: TelemetryStatus) => void
): {
  audio: WebAudioEngine,
  session: DrivingSession,
  gps: BrowserGeolocation,
  keyboard: KeyboardInput,
}
```

The **only place** in the codebase that instantiates infrastructure adapters and wires them to application services. Ensures `DrivingSession` never imports from infrastructure directly.

**Wiring:**
```
keyboard.onControl  →  session.setControl()
keyboard.onShift    →  session.shift()
gps.onSpeed         →  session.setGpsSpeed()
gps.onStatus        →  session.clearGpsSpeed() (if not "active") + onTelemetryStatus()
audio               →  passed to DrivingSession constructor as EngineSoundOutput
```

---

## Error Handling Summary

| Scenario                    | Behaviour                                              |
|-----------------------------|--------------------------------------------------------|
| AudioContext blocked        | `enableAudio()` sets `audioStatus = "blocked"`         |
| Web Audio not supported     | `enableAudio()` sets `audioStatus = "unsupported"`     |
| GPS permission denied       | `telemetryStatus = "denied"`, simulation continues     |
| GPS not available           | `telemetryStatus = "unavailable"`, simulation continues|
| GPS data stale (>5s)        | `telemetryStatus = "stale"`, GPS speed cleared         |
| Invalid GPS speed (>450)    | Fix silently ignored, no state change                  |
| Invalid dt (non-finite/≤0)  | `DrivingSession.step()` returns without stepping       |
| Shift past gear limits      | Clamped silently to [1, profile.gears]                 |
| Web Bluetooth unsupported   | `BluetoothManager.isSupported = false`, UI hides button|
