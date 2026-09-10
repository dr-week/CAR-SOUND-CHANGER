# Modular Structure & Code Organization

Complete guide for organizing code in a modular, maintainable structure.

## Overview

The project follows a **feature-based modular architecture** where each module is:

- **Self-contained**: Has its own logic, state, and UI
- **Reusable**: Can be used independently
- **Testable**: Easy to test in isolation
- **Scalable**: Easy to add new features

## Project Structure

```
carSOUNDMOD/
├── android/                      # Android native code
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/carsoundmod/
│   │       │   ├── modules/      # Native modules
│   │       │   │   ├── BluetoothModule.java
│   │       │   │   ├── AudioModule.java
│   │       │   │   └── GPSModule.java
│   │       │   └── MainActivity.java
│   │       └── AndroidManifest.xml
│   └── build.gradle
│
├── src/                          # React Native source code
│   ├── modules/                  # Feature modules (main organization)
│   │   ├── audio/               # Audio module
│   │   │   ├── components/      # Audio UI components
│   │   │   ├── hooks/           # Audio hooks
│   │   │   ├── services/        # Audio services
│   │   │   ├── types/           # Audio types
│   │   │   ├── utils/           # Audio utilities
│   │   │   ├── constants.ts     # Audio constants
│   │   │   └── index.ts         # Module exports
│   │   │
│   │   ├── gps/                 # GPS module
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   │
│   │   ├── bluetooth/           # Bluetooth module
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── vehicle/             # Vehicle state/gear logic module
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── ui/                  # UI components module
│   │       ├── components/      # Reusable UI components
│   │       │   ├── Button/
│   │       │   ├── Gauge/
│   │       │   ├── Slider/
│   │       │   └── Card/
│   │       ├── theme/          # Theme configuration
│   │       ├── styles/         # Global styles
│   │       └── index.ts
│   │
│   ├── screens/                 # Screen components
│   │   ├── HomeScreen/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── components/     # Screen-specific components
│   │   │   ├── hooks/          # Screen-specific hooks
│   │   │   └── styles.ts
│   │   ├── SettingsScreen/
│   │   ├── AudioDeviceScreen/
│   │   └── CalibrationScreen/
│   │
│   ├── navigation/              # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── types.ts
│   │   └── routes.ts
│   │
│   ├── store/                   # Global state management
│   │   ├── slices/             # Zustand slices
│   │   │   ├── vehicleSlice.ts
│   │   │   ├── audioSlice.ts
│   │   │   ├── settingsSlice.ts
│   │   │   └── bluetoothSlice.ts
│   │   ├── index.ts            # Combined store
│   │   └── types.ts
│   │
│   ├── services/                # Global services
│   │   ├── BackgroundService.ts
│   │   ├── PermissionService.ts
│   │   └── StorageService.ts
│   │
│   ├── utils/                   # Global utilities
│   │   ├── logger.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   │
│   ├── types/                   # Global type definitions
│   │   ├── index.ts
│   │   └── common.ts
│   │
│   ├── constants/               # Global constants
│   │   ├── config.ts
│   │   ├── colors.ts
│   │   └── dimensions.ts
│   │
│   ├── assets/                  # Static assets
│   │   ├── sounds/             # Audio files
│   │   │   ├── engine/
│   │   │   ├── effects/
│   │   │   └── ambient/
│   │   ├── images/             # Images
│   │   └── fonts/              # Custom fonts
│   │
│   └── App.tsx                  # Root component
│
├── __tests__/                   # Tests
│   ├── unit/                   # Unit tests
│   │   ├── audio/
│   │   ├── gps/
│   │   └── vehicle/
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
│
├── docs/                        # Documentation
│   ├── api/                    # API documentation
│   ├── guides/                 # User guides
│   ├── development/            # Development docs
│   └── architecture/           # Architecture docs
│
├── scripts/                     # Build/utility scripts
│   ├── setup.sh
│   └── build-sounds.js
│
├── .github/                     # GitHub configuration
│   └── workflows/
│
├── package.json
├── tsconfig.json
└── README.md
```

## Module Organization Pattern

Each module follows this structure:

```
module-name/
├── components/           # UI components for this module
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   ├── styles.ts
│   │   └── index.ts
│   └── index.ts
│
├── hooks/               # Custom hooks
│   ├── useModuleFeature.ts
│   ├── useModuleFeature.test.ts
│   └── index.ts
│
├── services/            # Business logic & API calls
│   ├── ModuleService.ts
│   ├── ModuleService.test.ts
│   └── index.ts
│
├── types/               # TypeScript types
│   ├── interfaces.ts
│   ├── enums.ts
│   └── index.ts
│
├── utils/               # Utility functions
│   ├── helper.ts
│   ├── validator.ts
│   └── index.ts
│
├── constants.ts         # Module constants
├── README.md           # Module documentation
└── index.ts            # Public API exports
```

## Module Examples

### Audio Module Structure

```typescript
// src/modules/audio/index.ts
// Public API - only export what's needed outside

export { AudioService } from "./services/AudioService";
export { useAudioPlayer } from "./hooks/useAudioPlayer";
export { AudioControls } from "./components/AudioControls";
export type { AudioState, SoundPack } from "./types";
export { AudioOutput, EngineSound } from "./types";
```

### GPS Module Structure

```typescript
// src/modules/gps/index.ts

export { GPSService } from "./services/GPSService";
export { useGPSTracking } from "./hooks/useGPSTracking";
export { useSpeed } from "./hooks/useSpeed";
export { SpeedDisplay } from "./components/SpeedDisplay";
export type { GPSState, LocationData } from "./types";
```

### Vehicle Module Structure

```typescript
// src/modules/vehicle/index.ts

export { GearLogicService } from "./services/GearLogicService";
export { RPMCalculator } from "./services/RPMCalculator";
export { useVehicleState } from "./hooks/useVehicleState";
export { useGearShift } from "./hooks/useGearShift";
export { GearIndicator } from "./components/GearIndicator";
export { RPMGauge } from "./components/RPMGauge";
export type { VehicleState, GearRatio } from "./types";
```

## Code Division Rules

### 1. **Separation of Concerns**

```typescript
// ❌ BAD: Everything in one file
// HomeScreen.tsx (500 lines)
const HomeScreen = () => {
  // GPS logic
  // Audio logic
  // UI logic
  // Bluetooth logic
  // All mixed together
};

// ✅ GOOD: Separated concerns
// HomeScreen.tsx (50 lines)
const HomeScreen = () => {
  const { speed } = useGPSTracking();
  const { rpm, gear } = useVehicleState(speed);
  const { play } = useAudioPlayer();

  return <HomeView speed={speed} rpm={rpm} gear={gear} />;
};
```

### 2. **Single Responsibility Principle**

Each file should have ONE clear responsibility:

```typescript
// ✅ GOOD: Single responsibility
// GPSService.ts - Only handles GPS
export class GPSService {
  startTracking() {}
  stopTracking() {}
  getCurrentLocation() {}
}

// AudioService.ts - Only handles audio
export class AudioService {
  playSound() {}
  stopSound() {}
  setVolume() {}
}

// GearLogicService.ts - Only handles gear calculations
export class GearLogicService {
  calculateGear() {}
  calculateRPM() {}
  shouldShift() {}
}
```

### 3. **File Size Limits**

- **Components**: Max 150 lines
- **Services**: Max 200 lines
- **Hooks**: Max 100 lines
- **Utils**: Max 50 lines per function

**If exceeded, split into:**

- Multiple smaller components
- Helper functions
- Separate services
- Sub-modules

### 4. **Dependency Rules**

```
┌─────────────────────────────────────────┐
│           UI Layer (Screens)            │
│         Can depend on ↓                 │
├─────────────────────────────────────────┤
│        Components & Hooks               │
│         Can depend on ↓                 │
├─────────────────────────────────────────┤
│       Services (Business Logic)         │
│         Can depend on ↓                 │
├─────────────────────────────────────────┤
│     Utils & Types (Pure Functions)      │
│         No dependencies                 │
└─────────────────────────────────────────┘
```

**Rules:**

- Lower layers CANNOT depend on upper layers
- Modules should NOT depend on each other directly
- Use dependency injection for cross-module communication

```typescript
// ❌ BAD: Service depends on UI component
class AudioService {
  constructor(private gauge: RPMGauge) {} // NO!
}

// ✅ GOOD: Service is independent
class AudioService {
  constructor(private config: AudioConfig) {}

  onRPMChange(callback: (rpm: number) => void) {
    this.callbacks.push(callback);
  }
}
```

### 5. **Module Independence**

Modules should be **loosely coupled**:

```typescript
// ❌ BAD: Tight coupling
// audio/AudioService.ts
import { GPSService } from "../gps/GPSService"; // Direct dependency

class AudioService {
  constructor() {
    this.gps = new GPSService(); // Tightly coupled
  }
}

// ✅ GOOD: Loose coupling via events/hooks
// audio/AudioService.ts
class AudioService {
  playForSpeed(speed: number) {
    // Doesn't know about GPS, just receives speed
  }
}

// App.tsx - Orchestration layer
const App = () => {
  const { speed } = useGPSTracking();
  const audioService = useAudioService();

  useEffect(() => {
    audioService.playForSpeed(speed);
  }, [speed]);
};
```

### 6. **Component Division**

```typescript
// ❌ BAD: Monolithic component
const Dashboard = () => {
  return (
    <View>
      {/* 200 lines of JSX */}
      {/* GPS display */}
      {/* RPM gauge */}
      {/* Gear indicator */}
      {/* Audio controls */}
      {/* Settings */}
    </View>
  );
};

// ✅ GOOD: Divided into smaller components
const Dashboard = () => {
  return (
    <View>
      <GPSDisplay />
      <RPMGauge />
      <GearIndicator />
      <AudioControls />
      <SettingsButton />
    </View>
  );
};

// Each in its own file with clear responsibility
```

### 7. **State Management Division**

```typescript
// ❌ BAD: One giant store
const useStore = create((set) => ({
  // GPS state
  speed: 0,
  location: null,
  // Audio state
  volume: 1,
  isPlaying: false,
  // Bluetooth state
  device: null,
  // Vehicle state
  gear: 1,
  rpm: 0,
  // ... 50 more fields
}));

// ✅ GOOD: Divided into slices
// store/slices/vehicleSlice.ts
export const useVehicleStore = create<VehicleState>((set) => ({
  gear: 1,
  rpm: 0,
  speed: 0,
  // ... vehicle-specific state
}));

// store/slices/audioSlice.ts
export const useAudioStore = create<AudioState>((set) => ({
  volume: 1,
  isPlaying: false,
  // ... audio-specific state
}));
```

## File Naming Conventions

### Components

- **PascalCase**: `RPMGauge.tsx`, `AudioControls.tsx`
- **Test files**: `RPMGauge.test.tsx`
- **Styles**: `RPMGauge.styles.ts` or `styles.ts`

### Services

- **PascalCase**: `AudioService.ts`, `GPSService.ts`
- **Suffix**: Always end with `Service`

### Hooks

- **camelCase**: `useAudioPlayer.ts`, `useGPSTracking.ts`
- **Prefix**: Always start with `use`

### Utils

- **camelCase**: `calculateRPM.ts`, `formatSpeed.ts`
- **Descriptive**: Name after what they do

### Types

- **PascalCase**: `VehicleState.ts`, `AudioConfig.ts`
- **Group by domain**: `types/audio/`, `types/gps/`

### Constants

- **UPPER_SNAKE_CASE**: `MAX_RPM`, `GEAR_RATIOS`
- **File**: `constants.ts` or `config.ts`

## Import Organization

```typescript
// ✅ GOOD: Organized imports
// 1. External libraries
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Internal modules (by feature)
import { useGPSTracking } from "@/modules/gps";
import { useAudioPlayer } from "@/modules/audio";
import { useVehicleState } from "@/modules/vehicle";

// 3. Components
import { RPMGauge } from "@/modules/vehicle/components";
import { Button } from "@/modules/ui/components";

// 4. Types
import type { VehicleState } from "@/modules/vehicle/types";

// 5. Constants & Utils
import { MAX_RPM, SHIFT_RPM } from "@/constants";
import { formatSpeed } from "@/utils";

// 6. Styles (last)
import styles from "./styles";
```

## Module Communication

### Event-Based Communication

```typescript
// ✅ GOOD: Event-based decoupling
// services/EventBus.ts
class EventBus {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }
}

// Usage
// gps/GPSService.ts
eventBus.emit("speed:changed", speed);

// audio/AudioService.ts
eventBus.on("speed:changed", (speed) => {
  this.updateSound(speed);
});
```

## Documentation Requirements

Each module must have:

1. **README.md**: Module overview and usage
2. **API.md**: Public API documentation
3. **EXAMPLES.md**: Code examples
4. **Tests**: Unit tests for all public APIs

## Related Documentation

- [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) - Detailed code division rules
- [DEV_RULES.md](./DEV_RULES.md) - General coding standards
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference

---

**Next**: See [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) for specific division examples.
