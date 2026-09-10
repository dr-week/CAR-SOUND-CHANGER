# Module catalog and folder tree

## Macro architecture

```text
carSOUNDMOD/
├── src/                         # Product source code
│   ├── app/                     # App composition root
│   ├── application/             # Use-case coordination / lifecycle
│   │   └── composables/         # Vue-facing application orchestration
│   │   ├── ports/               # Application-owned integration contracts
│   │   └── services/            # Framework-independent use cases
│   ├── domain/                  # Framework-independent business rules
│   │   ├── vehicle/             # Car profiles, types, physics
│   │   └── scoring/             # Local green-points rules
│   ├── infrastructure/          # Browser and device adapters
│   │   ├── audio/               # Web Audio adapter
│   │   ├── input/               # Keyboard adapter
│   │   └── telemetry/           # GPS; future Bluetooth OBD-II adapter
│   ├── presentation/            # Vue rendering layer
│   │   ├── components/          # Focused reusable components
│   │   └── styles/              # Application visual tokens/styles
│   └── main.ts                  # Vue/PWA bootstrap only
├── tests/                       # Automated checks, mirrors source taxonomy
│   └── unit/domain/
│       ├── vehicle/
│       └── scoring/
│   └── unit/application/        # Application-service tests
├── public/                      # Static PWA assets only
│   ├── icons/
│   ├── manifest.webmanifest
│   └── service-worker.js
├── scripts/                     # Developer/operations automation
│   └── windows/                 # Single-instance Windows launcher
├── docs/                        # Product, architecture, operations docs
│   ├── architecture/            # This authoritative module catalog
│   └── implementation/          # Engineering plan and decisions
├── package.json                 # Dependency and quality command contract
├── tsconfig.json                # Strict TypeScript rules
├── eslint.config.js             # Static analysis rules
└── vite.config.ts               # Build configuration
```

## Micro-module inventory

| Macro module               | Micro module             | Contract                                                |
| -------------------------- | ------------------------ | ------------------------------------------------------- |
| `domain/vehicle`           | `types.ts`               | Shared typed vehicle contracts.                         |
| `domain/vehicle`           | `carProfiles.ts`         | Immutable car-profile catalog.                          |
| `domain/vehicle`           | `vehiclePhysics.ts`      | State construction and deterministic motion/RPM update. |
| `domain/scoring`           | `greenScore.ts`          | Pure eco-score state and calculation policy.            |
| `application/composables`  | `useVehicleSimulator.ts` | Vue lifecycle orchestration; composes dependencies.     |
| `application/ports`        | `EngineSoundOutput.ts`   | Stable contract for an engine-sound implementation.     |
| `application/services`     | `DrivingSession.ts`      | UI-independent driving use case and state coordination. |
| `infrastructure/audio`     | `WebAudioEngine.ts`      | Browser sound-output adapter.                           |
| `infrastructure/input`     | `KeyboardInput.ts`       | Keyboard-to-driving-action adapter.                     |
| `infrastructure/telemetry` | `BrowserGeolocation.ts`  | Permissioned, local GPS-speed adapter.                  |
| `presentation/components`  | `TelemetryPanel.vue`     | Read-only telemetry display.                            |
| `presentation/components`  | `DriveControls.vue`      | Typed control-event emitter.                            |
| `app`                      | `App.vue`                | Screen composition only.                                |

## Folder creation rule

Create a child folder only when it owns at least one concrete responsibility and a source file. Do not create empty `services`, `utils`, `helpers`, `common`, or `misc` folders. New integrations must begin as a named adapter beneath `infrastructure`; new business policy belongs in a named `domain` submodule; reusable interface pieces belong in `presentation/components`.

## Quality commands

| Command         | Gate                                       |
| --------------- | ------------------------------------------ |
| `npm run check` | Strict Vue/TypeScript type check.          |
| `npm run lint`  | TypeScript and Vue static analysis.        |
| `npm run test`  | Deterministic unit tests for domain rules. |
| `npm run build` | Production PWA bundle.                     |
