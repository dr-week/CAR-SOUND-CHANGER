# Complete Directory Structure

Visual guide to the entire project structure for **Car Sound Changer & Infotainment Launcher**.

---

## 📂 Root Level

```
carSOUNDMOD/
│
├── 📄 README.md                     # Project introduction and overview
├── 📄 PROJECT_OVERVIEW.md           # Complete project guide
├── 📄 INSTALLATION.md               # Setup and installation instructions
├── 📄 CONTRIBUTING.md               # Contribution guidelines
├── 📄 index.html                    # Single page application HTML entry point
├── 📄 vite.config.ts                # Vite build and test configuration
├── 📄 tsconfig.json                 # TypeScript compiler options
├── 📄 package.json                  # Dependencies and npm scripts
├── 📄 .env.example                  # Environment variables template
├── 📄 .gitignore                    # Git ignore rules
│
├── 📁 docs/                         # 📚 System & architectural documentation
├── 📁 src/                          # 💻 Clean Architecture TypeScript/Vue source
└── 📁 public/                       # 🎨 Static web assets
```

---

## 💻 Source Code Directory (`src/`)

Organized strictly according to **Domain-Driven Design (DDD)** and **Clean Architecture**:

```
src/
│
├── 📁 domain/                       # 🎯 Pure Business Logic (Zero Framework Dependencies)
│   ├── 📁 vehicle/                  # Vehicle physics & profiles
│   │   ├── types.ts                # VehicleProfile and VehicleState definitions
│   │   ├── constants.ts            # Gear ratios, physics constants, speed limits
│   │   ├── vehiclePhysics.ts       # stepVehicle physics calculation engine
│   │   ├── carProfiles.ts          # Pre-built car profiles (Brezza, Mustang, Porsche, F1, Supra, etc.)
│   │   └── controls.ts             # DriveAction control input types
│   │
│   ├── 📁 audio/                    # Procedural sound parameters & envelopes
│   │   ├── engineSound.ts          # Timbre profiles, harmonic coefficients, sound parameters
│   │   ├── TurboEnvelope.ts        # Turbo boost & blow-off envelope simulation
│   │   └── combustionTexture.ts    # Engine idle pulse texture calculation
│   │
│   └── 📁 scoring/                  # Driving telemetry evaluation
│       └── greenScore.ts           # Eco-driving scoring algorithm and penalties
│
├── 📁 application/                  # 🔄 Application Services & Use Cases
│   ├── 📁 ports/                    # Inversion interfaces for infrastructure adapters
│   │   ├── EngineSoundOutput.ts    # Interface for audio engines
│   │   └── TelemetryStatus.ts      # Telemetry status types
│   │
│   ├── 📁 services/                 # Application use cases
│   │   └── DrivingSession.ts       # Coordinates vehicle physics, scoring, and audio per frame
│   │
│   └── 📁 composables/              # Vue 3 reactivity bridge
│       └── useVehicleSimulator.ts  # Composable managing rAF loop and reactive state
│
├── 📁 infrastructure/               # 🔌 External Adapters (Browser & Hardware APIs)
│   ├── 📁 audio/                    # Web Audio API procedural synthesis
│   │   ├── WebAudioEngine.ts       # 4-voice oscillator synthesizer & Biquad filters
│   │   └── audioAutomation.ts      # AudioParam linear fade and ramp automation helpers
│   │
│   ├── 📁 telemetry/                # Geolocation tracking
│   │   └── BrowserGeolocation.ts   # Web Geolocation API wrapper with speed calculation
│   │
│   ├── 📁 input/                    # User input adapters
│   │   └── KeyboardInput.ts        # Driving and gear shift key bindings
│   │
│   └── 📁 bluetooth/                # Bluetooth status manager
│       └── BluetoothManager.ts     # Web Bluetooth API connection status adapter
│
├── 📁 composition/                  # 🧱 Composition Root (Dependency Injection)
│   └── createSimulatorRuntime.ts    # Instantiates infrastructure adapters and wires DrivingSession
│
├── 📁 presentation/                 # 👁️ Avant-Garde Landscape UI & Gauges
│   ├── 📁 launcher/                 # Android landscape infotainment launcher modules
│   │   ├── SidebarDock.vue         # 72px left navigation dock with quick view tabs
│   │   ├── InfotainmentHeader.vue  # Top status bar with clock, date, GPS speed & Bluetooth
│   │   └── AppDrawer.vue           # Grid modal displaying installed Android apps
│   │
│   ├── 📁 dashboard/                # Cockpit instrumentation
│   │   └── InstrumentDashboard.vue # Live dual-gauge speedometer & tachometer UI
│   │
│   ├── 📁 components/               # Specialized map & visual components
│   │   └── GoogleMap.vue           # Google Maps JavaScript API integration
│   │
│   └── 📁 styles/                   # Modern Glassmorphic CSS design system
│       └── app.css                 # Custom CSS variables, dark themes, and animations
│
├── 📁 app/                          # Main Application Entry Component
│   └── App.vue                      # Root Vue landscape shell assembly
│
├── 📄 main.ts                       # Application bootstrap file
└── 📄 vite-env.d.ts                 # Vite environment declarations
```

---

## 📚 Documentation Directory (`docs/`)

```
docs/
├── 📄 INDEX.md                      # Documentation hub & sitemap
├── 📄 ARCHITECTURE.md               # System architecture (DDD + Clean Architecture)
├── 📄 API_REFERENCE.md              # Complete API reference for domain & application layers
├── 📄 AUDIO_SYSTEM.md               # Procedural audio engine & synthesis details
├── 📄 BLUETOOTH_AUDIO.md            # Web Bluetooth API integration & audio routing
├── 📄 GEAR_LOGIC.md                 # Gear ratios, RPM calculation & shift points
├── 📄 GPS_INTEGRATION.md            # Geolocation tracking & speed calculation
├── 📄 SOUND_FILES.md                # Audio synthesis specifications & timbre parameters
├── 📄 TESTING.md                    # Vitest unit test suite strategy
├── 📄 UI_DESIGN.md                  # Avant-garde dark glassmorphic design system
├── 📄 TROUBLESHOOTING.md            # Troubleshooting guide & common fixes
├── 📄 CONFIGURATION.md              # Vehicle profiles & environment setup
├── 📄 BUILD_RELEASE.md              # Vite build & deployment instructions
├── 📄 FAQ.md                        # Frequently Asked Questions
├── 📄 CODE_DIVISION_RULES.md        # Code structure guidelines
└── 📄 DEV_WORKFLOW.md               # Git workflow & development rules
```

---

## 📊 Summary Table

| Layer | Path | Responsibility | Framework Depend? |
|-------|------|----------------|-------------------|
| **Domain** | `src/domain/` | Pure physics, audio parameters, eco-scoring | ❌ None (Pure TS) |
| **Application** | `src/application/` | Driving session orchestrator, ports, composables | ❌ Minimal (Vue composable) |
| **Infrastructure**| `src/infrastructure/`| Web Audio, Geolocation, Keyboard, Web Bluetooth | ❌ Browser APIs only |
| **Composition** | `src/composition/` | Dependency injection assembly | ❌ Pure TS |
| **Presentation** | `src/presentation/` | Vue 3 landscape car launcher UI & gauges | ✅ Vue 3 + Vanilla CSS |
