# Complete Directory Structure

Visual guide to the entire project structure with descriptions.

## 📂 Root Level

```
carSOUNDMOD/
│
├── 📄 README.md                     # Project introduction and overview
├── 📄 PROJECT_OVERVIEW.md           # Complete project guide with navigation
├── 📄 INSTALLATION.md               # Setup and installation instructions
├── 📄 CONTRIBUTING.md               # Contribution guidelines
├── 📄 LICENSE                       # MIT License
├── 📄 DIRECTORY_STRUCTURE.md        # This file
│
├── 📄 package.json                  # Node.js dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .prettierrc                   # Prettier configuration
├── 📄 .gitignore                    # Git ignore rules
├── 📄 app.json                      # React Native app configuration
│
├── 📁 docs/                         # 📚 All project documentation
├── 📁 src/                          # 💻 Source code
├── 📁 android/                      # 🤖 Android native code
├── 📁 __tests__/                    # 🧪 Test files
├── 📁 scripts/                      # 🛠️ Build and utility scripts
└── 📁 .github/                      # ⚙️ GitHub configuration
```

---

## 📚 Documentation Directory (`docs/`)

```
docs/
│
├── 📄 INDEX.md                      # Documentation navigation hub
│
├── 📁 getting-started/              # For new developers
│   ├── QUICK_START.md              # Quick start guide
│   ├── TUTORIAL.md                 # Step-by-step tutorial
│   └── CONCEPTS.md                 # Core concepts explained
│
├── 📁 architecture/                 # System design documents
│   ├── ARCHITECTURE.md             # Overall architecture
│   ├── MODULAR_STRUCTURE.md        # Module organization
│   ├── CODE_DIVISION_RULES.md      # Code division patterns
│   ├── DATA_FLOW.md                # Data flow diagrams
│   └── STATE_MANAGEMENT.md         # State management strategy
│
├── 📁 technical/                    # Technical implementation guides
│   ├── GPS_INTEGRATION.md          # GPS and location tracking
│   ├── AUDIO_SYSTEM.md             # NFS-style audio engine
│   ├── BLUETOOTH_AUDIO.md          # Bluetooth integration
│   ├── GEAR_LOGIC.md               # Gear and RPM calculations
│   ├── BACKGROUND_SERVICE.md       # Background operation
│   └── NATIVE_MODULES.md           # Native Android modules
│
├── 📁 development/                  # Development guidelines
│   ├── DEV_WORKFLOW.md             # Git workflow and PR process
│   ├── DEV_RULES.md                # Coding standards
│   ├── TASKS.md                    # Task tracking and roadmap
│   ├── BEST_PRACTICES.md           # Best practices
│   ├── REFACTORING_GUIDE.md        # Refactoring guidelines
│   └── CODE_REVIEW.md              # Code review checklist
│
├── 📁 ui-ux/                        # UI/UX documentation
│   ├── UI_DESIGN.md                # Design system
│   ├── COMPONENTS.md               # Component library
│   ├── THEME.md                    # Theming guide
│   └── ANIMATIONS.md               # Animation guidelines
│
├── 📁 testing/                      # Testing documentation
│   ├── TESTING.md                  # Testing strategy
│   ├── UNIT_TESTING.md             # Unit test guidelines
│   ├── INTEGRATION_TESTING.md      # Integration tests
│   └── E2E_TESTING.md              # End-to-end tests
│
├── 📁 android/                      # Android-specific docs
│   ├── ANDROID_PERMISSIONS.md      # Required permissions
│   ├── BUILD_RELEASE.md            # Building APK/AAB
│   ├── GRADLE_CONFIG.md            # Gradle configuration
│   └── MANIFEST.md                 # Manifest setup
│
├── 📁 api/                          # API documentation
│   ├── API_REFERENCE.md            # Complete API reference
│   ├── HOOKS_API.md                # Custom hooks API
│   ├── SERVICES_API.md             # Services API
│   └── COMPONENTS_API.md           # Components API
│
└── 📁 reference/                    # Reference material
    ├── CONFIGURATION.md            # Configuration options
    ├── SOUND_FILES.md              # Audio file specifications
    ├── PERFORMANCE.md              # Performance optimization
    ├── TROUBLESHOOTING.md          # Common issues and fixes
    ├── FAQ.md                      # Frequently asked questions
    └── GLOSSARY.md                 # Technical terms
```

---

## 💻 Source Code Directory (`src/`)

```
src/
│
├── 📄 App.tsx                       # Root component
├── 📄 index.ts                      # Entry point
│
├── 📁 modules/                      # Feature modules (main organization)
│   │
│   ├── 📁 audio/                   # 🔊 Audio Module
│   │   ├── 📁 components/          # Audio UI components
│   │   │   ├── AudioControls/
│   │   │   │   ├── AudioControls.tsx
│   │   │   │   ├── AudioControls.test.tsx
│   │   │   │   ├── styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── VolumeSlider/
│   │   │   ├── SoundPackSelector/
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 hooks/               # Audio custom hooks
│   │   │   ├── useAudioPlayer.ts
│   │   │   ├── useAudioPlayer.test.ts
│   │   │   ├── useAudioDevice.ts
│   │   │   ├── useSoundPack.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 services/            # Audio business logic
│   │   │   ├── AudioService.ts
│   │   │   ├── AudioService.test.ts
│   │   │   ├── AudioMixer.ts
│   │   │   ├── PitchShifter.ts
│   │   │   ├── SoundLoader.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 types/               # Audio TypeScript types
│   │   │   ├── interfaces.ts
│   │   │   ├── enums.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 utils/               # Audio utility functions
│   │   │   ├── audioHelpers.ts
│   │   │   ├── soundValidator.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── 📄 constants.ts         # Audio constants
│   │   ├── 📄 README.md            # Audio module documentation
│   │   └── 📄 index.ts             # Public API exports
│   │
│   ├── 📁 gps/                     # 📍 GPS Module
│   │   ├── 📁 components/
│   │   │   ├── SpeedDisplay/
│   │   │   ├── GPSStatusIndicator/
│   │   │   ├── AccuracyBadge/
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useGPSTracking.ts
│   │   │   ├── useSpeed.ts
│   │   │   ├── useLocation.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── GPSService.ts
│   │   │   ├── SpeedCalculator.ts
│   │   │   ├── KalmanFilter.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   ├── 📁 utils/
│   │   ├── 📄 constants.ts
│   │   └── 📄 index.ts
│   │
│   ├── 📁 bluetooth/               # 📻 Bluetooth Module
│   │   ├── 📁 components/
│   │   │   ├── DeviceList/
│   │   │   ├── DeviceCard/
│   │   │   ├── ConnectionStatus/
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useBluetoothDevice.ts
│   │   │   ├── useAudioRouting.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── BluetoothService.ts
│   │   │   ├── AudioRouter.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   ├── 📁 utils/
│   │   ├── 📄 constants.ts
│   │   └── 📄 index.ts
│   │
│   ├── 📁 vehicle/                 # 🚗 Vehicle Module
│   │   ├── 📁 components/
│   │   │   ├── RPMGauge/
│   │   │   ├── GearIndicator/
│   │   │   ├── ShiftLight/
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useVehicleState.ts
│   │   │   ├── useGearShift.ts
│   │   │   ├── useRPM.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── GearLogicService.ts
│   │   │   ├── RPMCalculator.ts
│   │   │   ├── ShiftDetector.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   ├── 📁 utils/
│   │   ├── 📄 constants.ts
│   │   └── 📄 index.ts
│   │
│   └── 📁 ui/                      # 🎨 UI Components Module
│       ├── 📁 components/          # Reusable UI components
│       │   ├── Button/
│       │   ├── Card/
│       │   ├── Slider/
│       │   ├── Switch/
│       │   ├── Modal/
│       │   ├── Badge/
│       │   └── index.ts
│       ├── 📁 theme/               # Theme configuration
│       │   ├── colors.ts
│       │   ├── typography.ts
│       │   ├── spacing.ts
│       │   └── index.ts
│       ├── 📁 styles/              # Global styles
│       │   ├── globalStyles.ts
│       │   └── index.ts
│       └── 📄 index.ts
│
├── 📁 screens/                      # Screen components
│   ├── 📁 HomeScreen/
│   │   ├── HomeScreen.tsx
│   │   ├── HomeScreen.test.tsx
│   │   ├── 📁 components/          # Screen-specific components
│   │   │   ├── GaugeSection.tsx
│   │   │   ├── AudioSection.tsx
│   │   │   └── SettingsSection.tsx
│   │   ├── 📁 hooks/               # Screen-specific hooks
│   │   │   └── useHomeScreen.ts
│   │   ├── styles.ts
│   │   └── index.ts
│   │
│   ├── 📁 SettingsScreen/
│   │   ├── SettingsScreen.tsx
│   │   ├── 📁 components/
│   │   ├── styles.ts
│   │   └── index.ts
│   │
│   ├── 📁 AudioDeviceScreen/
│   │   ├── AudioDeviceScreen.tsx
│   │   ├── 📁 components/
│   │   ├── styles.ts
│   │   └── index.ts
│   │
│   └── 📁 CalibrationScreen/
│       ├── CalibrationScreen.tsx
│       ├── 📁 components/
│       ├── styles.ts
│       └── index.ts
│
├── 📁 navigation/                   # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── routes.ts
│   ├── types.ts
│   └── index.ts
│
├── 📁 store/                        # Global state management (Zustand)
│   ├── 📁 slices/                  # State slices
│   │   ├── vehicleSlice.ts
│   │   ├── audioSlice.ts
│   │   ├── bluetoothSlice.ts
│   │   ├── settingsSlice.ts
│   │   └── uiSlice.ts
│   ├── index.ts                    # Combined store
│   ├── types.ts
│   └── middleware.ts
│
├── 📁 services/                     # Global services
│   ├── BackgroundService.ts
│   ├── PermissionService.ts
│   ├── StorageService.ts
│   ├── NotificationService.ts
│   └── index.ts
│
├── 📁 utils/                        # Global utility functions
│   ├── logger.ts
│   ├── validation.ts
│   ├── helpers.ts
│   ├── formatters.ts
│   └── index.ts
│
├── 📁 types/                        # Global TypeScript types
│   ├── common.ts
│   ├── navigation.ts
│   ├── store.ts
│   └── index.ts
│
├── 📁 constants/                    # Global constants
│   ├── config.ts
│   ├── colors.ts
│   ├── dimensions.ts
│   ├── api.ts
│   └── index.ts
│
└── 📁 assets/                       # Static assets
    ├── 📁 sounds/                  # Audio files
    │   ├── 📁 engine/              # Engine sounds
    │   │   ├── gear1_idle.wav
    │   │   ├── gear1_mid.wav
    │   │   ├── gear1_high.wav
    │   │   ├── gear2_idle.wav
    │   │   └── ... (15 files total)
    │   ├── 📁 effects/             # Sound effects
    │   │   ├── shift_up.wav
    │   │   ├── shift_down.wav
    │   │   ├── backfire.wav
    │   │   ├── turbo_spool.wav
    │   │   ├── turbo_bov.wav
    │   │   └── limiter.wav
    │   └── 📁 ambient/             # Ambient sounds
    │       ├── transmission.wav
    │       └── wind.wav
    │
    ├── 📁 images/                  # Images and icons
    │   ├── logo.png
    │   ├── icon.png
    │   └── splash.png
    │
    └── 📁 fonts/                   # Custom fonts
        └── (optional custom fonts)
```

---

## 🤖 Android Directory (`android/`)

```
android/
│
├── 📄 build.gradle                  # Project Gradle config
├── 📄 settings.gradle               # Gradle settings
├── 📄 gradle.properties             # Gradle properties
│
└── 📁 app/
    ├── 📄 build.gradle              # App Gradle config
    ├── 📄 proguard-rules.pro        # ProGuard rules
    │
    └── 📁 src/
        └── 📁 main/
            ├── 📄 AndroidManifest.xml        # App permissions and config
            │
            ├── 📁 java/com/carsoundmod/
            │   ├── 📄 MainActivity.java      # Main activity
            │   ├── 📄 MainApplication.java   # Application class
            │   │
            │   └── 📁 modules/               # Native modules
            │       ├── BluetoothModule.java  # Bluetooth native bridge
            │       ├── AudioModule.java      # Audio native bridge
            │       └── GPSModule.java        # GPS native bridge
            │
            └── 📁 res/                       # Android resources
                ├── 📁 drawable/              # Drawables
                ├── 📁 mipmap/                # App icons
                ├── 📁 values/                # Values (strings, colors)
                └── 📁 xml/                   # XML configs
```

---

## 🧪 Tests Directory (`__tests__/`)

```
__tests__/
│
├── 📁 unit/                         # Unit tests
│   ├── 📁 audio/
│   │   ├── AudioService.test.ts
│   │   ├── AudioMixer.test.ts
│   │   └── PitchShifter.test.ts
│   │
│   ├── 📁 gps/
│   │   ├── GPSService.test.ts
│   │   ├── SpeedCalculator.test.ts
│   │   └── KalmanFilter.test.ts
│   │
│   ├── 📁 bluetooth/
│   │   ├── BluetoothService.test.ts
│   │   └── AudioRouter.test.ts
│   │
│   ├── 📁 vehicle/
│   │   ├── GearLogicService.test.ts
│   │   ├── RPMCalculator.test.ts
│   │   └── ShiftDetector.test.ts
│   │
│   └── 📁 utils/
│       └── helpers.test.ts
│
├── 📁 integration/                  # Integration tests
│   ├── gps-vehicle.test.ts
│   ├── audio-vehicle.test.ts
│   └── bluetooth-audio.test.ts
│
├── 📁 e2e/                          # End-to-end tests
│   ├── app-launch.e2e.ts
│   ├── speed-tracking.e2e.ts
│   └── bluetooth-connection.e2e.ts
│
└── 📁 __mocks__/                    # Test mocks
    ├── react-native-sound.ts
    ├── react-native-geolocation.ts
    └── react-native-bluetooth.ts
```

---

## 🛠️ Scripts Directory (`scripts/`)

```
scripts/
├── setup.sh                         # Project setup script
├── build-sounds.js                  # Sound file processing
├── generate-icons.js                # Icon generation
└── release.sh                       # Release automation
```

---

## ⚙️ GitHub Configuration (`.github/`)

```
.github/
│
├── 📁 workflows/                    # CI/CD workflows
│   ├── ci.yml                      # Continuous integration
│   ├── build.yml                   # Build workflow
│   └── release.yml                 # Release workflow
│
├── 📄 PULL_REQUEST_TEMPLATE.md     # PR template
└── 📄 ISSUE_TEMPLATE.md            # Issue template
```

---

## 📊 Summary

### File Count by Type

| Category | Files | Purpose |
|----------|-------|---------|
| Documentation | 25+ | Project guides |
| Source Code (TS/TSX) | 100+ | Application code |
| Test Files | 50+ | Unit/integration tests |
| Config Files | 10+ | Build/lint/TS config |
| Android Native | 5+ | Native modules |
| Sound Files | 20+ | Engine/effect sounds |
| **TOTAL** | **210+** | Complete project |

### Module Breakdown

| Module | Components | Services | Hooks | Utils |
|--------|-----------|----------|-------|-------|
| Audio | 5 | 5 | 4 | 3 |
| GPS | 3 | 3 | 3 | 2 |
| Bluetooth | 3 | 2 | 2 | 2 |
| Vehicle | 3 | 3 | 3 | 2 |
| UI | 10+ | 0 | 0 | 0 |

---

## 🗺️ Navigation Tips

### Finding Files

1. **By Feature**: Go to `src/modules/[feature-name]/`
2. **By Type**: Each module has `components/`, `services/`, `hooks/`
3. **Screens**: All in `src/screens/[screen-name]/`
4. **Tests**: Mirror structure in `__tests__/`
5. **Docs**: Start at `docs/INDEX.md`

### File Naming Patterns

- **Components**: `PascalCase.tsx`
- **Services**: `PascalCase.ts`
- **Hooks**: `use[Feature].ts`
- **Utils**: `camelCase.ts`
- **Tests**: `[filename].test.ts`
- **Types**: `interfaces.ts`, `enums.ts`

---

## Related Documentation

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Complete project guide
- [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md) - Module organization details
- [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md) - Code organization rules
- [INDEX.md](./docs/INDEX.md) - Documentation navigation

---

**This structure ensures**: Modularity • Maintainability • Scalability • Testability
