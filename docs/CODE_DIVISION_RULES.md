# Code Division Rules for Manageable Development

Practical rules and examples for dividing code into manageable, maintainable pieces.

## Core Division Principles

### 1. **Divide by Feature, Not by Type**

```
❌ BAD: Organized by file type
src/
├── components/
│   ├── RPMGauge.tsx
│   ├── AudioControls.tsx
│   ├── BluetoothList.tsx
│   └── SpeedDisplay.tsx
├── services/
│   ├── AudioService.ts
│   ├── GPSService.ts
│   └── BluetoothService.ts
└── hooks/
    ├── useAudio.ts
    ├── useGPS.ts
    └── useBluetooth.ts

✅ GOOD: Organized by feature
src/modules/
├── audio/
│   ├── components/AudioControls.tsx
│   ├── services/AudioService.ts
│   ├── hooks/useAudio.ts
│   └── index.ts
├── gps/
│   ├── components/SpeedDisplay.tsx
│   ├── services/GPSService.ts
│   ├── hooks/useGPS.ts
│   └── index.ts
└── bluetooth/
    ├── components/BluetoothList.tsx
    ├── services/BluetoothService.ts
    ├── hooks/useBluetooth.ts
    └── index.ts
```

**Why?** Features change together, types don't. When updating audio, you modify components, services, and hooks together.

### 2. **Keep Files Small and Focused**

#### Component Size Limits

```typescript
// ❌ BAD: 500-line component
const HomeScreen = () => {
  const [speed, setSpeed] = useState(0);
  const [rpm, setRPM] = useState(0);
  const [gear, setGear] = useState(1);
  const [volume, setVolume] = useState(1);
  const [device, setDevice] = useState(null);
  
  // 100 lines of GPS logic
  useEffect(() => { /* ... */ }, []);
  
  // 100 lines of audio logic
  useEffect(() => { /* ... */ }, []);
  
  // 100 lines of Bluetooth logic
  useEffect(() => { /* ... */ }, []);
  
  // 200 lines of JSX
  return ( /* ... */ );
};

// ✅ GOOD: Divided into focused pieces
const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <VehicleDisplay />
      <AudioControls />
      <BluetoothStatus />
    </SafeAreaView>
  );
};

// Each component < 100 lines, focused on one thing
```

#### Service Size Limits

```typescript
// ❌ BAD: God service (1000+ lines)
class AppService {
  startGPS() {}
  stopGPS() {}
  playAudio() {}
  stopAudio() {}
  connectBluetooth() {}
  disconnectBluetooth() {}
  calculateGear() {}
  calculateRPM() {}
  // ... 50 more methods
}

// ✅ GOOD: Divided by responsibility
class GPSService {
  start() {}
  stop() {}
  getCurrentSpeed() {}
}

class AudioService {
  play() {}
  stop() {}
  setVolume() {}
}

class BluetoothService {
  connect() {}
  disconnect() {}
  getDevices() {}
}

class VehicleService {
  calculateGear() {}
  calculateRPM() {}
}
```

### 3. **Extract Complex Logic**

#### Before: Complex Component

```typescript
// ❌ BAD: Complex logic in component
const RPMGauge = ({ speed }: Props) => {
  const [rpm, setRPM] = useState(0);
  const [gear, setGear] = useState(1);
  
  useEffect(() => {
    // Complex gear calculation (50 lines)
    let calculatedGear = 1;
    if (speed < 15) calculatedGear = 1;
    else if (speed < 30) calculatedGear = 2;
    else if (speed < 50) calculatedGear = 3;
    else if (speed < 70) calculatedGear = 4;
    else calculatedGear = 5;
    
    // Complex RPM calculation (50 lines)
    const gearRatios = { /* ... */ };
    const calculatedRPM = /* complex math */;
    
    setGear(calculatedGear);
    setRPM(calculatedRPM);
  }, [speed]);
  
  return <Gauge value={rpm} />;
};
```

#### After: Extracted Logic

```typescript
// ✅ GOOD: Logic extracted to service
// services/GearLogicService.ts
export class GearLogicService {
  static calculateGear(speed: number): number {
    if (speed < 15) return 1;
    if (speed < 30) return 2;
    if (speed < 50) return 3;
    if (speed < 70) return 4;
    return 5;
  }
  
  static calculateRPM(speed: number, gear: number): number {
    const gearRange = GEAR_SPEED_RANGES[gear];
    const speedInGear = speed - gearRange.min;
    const rangeSize = gearRange.max - gearRange.min;
    return IDLE_RPM + (speedInGear / rangeSize) * (SHIFT_RPM - IDLE_RPM);
  }
}

// hooks/useVehicleState.ts
export const useVehicleState = (speed: number) => {
  const gear = useMemo(() => 
    GearLogicService.calculateGear(speed), [speed]
  );
  
  const rpm = useMemo(() => 
    GearLogicService.calculateRPM(speed, gear), [speed, gear]
  );
  
  return { gear, rpm };
};

// Component: Clean and simple
const RPMGauge = ({ speed }: Props) => {
  const { rpm } = useVehicleState(speed);
  return <Gauge value={rpm} />;
};
```

### 4. **Divide State Management**

#### Bad: Single Giant Store

```typescript
// ❌ BAD: One store for everything
const useAppStore = create((set) => ({
  // GPS
  speed: 0,
  latitude: 0,
  longitude: 0,
  accuracy: 0,
  gpsEnabled: false,
  
  // Audio
  volume: 1,
  isMuted: false,
  currentSound: null,
  isPlaying: false,
  
  // Bluetooth
  connectedDevice: null,
  availableDevices: [],
  isScanning: false,
  
  // Vehicle
  gear: 1,
  rpm: 0,
  isMoving: false,
  
  // UI
  isDarkMode: false,
  showSettings: false,
  
  // Actions (100+ lines)
  setSpeed: (speed) => set({ speed }),
  setVolume: (volume) => set({ volume }),
  // ... 30 more actions
}));
```

#### Good: Divided Stores

```typescript
// ✅ GOOD: Separate stores by domain
// store/gpsStore.ts
export const useGPSStore = create<GPSState>((set) => ({
  speed: 0,
  latitude: 0,
  longitude: 0,
  accuracy: 0,
  isTracking: false,
  
  startTracking: () => set({ isTracking: true }),
  stopTracking: () => set({ isTracking: false }),
  updateLocation: (location) => set(location),
}));

// store/audioStore.ts
export const useAudioStore = create<AudioState>((set) => ({
  volume: 1,
  isMuted: false,
  isPlaying: false,
  
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  play: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false }),
}));

// store/vehicleStore.ts
export const useVehicleStore = create<VehicleState>((set) => ({
  gear: 1,
  rpm: 0,
  
  updateVehicleState: (state) => set(state),
}));
```

### 5. **Separate UI from Logic**

```typescript
// ❌ BAD: Logic mixed with UI
const AudioControls = () => {
  const [volume, setVolume] = useState(1);
  const [device, setDevice] = useState(null);
  
  // Business logic in component
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    AudioService.setVolume(value);
    AsyncStorage.setItem('volume', value.toString());
    
    if (value > 0.8) {
      Alert.alert('Warning', 'High volume!');
    }
  };
  
  const connectBluetooth = async () => {
    const devices = await BluetoothService.scan();
    if (devices.length > 0) {
      await BluetoothService.connect(devices[0]);
      setDevice(devices[0]);
    }
  };
  
  return (
    <View>
      <Slider value={volume} onChange={handleVolumeChange} />
      <Button onPress={connectBluetooth}>Connect</Button>
    </View>
  );
};

// ✅ GOOD: Logic in hook, UI separate
// hooks/useAudioControls.ts
export const useAudioControls = () => {
  const { volume, setVolume } = useAudioStore();
  const { device, connect } = useBluetoothStore();
  
  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
    AudioService.setVolume(value);
    StorageService.saveVolume(value);
    
    if (value > 0.8) {
      AlertService.showWarning('High volume!');
    }
  }, [setVolume]);
  
  const connectDevice = useCallback(async () => {
    await BluetoothService.connectBest();
  }, []);
  
  return { volume, handleVolumeChange, device, connectDevice };
};

// Component: Pure UI
const AudioControls = () => {
  const { volume, handleVolumeChange, device, connectDevice } = useAudioControls();
  
  return (
    <View>
      <Slider value={volume} onChange={handleVolumeChange} />
      <Button onPress={connectDevice}>
        {device ? device.name : 'Connect'}
      </Button>
    </View>
  );
};
```

### 6. **Extract Reusable Components**

```typescript
// ❌ BAD: Duplicated UI code
const RPMGauge = () => (
  <View style={styles.gauge}>
    <Text style={styles.value}>2500</Text>
    <Text style={styles.label}>RPM</Text>
  </View>
);

const SpeedDisplay = () => (
  <View style={styles.gauge}>
    <Text style={styles.value}>65</Text>
    <Text style={styles.label}>km/h</Text>
  </View>
);

const GearIndicator = () => (
  <View style={styles.gauge}>
    <Text style={styles.value}>3</Text>
    <Text style={styles.label}>Gear</Text>
  </View>
);

// ✅ GOOD: Reusable component
// components/ValueDisplay.tsx
interface ValueDisplayProps {
  value: string | number;
  label: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({
  value,
  label,
  size = 'medium',
  color = '#fff',
}) => (
  <View style={[styles.container, styles[size]]}>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

// Usage
<ValueDisplay value={rpm} label="RPM" size="large" />
<ValueDisplay value={speed} label="km/h" size="medium" />
<ValueDisplay value={gear} label="Gear" size="small" />
```

### 7. **Split Large Screens**

```typescript
// ❌ BAD: 500-line screen component
const HomeScreen = () => {
  return (
    <ScrollView>
      {/* 50 lines: Header */}
      <View>{/* ... */}</View>
      
      {/* 100 lines: Gauges */}
      <View>{/* ... */}</View>
      
      {/* 100 lines: Audio controls */}
      <View>{/* ... */}</View>
      
      {/* 100 lines: Settings */}
      <View>{/* ... */}</View>
      
      {/* 150 lines: Bottom navigation */}
      <View>{/* ... */}</View>
    </ScrollView>
  );
};

// ✅ GOOD: Divided into sections
// screens/HomeScreen/HomeScreen.tsx
const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Header />
      <GaugeSection />
      <AudioSection />
      <SettingsSection />
      <BottomNav />
    </ScrollView>
  );
};

// screens/HomeScreen/components/GaugeSection.tsx
export const GaugeSection = () => {
  const { speed } = useGPSTracking();
  const { rpm, gear } = useVehicleState(speed);
  
  return (
    <View style={styles.gauges}>
      <RPMGauge rpm={rpm} />
      <SpeedDisplay speed={speed} />
      <GearIndicator gear={gear} />
    </View>
  );
};

// screens/HomeScreen/components/AudioSection.tsx
export const AudioSection = () => {
  const { volume, setVolume } = useAudioControls();
  
  return (
    <View style={styles.audio}>
      <VolumeSlider value={volume} onChange={setVolume} />
      <AudioDeviceButton />
    </View>
  );
};
```

### 8. **Utility Function Organization**

```typescript
// ❌ BAD: One large utils file
// utils.ts (1000 lines)
export function calculateRPM() {}
export function formatSpeed() {}
export function parseBluetoothName() {}
export function validateAudioFile() {}
export function convertLatLng() {}
// ... 50 more functions

// ✅ GOOD: Divided by domain
// utils/vehicle/rpm.ts
export function calculateRPM(speed: number, gear: number): number {
  // Implementation
}

export function normalizeRPM(rpm: number): number {
  return Math.max(IDLE_RPM, Math.min(MAX_RPM, rpm));
}

// utils/formatting/speed.ts
export function formatSpeed(speed: number, unit: 'kmh' | 'mph'): string {
  const converted = unit === 'mph' ? speed * 0.621371 : speed;
  return `${converted.toFixed(1)} ${unit}`;
}

// utils/bluetooth/parser.ts
export function parseDeviceName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

// utils/audio/validator.ts
export function isValidAudioFile(filename: string): boolean {
  return /\.(wav|mp3|ogg)$/i.test(filename);
}

// utils/gps/converter.ts
export function convertLatLng(lat: number, lng: number): Coordinate {
  return { latitude: lat, longitude: lng };
}
```

### 9. **Type Organization**

```typescript
// ❌ BAD: All types in one file
// types.ts (500 lines)
export interface VehicleState { /* ... */ }
export interface AudioState { /* ... */ }
export interface GPSState { /* ... */ }
export interface BluetoothDevice { /* ... */ }
// ... 50 more types

// ✅ GOOD: Types with their modules
// modules/vehicle/types/index.ts
export interface VehicleState {
  gear: number;
  rpm: number;
  speed: number;
  isMoving: boolean;
}

export interface GearRatio {
  gear: number;
  minSpeed: number;
  maxSpeed: number;
}

// modules/audio/types/index.ts
export interface AudioState {
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  currentSound: string | null;
}

export interface SoundPack {
  id: string;
  name: string;
  sounds: Sound[];
}

// modules/gps/types/index.ts
export interface GPSState {
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  isTracking: boolean;
}
```

### 10. **Configuration Division**

```typescript
// ❌ BAD: One config file
// config.ts (300 lines)
export const GPS_CONFIG = { /* ... */ };
export const AUDIO_CONFIG = { /* ... */ };
export const BLUETOOTH_CONFIG = { /* ... */ };
export const UI_CONFIG = { /* ... */ };
export const APP_CONFIG = { /* ... */ };

// ✅ GOOD: Separate configs
// config/gps.config.ts
export const GPS_CONFIG = {
  updateInterval: 100,
  accuracy: 'high',
  distanceFilter: 1,
} as const;

// config/audio.config.ts
export const AUDIO_CONFIG = {
  sampleRate: 44100,
  bitDepth: 16,
  bufferSize: 2048,
  maxConcurrentSounds: 5,
} as const;

// config/vehicle.config.ts
export const VEHICLE_CONFIG = {
  gearRatios: [15, 30, 50, 70, 999],
  shiftRPM: 2000,
  idleRPM: 900,
  maxRPM: 6000,
} as const;
```

## When to Split Code

### Triggers for Splitting

Split when:
1. **File > 200 lines**: Break into smaller files
2. **Function > 50 lines**: Extract helper functions
3. **Component > 150 lines**: Extract child components
4. **Duplicated code**: Extract to shared util/component
5. **Complex logic**: Extract to service/util
6. **Mixed concerns**: Separate into focused modules

### Example: When to Extract

```typescript
// Starting point: 80 lines - OK
const AudioPlayer = () => {
  // ... implementation
};

// After adding features: 150 lines - Consider splitting
const AudioPlayer = () => {
  // ... more implementation
};

// After more features: 300 lines - MUST split
const AudioPlayer = () => {
  // Too complex! Split now!
};

// After splitting: Multiple focused components
const AudioPlayer = () => <AudioPlayerView {...props} />;
const AudioPlayerView = () => <View><Controls /><Visualizer /></View>;
const Controls = () => {/* ... */};
const Visualizer = () => {/* ... */};
```

## Checklist for Division

Before committing, verify:

- [ ] No file > 200 lines
- [ ] No function > 50 lines
- [ ] No component > 150 lines
- [ ] Each file has single responsibility
- [ ] No duplicated code (DRY principle)
- [ ] Complex logic extracted to services
- [ ] UI separated from business logic
- [ ] Types defined in module
- [ ] Tests can target specific units

## Related Documentation

- [MODULAR_STRUCTURE.md](./MODULAR_STRUCTURE.md) - Module organization
- [DEV_RULES.md](./DEV_RULES.md) - General coding standards
- [REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md) - How to refactor existing code
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Best practices

---

**Remember**: Code is read 10x more than written. Optimize for readability and maintainability!
