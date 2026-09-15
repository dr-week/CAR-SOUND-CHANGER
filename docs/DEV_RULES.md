# Development Rules & Standards

TypeScript, Vue 3, and DDD/Clean Architecture coding standards for the Car Sound Changer project.

## Table of Contents

1. [TypeScript Rules](#typescript-rules)
2. [Vue 3 Composition API Rules](#vue-3-composition-api-rules)
3. [Naming Conventions](#naming-conventions)
4. [DDD/Clean Architecture Rules](#dddclean-architecture-rules)
5. [File Organization](#file-organization)
6. [Testing Standards](#testing-standards)
7. [Code Review Checklist](#code-review-checklist)

---

## TypeScript Rules

### 1. Strict Mode (Always Enabled)

**tsconfig.json must have**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. Type Annotations

❌ **BAD**: No type annotations
```typescript
const speed = 50;
const gear = 1;
function calculateRPM(speed, gear) {
  return speed * gear;
}
```

✅ **GOOD**: Complete type annotations
```typescript
const speed: number = 50;
const gear: number = 1;

function calculateRPM(speed: number, gear: number): number {
  return speed * gear;
}

// Or with explicit types
const speed = 50 as const; // Type: 50
const speedData: { value: number; unit: string } = {
  value: 50,
  unit: 'km/h'
};
```

### 3. Interfaces vs Types

Use **interfaces** for object contracts:
```typescript
// ✅ GOOD: Interface for objects
interface VehicleState {
  speed: number;
  gear: number;
  rpm: number;
  isMoving: boolean;
}

interface GearRatio {
  gear: number;
  minSpeed: number;
  maxSpeed: number;
}
```

Use **types** for unions and primitives:
```typescript
// ✅ GOOD: Type for unions
type GearNumber = 1 | 2 | 3 | 4 | 5;
type AudioOutput = 'phone' | 'bluetooth' | 'wired';
type SpeedUnit = 'kmh' | 'mph';

// ✅ GOOD: Type for function signature
type SpeedCalculator = (distance: number, time: number) => number;
```

### 4. Avoid `any` Type

❌ **BAD**: Using `any`
```typescript
function playSound(data: any) {
  data.play();
}

const result: any = someFunction();
```

✅ **GOOD**: Specific types
```typescript
interface AudioBuffer {
  play(): void;
  stop(): void;
}

function playSound(data: AudioBuffer) {
  data.play();
}

interface FunctionResult {
  success: boolean;
  data?: unknown;
  error?: Error;
}

const result: FunctionResult = someFunction();
```

### 5. Readonly and Const

Use `as const` for constants:
```typescript
// ✅ GOOD
const GEAR_RATIOS = [15, 30, 50, 70, 999] as const;
type GearSpeed = typeof GEAR_RATIOS; // Type: readonly [15, 30, 50, 70, 999]

const CONFIG = {
  shiftRPM: 1800,
  idleRPM: 900,
  maxRPM: 6000
} as const;
```

Use `readonly` for properties:
```typescript
// ✅ GOOD
interface VehicleProfile {
  readonly make: string;
  readonly model: string;
  readonly year: number;
  speed: number; // Can change
}
```

### 6. Generics

Use generics for reusable code:
```typescript
// ✅ GOOD: Generic function
function getOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

// ✅ GOOD: Generic interface
interface Container<T> {
  value: T;
  get(): T;
  set(value: T): void;
}

// ✅ GOOD: Generic with constraints
function calculateAverage<T extends number[]>(values: T): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
```

---

## Vue 3 Composition API Rules

### 1. Script Setup Syntax (Recommended)

✅ **GOOD**: Use `<script setup>`
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  rpm: number;
  maxRPM: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxRPM: 6000
});

const emit = defineEmits<{
  update: [rpm: number];
}>();

const displayRPM = computed(() => props.rpm.toFixed(0));

const handleChange = (newRPM: number) => {
  emit('update', newRPM);
};
</script>

<template>
  <div class="gauge">
    <div class="value">{{ displayRPM }}</div>
    <button @click="() => handleChange(props.rpm + 100)">
      Increase
    </button>
  </div>
</template>

<style scoped>
.gauge {
  border: 1px solid #ddd;
  padding: 20px;
}
</style>
```

### 2. Reactive State Management

❌ **BAD**: Unnecessary reactivity
```typescript
const speed = ref(0);
const gear = ref(1);
const rpm = ref(900);

// Computing based on reactive refs
const displayData = computed(() => {
  return {
    speed: speed.value,
    gear: gear.value,
    rpm: rpm.value
  };
});
```

✅ **GOOD**: Minimal reactive refs
```typescript
const state = reactive({
  speed: 0,
  gear: 1,
  rpm: 900
});

// Direct access (no .value needed)
const displayData = computed(() => ({
  ...state
}));
```

### 3. Lifecycle Hooks

```typescript
import { onMounted, onUnmounted, onUpdated } from 'vue';

// ✅ GOOD: Use hooks for side effects
onMounted(() => {
  // Initialize component
  gpsService.start();
});

onUnmounted(() => {
  // Cleanup
  gpsService.stop();
});

onUpdated(() => {
  // Update after DOM change
  updateGauge();
});
```

### 4. Props & Emits

```typescript
// ✅ GOOD: Type-safe props and emits
interface Props {
  rpm: number;
  gear: 1 | 2 | 3 | 4 | 5;
  isRunning?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isRunning: false
});

const emit = defineEmits<{
  'gear-change': [newGear: number];
  'speed-update': [speed: number];
}>();

// Usage
emit('gear-change', 3);
```

### 5. Watch and WatchEffect

```typescript
import { watch, watchEffect } from 'vue';

// ✅ GOOD: Watch specific value
watch(() => props.speed, (newSpeed, oldSpeed) => {
  if (newSpeed > oldSpeed) {
    accelerate();
  }
});

// ✅ GOOD: Watch multiple
watch([() => props.speed, () => props.gear], ([speed, gear]) => {
  updateRPM(speed, gear);
});

// ✅ GOOD: WatchEffect for tracking dependencies
watchEffect(() => {
  // Runs whenever referenced reactive values change
  updateDisplay(state.rpm, state.gear);
});
```

---

## Naming Conventions

### 1. Variables & Constants

```typescript
// ✅ GOOD
const maxRPM = 6000; // camelCase for variables
const IDLE_RPM = 900; // UPPER_SNAKE_CASE for constants
const isMoving = true; // Boolean prefix: is/has/can
const errorMessage = 'GPS not available'; // Descriptive names

// ❌ BAD
const maxrpm = 6000; // Wrong case
const m = true; // Too short
const data = { /* ... */ }; // Too generic
```

### 2. Functions & Methods

```typescript
// ✅ GOOD: Verb + Noun
function calculateRPM(speed: number, gear: number): number {}
function isValidGear(gear: number): boolean {}
function handleSpeedChange(newSpeed: number): void {}
function formatSpeed(speed: number, unit: string): string {}

// ❌ BAD
function rpm(speed, gear) {} // Noun instead of verb
function calc() {} // Too short
function doSomething() {} // Not descriptive
```

### 3. Vue Components

```typescript
// ✅ GOOD: PascalCase with descriptive names
// RPMGauge.vue
// SpeedDisplay.vue
// GearIndicator.vue
// AudioControls.vue

// ❌ BAD
// rpm.vue // Too short
// Component.vue // Too generic
// myComponent.vue // camelCase
```

### 4. Hooks

```typescript
// ✅ GOOD: useXxx pattern
export function useVehicleState() {}
export function useAudioControls() {}
export function useGPSTracking() {}

// ❌ BAD
export function vehicleState() {} // Missing 'use'
export function getVehicleState() {} // Use 'use' not 'get'
```

### 5. Services & Classes

```typescript
// ✅ GOOD: PascalCase, Xxx + Service/Manager
export class GPSService {}
export class AudioService {}
export class BluetoothManager {}
export class VehiclePhysics {}

// ❌ BAD
export class gpsService {} // Lowercase
export class GPS {} // Too short
export class Service {} // Too generic
```

### 6. Types & Interfaces

```typescript
// ✅ GOOD: PascalCase with descriptive names
interface VehicleState {}
interface GearRatio {}
interface AudioBuffer {}
type SpeedUnit = 'kmh' | 'mph';
enum GearNumber { First = 1, Second = 2, ... }

// ❌ BAD
interface Vehicle {} // Too generic
type speed = number; // Lowercase, too generic
enum Gear {} // Should be more specific
```

### 7. Boolean Variables

Always use `is`, `has`, `can` prefix:
```typescript
// ✅ GOOD
const isMoving = true;
const hasPermission = true;
const canShift = false;
const isConnected = true;
const hasBluetooth = true;

// ❌ BAD
const moving = true; // Missing prefix
const permission = true; // Unclear
const shift = false; // Unclear
```

---

## DDD/Clean Architecture Rules

### 1. Layer Isolation

```typescript
// ❌ BAD: Presentation imports from Infrastructure
// presentation/RPMGauge.vue
import { WebAudioEngine } from '@/infrastructure/audio/WebAudioEngine';

// ❌ BAD: Application imports from Presentation
// application/services/AudioService.ts
import { RPMGauge } from '@/presentation/components/RPMGauge.vue';

// ✅ GOOD: Dependency direction
// Presentation uses Application
import { useVehicleSimulator } from '@/application/composables/useVehicleSimulator';

// Application uses Domain & Ports
import { calculateRPM } from '@/domain/vehicle/vehiclePhysics';
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';

// Infrastructure implements Ports
export class WebAudioEngine implements EngineSoundOutput {}
```

### 2. Domain Layer (Pure Business Logic)

Must NOT import from any other layer:

```typescript
// ✅ GOOD: Domain logic only
// domain/vehicle/vehiclePhysics.ts
export function calculateRPM(speed: number, gear: number): number {
  // Pure math, no imports
  return (speed / MAX_SPEED) * 2000;
}

// ❌ BAD: Domain uses other layers
import { WebAudioEngine } from '@/infrastructure/audio'; // WRONG!
import { logger } from '@/utils/logger'; // WRONG!
```

### 3. Application Layer (Orchestration)

Can use Domain and Ports (interfaces):

```typescript
// ✅ GOOD: Uses Domain and Ports
// application/services/DrivingSession.ts
import { calculateRPM, calculateGear } from '@/domain/vehicle/vehiclePhysics';
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';

export class DrivingSession {
  constructor(private soundOutput: EngineSoundOutput) {}

  onSpeedUpdate(speed: number) {
    const rpm = calculateRPM(speed, this.gear);
    this.soundOutput.playEngineSound({ rpm, gear: this.gear });
  }
}

// ❌ BAD: Uses Infrastructure directly
import { WebAudioEngine } from '@/infrastructure/audio'; // WRONG!
this.soundOutput = new WebAudioEngine(); // WRONG! Use dependency injection
```

### 4. Infrastructure Layer (Adapters)

Implements Ports from Application:

```typescript
// ✅ GOOD: Implements Port interface
// infrastructure/audio/WebAudioEngine.ts
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';

export class WebAudioEngine implements EngineSoundOutput {
  playEngineSound(params: { rpm: number; gear: number }): void {
    // Web Audio API implementation
  }
}

// ❌ BAD: Doesn't implement Port
export class WebAudioEngine {
  play(rpm: number) {} // Wrong signature
}
```

### 5. Presentation Layer (Vue Components)

Uses Application via Composables and Services:

```typescript
// ✅ GOOD: Uses Application layer composable
// presentation/components/RPMGauge.vue
<script setup lang="ts">
import { useVehicleSimulator } from '@/application/composables/useVehicleSimulator';

const { rpm, speed, gear } = useVehicleSimulator();
</script>

// ❌ BAD: Uses Domain or Infrastructure directly
import { calculateRPM } from '@/domain/vehicle/vehiclePhysics'; // WRONG!
import { WebAudioEngine } from '@/infrastructure/audio/WebAudioEngine'; // WRONG!
```

---

## File Organization

### 1. Single Responsibility Per File

```typescript
// ✅ GOOD: Each file has one concern
// domain/vehicle/vehiclePhysics.ts
export function calculateRPM() {}
export function calculateGear() {}

// ❌ BAD: Mixed concerns in one file
// domain/vehicle/vehicle.ts
export function calculateRPM() {}
export function calculateGear() {}
export function playSound() {} // Wrong layer!
export function saveSettings() {} // Wrong layer!
```

### 2. File Size Limits

- **Component files**: Max 150 lines
- **Service files**: Max 200 lines
- **Utility functions**: Max 50 lines per function
- **Test files**: Same as source

If exceeded, split into smaller files.

### 3. Import Order

```typescript
// ✅ GOOD: Organized imports
import { defineComponent, ref } from 'vue'; // 1. External libraries
import { calculateRPM } from '@/domain/vehicle/vehiclePhysics'; // 2. Domain
import type { AudioOutput } from '@/application/ports/AudioOutput'; // 3. Ports
import { WebAudioEngine } from '@/infrastructure/audio/WebAudioEngine'; // 4. Infrastructure
import { RPMGauge } from '@/presentation/components/RPMGauge.vue'; // 5. Presentation
import { SHIFT_RPM } from '@/constants'; // 6. Constants
import { formatSpeed } from '@/utils'; // 7. Utilities
import styles from './styles.css'; // 8. Styles
```

### 4. Exports

Always use named exports, avoid default exports:

```typescript
// ✅ GOOD: Named exports
export function calculateRPM() {}
export interface VehicleState {}
export class GPSService {}

// ❌ BAD: Default export
export default function calculateRPM() {}
export default { calculateRPM };

// Exception: Vue components can use default
export default defineComponent({})
```

---

## Testing Standards

### 1. Test File Location

```
src/
├── domain/vehicle/
│   ├── vehiclePhysics.ts
│   └── __tests__/
│       └── vehiclePhysics.test.ts
├── application/services/
│   ├── DrivingSession.ts
│   └── __tests__/
│       └── DrivingSession.test.ts
└── presentation/components/
    ├── RPMGauge.vue
    └── __tests__/
        └── RPMGauge.spec.ts
```

### 2. Test Naming

```typescript
// ✅ GOOD: Describe → it structure
describe('calculateRPM', () => {
  it('should return idle RPM at 0 speed', () => {});
  it('should return max RPM at max speed', () => {});
  it('should throw error for negative speed', () => {});
});

// ❌ BAD: Vague names
describe('tests', () => {
  it('works', () => {});
  it('test 2', () => {});
});
```

### 3. Test Structure (AAA)

```typescript
// ✅ GOOD: Arrange-Act-Assert
it('should calculate correct RPM', () => {
  // Arrange
  const speed = 30;
  const gear = 2;
  const expectedRPM = 1200;

  // Act
  const actualRPM = calculateRPM(speed, gear);

  // Assert
  expect(actualRPM).toEqual(expectedRPM);
});
```

### 4. Coverage Goals

- **Domain Layer**: 90%+ coverage (critical business logic)
- **Application Layer**: 80%+ coverage (services)
- **Infrastructure**: 70%+ coverage (adapters may be harder to test)
- **Presentation**: 60%+ coverage (component-specific testing)

---

## Code Review Checklist

Before submitting a PR:

- [ ] **TypeScript**: All code has proper type annotations
- [ ] **No `any` types**: Unless absolutely necessary with `// @ts-expect-error`
- [ ] **Naming**: Follow conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
- [ ] **DDD**: Correct layer organization
- [ ] **Imports**: Follow correct dependency direction
- [ ] **Files**: Single responsibility, under size limits
- [ ] **Tests**: New code has tests, coverage > 80%
- [ ] **Comments**: Complex logic has explanations
- [ ] **No console.log**: Use proper logging
- [ ] **No magic numbers**: Use named constants
- [ ] **No duplication**: DRY principle followed
- [ ] **Linter**: `npm run lint` passes
- [ ] **Build**: `npm run build` succeeds
- [ ] **Tests**: `npm run test` passes

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [MODULAR_STRUCTURE.md](./MODULAR_STRUCTURE.md) - Code organization
- [TESTING.md](./TESTING.md) - Testing strategies
- [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) - Code division examples

