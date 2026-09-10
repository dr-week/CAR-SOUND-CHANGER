# Architecture Overview

Complete system architecture for the Car Sound Changer Android app.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  UI Layer    │  │ State Layer  │  │Service Layer │      │
│  │              │  │              │  │              │      │
│  │ - Screens    │◄─┤ - Zustand    │◄─┤ - GPS        │      │
│  │ - Components │  │ - Store      │  │ - Audio      │      │
│  │ - Gauges     │  │ - Actions    │  │ - Bluetooth  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                  │            │
│         └───────────────────┴──────────────────┘            │
│                             │                               │
├─────────────────────────────┼───────────────────────────────┤
│                    Native Bridge                            │
├─────────────────────────────┼───────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │Android Location│  │Android Audio    │  │Android BT     │ │
│  │Services        │  │Manager          │  │Manager        │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                      │                    │
         ▼                      ▼                    ▼
    [GPS Sensor]          [Audio Output]      [Bluetooth Device]
```

## Core Components

### 1. UI Layer

#### Screens
- **HomeScreen**: Main dashboard with gauges and controls
- **SettingsScreen**: Configuration and preferences
- **AudioDeviceScreen**: Bluetooth device selection and management
- **CalibrationScreen**: Gear ratio and shift point tuning

#### Components
- **RPMGauge**: Circular RPM gauge (0-6000 RPM range)
- **SpeedoMeter**: Digital/analog speedometer
- **GearIndicator**: Current gear display (1-5)
- **AudioDeviceSelector**: Bluetooth device picker
- **VolumeControl**: Audio volume slider
- **ShiftIndicator**: Visual shift point indicator

### 2. State Management (Zustand)

```typescript
interface AppState {
  // Vehicle State
  speed: number;              // km/h
  currentGear: number;        // 1-5
  rpm: number;                // Current RPM
  isMoving: boolean;
  
  // Audio State
  volume: number;             // 0-1
  isMuted: boolean;
  connectedDevice: BluetoothDevice | null;
  audioOutput: 'phone' | 'bluetooth' | 'wired';
  
  // GPS State
  gpsEnabled: boolean;
  gpsAccuracy: number;
  latitude: number;
  longitude: number;
  
  // App State
  isRunning: boolean;
  isBackgroundMode: boolean;
  
  // Settings
  shiftRPM: number;           // 1500-2000
  gearRatios: number[];       // Speed thresholds for each gear
}
```

### 3. Service Layer

#### GPS Service
```typescript
class GPSService {
  - startTracking()
  - stopTracking()
  - getCurrentSpeed(): number
  - onSpeedChange(callback: (speed: number) => void)
  - getAccuracy(): number
}
```

**Flow**:
1. Request location permissions
2. Start GPS tracking with high accuracy
3. Calculate speed from position changes
4. Update every 100ms for responsive feedback
5. Filter noise with moving average

#### Audio Service
```typescript
class AudioService {
  - loadSounds(gear: number): Promise<void>
  - playEngineSound(rpm: number, gear: number): void
  - adjustPitch(rpm: number): void
  - setVolume(volume: number): void
  - switchOutput(device: AudioDevice): void
  - getConnectedDevices(): BluetoothDevice[]
}
```

**Flow**:
1. Load sound files for all gears
2. Play appropriate gear sound based on current gear
3. Adjust pitch/playback rate based on RPM
4. Handle gear transitions smoothly
5. Route to selected audio output

#### Bluetooth Service
```typescript
class BluetoothService {
  - scanDevices(): Promise<BluetoothDevice[]>
  - connectDevice(device: BluetoothDevice): Promise<void>
  - disconnectDevice(): void
  - getConnectedDevice(): BluetoothDevice | null
  - onDeviceConnected(callback: (device) => void)
  - onDeviceDisconnected(callback: () => void)
  - routeAudioToBluetooth(): void
}
```

**Flow**:
1. Scan for paired Bluetooth devices
2. Filter for audio-capable devices
3. Connect to selected device
4. Route media audio to Bluetooth
5. Monitor connection status

#### Gear Logic Service
```typescript
class GearLogicService {
  - calculateGear(speed: number): number
  - calculateRPM(speed: number, gear: number): number
  - shouldShift(rpm: number, gear: number): boolean
  - getShiftPoint(gear: number): number
}
```

**Gear Calculation** (Suzuki Brezza):
```typescript
const GEAR_SPEED_THRESHOLDS = {
  1: [0, 15],      // 0-15 km/h
  2: [15, 30],     // 15-30 km/h
  3: [30, 50],     // 30-50 km/h
  4: [50, 70],     // 50-70 km/h
  5: [70, 999]     // 70+ km/h
};

const SHIFT_RPM = 1750;  // Average of 1500-2000
const IDLE_RPM = 900;
```

**RPM Calculation**:
```typescript
function calculateRPM(speed: number, gear: number): number {
  const [minSpeed, maxSpeed] = GEAR_SPEED_THRESHOLDS[gear];
  const speedRange = maxSpeed - minSpeed;
  const speedInGear = speed - minSpeed;
  const rpmRange = SHIFT_RPM - IDLE_RPM;
  
  return IDLE_RPM + (speedInGear / speedRange) * rpmRange;
}
```

## Data Flow

### Main Loop (60 FPS)

```
1. GPS Update (Every 100ms)
   ↓
2. Speed Extracted
   ↓
3. Calculate Current Gear
   ↓
4. Calculate RPM
   ↓
5. Update State (Zustand)
   ↓
6. Trigger Audio Playback
   ↓
7. Update UI Gauges
   ↓
8. Repeat
```

### Gear Shift Flow

```
Current Speed: 28 km/h, Gear 2, RPM 1950
   ↓
Speed increases to 31 km/h
   ↓
GearLogicService detects threshold crossed
   ↓
Shift to Gear 3
   ↓
RPM drops to 950 (post-shift)
   ↓
AudioService crossfades to Gear 3 sound
   ↓
UI updates gear indicator
```

### Bluetooth Connection Flow

```
User opens Audio Device Screen
   ↓
BluetoothService scans for devices
   ↓
Display list of available devices
   ↓
User selects device
   ↓
Connect to device
   ↓
Route audio to Bluetooth
   ↓
Save preference
   ↓
Auto-reconnect on next launch
```

## Background Service

```typescript
// Background task for continuous operation
BackgroundService.start({
  taskName: 'CarSoundEngine',
  taskTitle: 'Car Sound Mod Running',
  taskDesc: 'Simulating engine sounds',
  taskIcon: { name: 'ic_launcher', type: 'mipmap' },
  parameters: {
    delay: 100 // Update every 100ms
  }
});
```

**Capabilities**:
- Runs when app is minimized
- Continues GPS tracking
- Maintains audio playback
- Shows persistent notification
- Respects battery optimization

## Performance Optimizations

### Audio Optimization
1. **Pre-load all sound files** on app start
2. **Use native audio** (not JS bridge for playback)
3. **Buffer management**: Small buffers for low latency
4. **Pitch shifting**: Native implementation for smooth RPM changes

### GPS Optimization
1. **High accuracy mode** only when moving
2. **Batch updates**: Process every 100ms, not per GPS update
3. **Kalman filtering**: Smooth speed calculations
4. **Distance threshold**: Ignore updates < 1 meter

### UI Optimization
1. **RequestAnimationFrame** for gauge updates
2. **Memoization**: React.memo for expensive components
3. **Virtualization**: For device lists
4. **Throttle**: Limit state updates to 60 FPS

## Security Considerations

1. **Permissions**: Request only when needed
2. **Location Privacy**: No data uploaded to servers
3. **Bluetooth Security**: Only connect to trusted devices
4. **Storage**: No sensitive data stored

## Testing Strategy

- **Unit Tests**: Service layer logic
- **Integration Tests**: GPS + Audio + Gear logic
- **E2E Tests**: Full user flows
- **Performance Tests**: Audio latency, GPS accuracy
- **Device Tests**: Multiple Android versions and devices

## Scalability

### Future Enhancements
- Multiple vehicle profiles
- Custom sound pack support
- Cloud sync for settings
- Social features (share recordings)
- Advanced telemetry logging

---

See also:
- [GPS_INTEGRATION.md](./GPS_INTEGRATION.md)
- [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md)
- [BLUETOOTH_AUDIO.md](./BLUETOOTH_AUDIO.md)
- [GEAR_LOGIC.md](./GEAR_LOGIC.md)
