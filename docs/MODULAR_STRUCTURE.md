# Modular Structure & Code Organisation

The complete, accurate reference for how this project is organised.  
Last updated: reflects current file tree after full modularisation.

---

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  Presentation  (Vue components — read/write reactive state)     │
├─────────────────────────────────────────────────────────────────┤
│  Application   (use-cases, composables, ports, bootstrap)       │
├─────────────────────────────────────────────────────────────────┤
│  Domain        (pure TS business logic — no framework imports)  │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure (adapters — Web Audio, Geolocation, Bluetooth)  │
└─────────────────────────────────────────────────────────────────┘
       ↑ Composition Root wires infra → application (one file)
```

Dependency arrows always point **inward** — presentation depends on application, application depends on domain.  
Infrastructure implements ports defined by the application layer.

---

## Full Folder Tree

```
carSOUNDMOD/
│
├── src/
│   │
│   ├── shared/                           ← Cross-layer utilities
│   │   ├── constants/
│   │   │   └── index.ts                 ← PREFS_STORAGE_KEY, MAX_DISPLAY_SPEED_KPH, GPS_STALE_AFTER_MS…
│   │   ├── types/
│   │   │   └── index.ts                 ← Cleanup, Listener<T>, Range, Mutable<T>…
│   │   └── index.ts                     ← Barrel: re-exports constants + types
│   │
│   ├── domain/                           ← Pure business logic (no Vue, no DOM)
│   │   ├── vehicle/
│   │   │   ├── types.ts                 ← VehicleProfile, VehicleState interfaces
│   │   │   ├── constants.ts             ← GEAR_RATIOS, physics tuning constants
│   │   │   ├── controls.ts              ← DriveAction union type
│   │   │   ├── carProfiles.ts           ← CAR_PROFILES (Brezza, Mustang, Porsche, F1)
│   │   │   ├── vehiclePhysics.ts        ← createVehicleState(), stepVehicle()
│   │   │   ├── __tests__/
│   │   │   │   └── vehiclePhysics.spec.ts
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel (exports all above)
│   │   │
│   │   ├── scoring/
│   │   │   ├── greenScore.ts            ← GreenScore, createGreenScore, updateGreenScore
│   │   │   ├── __tests__/
│   │   │   │   └── greenScore.spec.ts
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   └── index.ts                     ← Barrel: re-exports vehicle + scoring
│   │
│   ├── application/                      ← Orchestration; may import domain + ports
│   │   ├── ports/
│   │   │   ├── EngineSoundOutput.ts     ← Interface: setProfile, update
│   │   │   ├── TelemetryStatus.ts       ← Type: "inactive"|"active"|"denied"…
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   ├── services/
│   │   │   ├── DrivingSession.ts        ← setControl, shift, step, reset, selectProfile
│   │   │   ├── __tests__/
│   │   │   │   └── DrivingSession.spec.ts
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   ├── composables/
│   │   │   ├── useVehicleSimulator.ts   ← Vue composable; owns reactive state + rAF loop
│   │   │   └── index.ts                 ← Barrel (exports useVehicleSimulator, AudioStatus)
│   │   │
│   │   ├── bootstrap/
│   │   │   └── index.ts                 ← detectCapabilities, loadPreferences, savePreferences
│   │   │
│   │   ├── controllers/                  ← (reserved — empty placeholder)
│   │   └── index.ts                     ← Barrel: re-exports ports + services + composables + bootstrap
│   │
│   ├── infrastructure/                   ← Browser API adapters; implement application ports
│   │   ├── audio/
│   │   │   ├── WebAudioEngine.ts        ← 4-voice additive synthesis; implements EngineSoundOutput
│   │   │   ├── __tests__/
│   │   │   │   └── WebAudioEngine.spec.ts
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   ├── bluetooth/
│   │   │   ├── BluetoothManager.ts      ← Web Bluetooth API; connection state machine
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel (BluetoothManager, BluetoothStatus)
│   │   │
│   │   ├── input/
│   │   │   ├── KeyboardInput.ts         ← W/S/1/2 key bindings; blur-safe
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   ├── telemetry/
│   │   │   ├── BrowserGeolocation.ts   ← watchPosition + stale detection
│   │   │   ├── README.md
│   │   │   └── index.ts                 ← Barrel
│   │   │
│   │   └── index.ts                     ← Barrel: re-exports all adapters
│   │
│   ├── composition/
│   │   ├── createSimulatorRuntime.ts   ← ONLY file that wires infra → application
│   │   └── index.ts                     ← Barrel
│   │
│   ├── presentation/                    ← Vue 3 components; no business logic
│   │   ├── components/
│   │   │   ├── DriveControls.vue       ← W/S buttons, up/downshift, reset
│   │   │   ├── GearDisplay.vue         ← Current gear badge
│   │   │   ├── SpeedDisplay.vue        ← Speed + GPS/Simulation badge
│   │   │   ├── SpeedometerGauge.vue    ← vue-speedometer speedometer
│   │   │   ├── StatusIndicators.vue    ← 4-badge row: audio/source/eco/BT
│   │   │   ├── VehicleTachometer.vue   ← vue-speedometer RPM tachometer (3 zones)
│   │   │   └── index.ts                ← Barrel (all 6 components as named exports)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── InstrumentDashboard.vue ← Composed layout: tacho + speedo + controls + BT
│   │   │   └── index.ts                ← Barrel
│   │   │
│   │   └── styles/
│   │       └── app.css                 ← Global dark theme, CSS custom properties
│   │
│   ├── app/
│   │   └── App.vue                     ← Root Vue component; instantiates composable + Bluetooth
│   │
│   ├── main.ts                         ← createApp + service worker registration
│   └── vite-env.d.ts                   ← Vite type shims
│
├── tests/
│   └── unit/                           ← Legacy test location (kept for CI compatibility)
│       ├── application/DrivingSession.spec.ts
│       ├── domain/scoring/greenScore.spec.ts
│       ├── domain/vehicle/vehiclePhysics.spec.ts
│       └── infrastructure/audio/WebAudioEngine.spec.ts
│
├── docs/
│   ├── ARCHITECTURE.md                 ← DDD layers, data flow, dependency diagram
│   ├── API_REFERENCE.md                ← All public interfaces and methods
│   ├── DEV_RULES.md                    ← TypeScript standards, naming, DDD rules
│   ├── GEAR_LOGIC.md                   ← Suzuki Brezza specs, RPM formulas
│   ├── SOUND_FILES.md                  ← Synthesis approach, audio specs
│   ├── TESTING.md                      ← Test strategy, coverage goals
│   ├── MODULAR_STRUCTURE.md            ← This file
│   ├── CODE_DIVISION_RULES.md
│   ├── AUDIO_SYSTEM.md
│   ├── BLUETOOTH_AUDIO.md
│   ├── GPS_INTEGRATION.md
│   ├── DEV_WORKFLOW.md
│   ├── INDEX.md
│   ├── TASKS.md
│   ├── UI_DESIGN.md
│   ├── architecture/
│   │   └── MODULE_CATALOG.md
│   ├── getting-started/
│   │   ├── CONCEPTS.md
│   │   ├── QUICK_START.md
│   │   └── TUTORIAL.md
│   └── implementation/
│       ├── ARCHITECTURE.md
│       ├── COMPLETION_PLAN.md
│       ├── ENGINEERING_PLAN.md
│       ├── OPEN_SOURCE_AND_PRIVACY.md
│       └── (planning/audit MDs moved here)
│
├── public/
│   ├── icons/icon.svg
│   └── manifest.webmanifest
│
├── scripts/
│   └── build/offlinePlugin.ts          ← Vite plugin: generates service-worker.js
│
├── index.html
├── vite.config.ts                      ← @/ alias → src/, Vite + offlinePlugin
├── tsconfig.json                       ← Strict, @/ paths, includes src + tests
├── package.json
├── eslint.config.js
└── .prettierrc.json
```

---

## Barrel Pattern

Every folder exposes an `index.ts` that re-exports its public surface.

### Why Barrels?

```ts
// Without barrels (fragile, verbose)
import { createVehicleState } from '../../domain/vehicle/vehiclePhysics';
import { CAR_PROFILES }        from '../../domain/vehicle/carProfiles';
import { VehicleProfile }      from '../../domain/vehicle/types';

// With barrels (clean, refactor-safe)
import { createVehicleState, CAR_PROFILES } from '@/domain/vehicle';
import type { VehicleProfile }              from '@/domain/vehicle';
```

When you move a file inside a module, only `index.ts` needs updating — consumers don't break.

### Barrel Rule

```
✅ Import from barrel:    import { X } from '@/domain/vehicle'
✅ Import from file:      import { X } from './vehiclePhysics'  (within same module)
❌ Reach inside:          import { X } from '@/domain/vehicle/vehiclePhysics'  (fragile)
```

---

## Layer Import Rules (Divide & Rule)

```
Presentation  →  can import from: application, shared
Application   →  can import from: domain, shared (and define ports)
Infrastructure→  can import from: application/ports, domain, shared
Domain        →  can import from: shared only
Composition   →  can import from: ALL layers (it's the wiring point)
shared/       →  no imports from other src/ layers
```

### Violations to avoid

```ts
// ❌ Domain importing from application
// src/domain/vehicle/vehiclePhysics.ts
import { DrivingSession } from '@/application/services/DrivingSession'; // WRONG

// ❌ Presentation importing infrastructure directly
// src/app/App.vue
import { BrowserGeolocation } from '@/infrastructure/telemetry'; // WRONG in App (OK in composition root)

// ✅ Correct: Presentation uses composable
import { useVehicleSimulator } from '@/application/composables';
```

---

## Module Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| File (TypeScript) | PascalCase | `DrivingSession.ts` |
| File (Vue component) | PascalCase | `VehicleTachometer.vue` |
| File (composable) | camelCase prefixed `use` | `useVehicleSimulator.ts` |
| File (test) | same as source + `.spec` | `vehiclePhysics.spec.ts` |
| Barrel file | always `index.ts` | `index.ts` |
| Folder | camelCase | `domain/vehicle/` |
| Class | PascalCase | `WebAudioEngine` |
| Interface | PascalCase | `VehicleProfile` |
| Type alias | PascalCase | `DriveAction` |
| Function | camelCase | `createVehicleState` |
| Constant | UPPER_SNAKE_CASE | `GEAR_RATIOS` |
| Vue composable | `useXxx` | `useVehicleSimulator` |

---

## Adding a New Feature (Checklist)

1. **Domain** — add interfaces to `types.ts`, pure logic to a new `.ts` file
2. **Barrel** — export from `domain/your-module/index.ts`
3. **Port** — if infra is needed, define an interface in `application/ports/`
4. **Service** — orchestrate in `application/services/`
5. **Adapter** — implement port in `infrastructure/your-adapter/`
6. **Wire** — connect in `composition/createSimulatorRuntime.ts`
7. **Composable** — expose reactive state via `application/composables/`
8. **Component** — consume composable in `presentation/`
9. **Tests** — co-located `__tests__/` in each module folder
10. **README** — update the module's `README.md`

---

## Path Alias

`@/` resolves to `src/` — configured in both `vite.config.ts` and `tsconfig.json`.

```ts
import { useVehicleSimulator } from '@/application/composables';
import { CAR_PROFILES }        from '@/domain/vehicle';
import { WebAudioEngine }      from '@/infrastructure/audio';
```

---

## Related Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Layer diagram, data flow
- [DEV_RULES.md](./DEV_RULES.md) — TypeScript standards
- [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) — Division examples
- [API_REFERENCE.md](./API_REFERENCE.md) — All public APIs
- [TESTING.md](./TESTING.md) — Test strategy and coverage targets
