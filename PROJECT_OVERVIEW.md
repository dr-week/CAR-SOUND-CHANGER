# Car Sound Changer - Project Overview

Complete project overview and getting started guide.

## 🎯 Project Vision

Create an Android app that simulates realistic **Need for Speed style engine sounds** synchronized with vehicle speed using GPS, with audio output through Bluetooth speakers, specifically tuned for **Suzuki Brezza** with shift points at 1500-2000 RPM.

## 🚗 What It Does

```
GPS Speed → Gear Calculation → RPM Calculation → Engine Sound → Bluetooth Speaker
   ↓              ↓                   ↓                 ↓              ↓
 65 km/h      →  Gear 4      →    1800 RPM    →   Engine Roar  →  Car Audio
```

### Core Features

1. **GPS-Based Speed Tracking**
   - Real-time speed from Android GPS
   - High-accuracy mode
   - Smooth filtering (no jitter)

2. **Automatic Gear Simulation**
   - 5-speed manual transmission simulation
   - Based on Suzuki Brezza gear ratios
   - Shift at 1500-2000 RPM

3. **NFS-Style Engine Sounds**
   - Realistic engine samples for each gear
   - Dynamic pitch based on RPM
   - Turbo spool at high RPM
   - Shift sounds and backfire effects

4. **Bluetooth Audio Output**
   - Route audio to Bluetooth speakers
   - Support for car audio systems
   - Automatic device connection
   - Low-latency audio

5. **Real-Time UI**
   - RPM gauge (NFS-style)
   - Digital speedometer
   - Gear indicator
   - Audio controls

## 📁 Project Structure

```
carSOUNDMOD/
│
├── 📄 README.md                    # Project intro (START HERE)
├── 📄 PROJECT_OVERVIEW.md          # This file - Complete overview
├── 📄 INSTALLATION.md              # Setup instructions
├── 📄 CONTRIBUTING.md              # How to contribute
│
├── docs/                           # 📚 All documentation
│   ├── INDEX.md                   # Documentation navigation
│   │
│   ├── 🏗️ Architecture
│   │   ├── ARCHITECTURE.md        # System design
│   │   ├── MODULAR_STRUCTURE.md   # Code organization
│   │   └── CODE_DIVISION_RULES.md # Code division patterns
│   │
│   ├── 💻 Development
│   │   ├── DEV_WORKFLOW.md        # Git workflow
│   │   ├── DEV_RULES.md           # Coding standards
│   │   └── TASKS.md               # Task tracking
│   │
│   ├── 🔧 Technical
│   │   ├── GPS_INTEGRATION.md     # GPS implementation
│   │   ├── AUDIO_SYSTEM.md        # NFS audio system
│   │   ├── BLUETOOTH_AUDIO.md     # Bluetooth setup
│   │   ├── GEAR_LOGIC.md          # Gear calculations
│   │   └── BACKGROUND_SERVICE.md  # Background mode
│   │
│   ├── 🎨 UI/UX
│   │   ├── UI_DESIGN.md          # Design system
│   │   ├── COMPONENTS.md         # Component library
│   │   └── THEME.md              # Theming
│   │
│   ├── 🧪 Testing
│   │   ├── TESTING.md            # Test strategy
│   │   └── TROUBLESHOOTING.md    # Common issues
│   │
│   └── 📖 Reference
│       ├── API_REFERENCE.md      # API docs
│       ├── CONFIGURATION.md      # Config options
│       ├── SOUND_FILES.md        # Audio specs
│       └── FAQ.md                # FAQ
│
└── src/                           # Source code
    ├── modules/                  # Feature modules
    │   ├── audio/               # Audio module
    │   ├── gps/                 # GPS module
    │   ├── bluetooth/           # Bluetooth module
    │   ├── vehicle/             # Vehicle state module
    │   └── ui/                  # UI components module
    │
    ├── screens/                 # Screen components
    ├── navigation/              # Navigation setup
    ├── store/                   # State management
    ├── services/                # Global services
    └── assets/                  # Audio files, images
```

## 🗺️ Documentation Map

### For Different Roles

#### 👨‍💻 **Developers (New to Project)**

**Start Here** → **Then Read** → **Reference When Needed**

1. [README.md](./README.md)
2. [INSTALLATION.md](./INSTALLATION.md)
3. [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md)
5. [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md)
6. [TASKS.md](./docs/TASKS.md) ← Pick a task!

**Reference:**
- [DEV_RULES.md](./docs/DEV_RULES.md)
- [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md)
- [API_REFERENCE.md](./docs/API_REFERENCE.md)

#### 🎨 **UI/UX Designers**

1. [UI_DESIGN.md](./docs/UI_DESIGN.md) - Design system
2. [COMPONENTS.md](./docs/COMPONENTS.md) - Component specs
3. [THEME.md](./docs/THEME.md) - Theming system
4. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Understand the app flow

#### 🔧 **Backend/Integration Developers**

1. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System overview
2. [GPS_INTEGRATION.md](./docs/GPS_INTEGRATION.md) - GPS setup
3. [AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md) - Audio engine
4. [BLUETOOTH_AUDIO.md](./docs/BLUETOOTH_AUDIO.md) - Bluetooth integration
5. [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md) - Vehicle logic
6. [API_REFERENCE.md](./docs/API_REFERENCE.md) - All APIs

#### 🧪 **QA/Testers**

1. [TESTING.md](./docs/TESTING.md) - Test strategy
2. [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Known issues
3. [CONFIGURATION.md](./docs/CONFIGURATION.md) - Settings
4. [FAQ.md](./docs/FAQ.md) - Common questions

#### 📊 **Project Managers**

1. [TASKS.md](./docs/TASKS.md) - Task tracking
2. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Technical overview
3. [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md) - Development process

## 🚀 Quick Start Paths

### Path 1: Just Want to Run It?

```bash
# 1. Clone
git clone <repo-url>
cd carSOUNDMOD

# 2. Install
npm install

# 3. Run
npm run android

# Done! App should launch on your device
```

**Next**: Read [INSTALLATION.md](./INSTALLATION.md) for details

### Path 2: Want to Understand the Architecture?

1. [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System overview
2. [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md) - Code organization
3. [GPS_INTEGRATION.md](./docs/GPS_INTEGRATION.md) - How GPS works
4. [AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md) - How audio works
5. [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md) - How gears work

### Path 3: Want to Contribute Code?

1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guide
2. [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md) - Git workflow
3. [DEV_RULES.md](./docs/DEV_RULES.md) - Coding standards
4. [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md) - Code organization
5. [TASKS.md](./docs/TASKS.md) - Pick a task
6. [TESTING.md](./docs/TESTING.md) - Write tests

### Path 4: Want to Understand a Specific Feature?

| Feature | Documentation |
|---------|---------------|
| GPS/Speed | [GPS_INTEGRATION.md](./docs/GPS_INTEGRATION.md) |
| Engine Sounds | [AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md) |
| Bluetooth | [BLUETOOTH_AUDIO.md](./docs/BLUETOOTH_AUDIO.md) |
| Gear Logic | [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md) |
| UI Design | [UI_DESIGN.md](./docs/UI_DESIGN.md) |
| Background | [BACKGROUND_SERVICE.md](./docs/BACKGROUND_SERVICE.md) |

## 🎓 Learning Path

### Week 1: Setup & Understanding
- [ ] Read README.md
- [ ] Follow INSTALLATION.md
- [ ] Run the app on device
- [ ] Read ARCHITECTURE.md
- [ ] Understand MODULAR_STRUCTURE.md

### Week 2: Deep Dive
- [ ] Study GPS_INTEGRATION.md
- [ ] Study AUDIO_SYSTEM.md
- [ ] Study GEAR_LOGIC.md
- [ ] Review the codebase
- [ ] Run tests

### Week 3: Contribution
- [ ] Read CONTRIBUTING.md
- [ ] Read DEV_WORKFLOW.md
- [ ] Read DEV_RULES.md
- [ ] Pick a small task from TASKS.md
- [ ] Submit your first PR!

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| **Total Tasks** | 141 |
| **Estimated Hours** | 414.5h |
| **Timeline** | 10-12 weeks |
| **Modules** | 5 (GPS, Audio, Bluetooth, Vehicle, UI) |
| **Documentation Files** | 25+ |
| **Test Coverage Goal** | 80% |

## 🔑 Key Concepts

### 1. Modular Architecture

The project is divided into **independent modules**:
- **GPS Module**: Location and speed tracking
- **Audio Module**: Sound engine and playback
- **Bluetooth Module**: Device connection and routing
- **Vehicle Module**: Gear and RPM calculation
- **UI Module**: Components and screens

Each module is self-contained and has its own:
- Components
- Services
- Hooks
- Types
- Tests

### 2. Gear Simulation

```
Speed (GPS) → Gear Calculation → RPM Calculation → Sound Selection

Example:
65 km/h → Gear 4 (50-70 km/h range) → 1800 RPM → Gear4_High.wav
```

**Suzuki Brezza Gear Ratios:**
- Gear 1: 0-15 km/h
- Gear 2: 15-30 km/h
- Gear 3: 30-50 km/h
- Gear 4: 50-70 km/h
- Gear 5: 70+ km/h

Shift at: **1500-2000 RPM**

### 3. NFS-Style Audio

Multi-layered audio system:
- **Engine Layer**: Base engine sound (varies by gear)
- **Turbo Layer**: Turbo spool (above 1500 RPM)
- **Effects Layer**: Shifts, backfires, BOV sounds

Dynamic pitch based on RPM (0.8x to 1.5x playback rate)

### 4. Bluetooth Integration

Automatic audio routing:
1. Detect connected Bluetooth devices
2. Filter for audio-capable devices
3. Route media audio to Bluetooth
4. Monitor connection status
5. Fall back to phone speaker if disconnected

## 🎯 Development Priorities

### Phase 1: Foundation (Weeks 1-2)
- ✅ Project setup
- ✅ Documentation structure
- 🚧 Module scaffolding
- 🚧 Basic UI

### Phase 2: Core Features (Weeks 3-5)
- 🚧 GPS integration
- 🚧 Gear logic
- 🚧 Audio system
- 🚧 Basic sound playback

### Phase 3: Polish (Weeks 6-8)
- 📋 Bluetooth integration
- 📋 NFS-style sounds
- 📋 UI polish
- 📋 Performance optimization

### Phase 4: Release (Weeks 9-10)
- 📋 Testing
- 📋 Bug fixes
- 📋 Documentation updates
- 📋 Play Store release

## 🔗 Quick Navigation

### Most Important Documents

1. **Start Here**: [README.md](./README.md)
2. **Setup**: [INSTALLATION.md](./INSTALLATION.md)
3. **Architecture**: [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. **Tasks**: [TASKS.md](./docs/TASKS.md)
5. **Workflow**: [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md)

### Technical Deep Dives

- [GPS_INTEGRATION.md](./docs/GPS_INTEGRATION.md)
- [AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md)
- [BLUETOOTH_AUDIO.md](./docs/BLUETOOTH_AUDIO.md)
- [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md)

### Development Guides

- [DEV_RULES.md](./docs/DEV_RULES.md)
- [MODULAR_STRUCTURE.md](./docs/MODULAR_STRUCTURE.md)
- [CODE_DIVISION_RULES.md](./docs/CODE_DIVISION_RULES.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

### All Documentation

See [docs/INDEX.md](./docs/INDEX.md) for complete documentation index.

## 💡 Tips for Success

1. **Read docs in order** - They build on each other
2. **Start small** - Pick easy tasks first
3. **Ask questions** - No question is stupid
4. **Test on device** - Emulator can't test GPS/Bluetooth
5. **Follow standards** - Makes code reviews easier
6. **Write tests** - Prevents regressions
7. **Update docs** - As you learn, improve docs for others

## 🆘 Need Help?

1. Check [docs/INDEX.md](./docs/INDEX.md) for all documentation
2. Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues
3. Check [FAQ.md](./docs/FAQ.md) for frequently asked questions
4. Search existing issues on GitHub
5. Ask in team chat or create an issue

## 📞 Contact

- **GitHub Issues**: For bugs and features
- **Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

---

## Summary

This project is a **well-documented**, **modular**, **GPS-based** Android app that simulates **NFS-style engine sounds** through **Bluetooth speakers**, tuned for **Suzuki Brezza**.

**Start with**: [README.md](./README.md) → [INSTALLATION.md](./INSTALLATION.md) → [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

**All docs**: [docs/INDEX.md](./docs/INDEX.md)

**Happy coding!** 🚗💨🔊
