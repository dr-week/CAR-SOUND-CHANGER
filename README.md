# Car Sound Changer - Suzuki Brezza Edition

A GPS-based web app that simulates realistic engine sounds synchronized with your vehicle's speed and gear changes. Specifically tuned for Suzuki Brezza with shift points at 1500-2000 RPM.

## 🚗 Features

- **GPS-Based Speed Detection**: Real-time speed monitoring using Web Geolocation API
- **Automatic Gear Simulation**: Intelligent gear change detection based on speed
- **Realistic Engine Sounds**: High-quality audio samples for each gear (NFS-style)
- **Bluetooth Speaker Support**: Route audio to connected Bluetooth speakers
- **RPM Simulation**: Accurate RPM calculation based on speed and gear
- **Suzuki Brezza Tuned**: Optimized for Brezza's transmission characteristics (1500-2000 RPM shift)
- **Modern UI**: Beautiful, responsive interface built with Vue 3 + TypeScript
- **Real-time Visualization**: Live RPM gauge and speedometer
- **Audio Device Switching**: Support for phone speaker, Bluetooth, and wired audio
- **Customizable Settings**: Adjust shift points, volume, and sound profiles
- **Offline Capable**: Can work offline with Pre-loaded sound files
- **Mobile Responsive**: Works on desktop, tablet, and mobile browsers

## 🎯 Technical Specifications

### Gear Ratios (Suzuki Brezza)
- **1st Gear**: 0-15 km/h (Shift at ~1500-2000 RPM)
- **2nd Gear**: 15-30 km/h (Shift at ~1500-2000 RPM)
- **3rd Gear**: 30-50 km/h (Shift at ~1500-2000 RPM)
- **4th Gear**: 50-70 km/h (Shift at ~1500-2000 RPM)
- **5th Gear**: 70+ km/h (Cruising gear)

### RPM Ranges
- Idle: 800-1000 RPM
- Shift Point: 1500-2000 RPM
- Max RPM per gear: 2000 RPM (before shift)

## 🛠️ Technology Stack

- **Framework**: Vue 3 (Latest)
- **Language**: TypeScript (Strict Mode)
- **Build Tool**: Vite (Lightning-fast builds)
- **Audio**: Web Audio API
- **GPS**: Geolocation API
- **Styling**: CSS 3 / Tailwind CSS
- **Testing**: Vitest + Vue Test Utils
- **Architecture**: DDD/Clean Architecture
- **Package Manager**: npm

## 📁 Project Structure

```
carSOUNDMOD/
├── src/
│   ├── domain/                   # 🎯 Business Logic (Pure TypeScript)
│   │   ├── vehicle/
│   │   │   ├── types.ts         # Vehicle interfaces
│   │   │   ├── vehiclePhysics.ts # Physics calculations
│   │   │   ├── carProfiles.ts   # Car profiles
│   │   │   └── controls.ts      # Control inputs
│   │   └── scoring/
│   │       └── greenScore.ts    # Green score calculation
│   │
│   ├── application/              # 🔄 Use Cases & Services
│   │   ├── services/
│   │   │   ├── DrivingSession.ts
│   │   │   └── index.ts
│   │   ├── ports/
│   │   │   ├── EngineSoundOutput.ts
│   │   │   └── TelemetryStatus.ts
│   │   ├── composables/
│   │   │   ├── useVehicleSimulator.ts
│   │   │   └── index.ts
│   │   └── bootstrap/
│   │
│   ├── infrastructure/           # 🔌 External Adapters
│   │   ├── audio/
│   │   │   ├── WebAudioEngine.ts
│   │   │   └── index.ts
│   │   ├── input/
│   │   │   ├── KeyboardInput.ts
│   │   │   └── index.ts
│   │   ├── gps/
│   │   │   ├── GPSService.ts
│   │   │   └── index.ts
│   │   └── bluetooth/
│   │       ├── BluetoothManager.ts
│   │       └── index.ts
│   │
│   ├── presentation/             # 👁️ Vue Components
│   │   ├── components/
│   │   │   ├── RPMGauge.vue
│   │   │   ├── SpeedDisplay.vue
│   │   │   ├── GearIndicator.vue
│   │   │   └── AudioControls.vue
│   │   ├── views/
│   │   │   ├── HomeView.vue
│   │   │   ├── SettingsView.vue
│   │   │   └── BluetoothView.vue
│   │   └── styles/
│   │       ├── main.css
│   │       └── theme.css
│   │
│   ├── App.vue                  # Root component
│   └── main.ts                  # Entry point
│
├── public/                       # Static assets
│   └── sounds/                  # Audio files
│       ├── engine/
│       ├── effects/
│       └── ambient/
│
├── docs/                         # Documentation
├── __tests__/                   # Tests
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── index.html                   # HTML entry point
```

## 🚀 Quick Start

See [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run linter
npm run lint
```

## 📖 Documentation

### 🚀 Getting Started
- **[📋 Project Overview](./PROJECT_OVERVIEW.md)** - Complete project guide (START HERE!)
- **[⚙️ Installation Guide](./INSTALLATION.md)** - Setup and installation
- **[🤝 Contributing](./CONTRIBUTING.md)** - How to contribute

### 🏗️ Architecture & Development
- **[🏛️ Architecture Overview](./docs/ARCHITECTURE.md)** - System design (DDD + Clean Architecture)
- **[📁 Code Structure](./docs/MODULAR_STRUCTURE.md)** - Code organization
- **[✂️ Code Division Rules](./docs/CODE_DIVISION_RULES.md)** - Manageable development
- **[🔄 Dev Workflow](./docs/DEV_WORKFLOW.md)** - Git workflow and process
- **[📝 Dev Rules](./docs/DEV_RULES.md)** - Coding standards and patterns
- **[✅ Tasks & Roadmap](./docs/TASKS.md)** - Complete task list (8 phases)

### 🔧 Technical Guides
- **[📍 GPS Integration](./docs/GPS_INTEGRATION.md)** - GPS and location tracking
- **[🔊 Audio System](./docs/AUDIO_SYSTEM.md)** - NFS-style engine sounds
- **[📻 Bluetooth Audio](./docs/BLUETOOTH_AUDIO.md)** - Bluetooth speaker setup
- **[⚙️ Gear Logic](./docs/GEAR_LOGIC.md)** - Gear and RPM calculations
- **[🎵 Sound Files](./docs/SOUND_FILES.md)** - Audio file specifications

### 🎨 UI & Testing
- **[🎨 UI Design System](./docs/UI_DESIGN.md)** - Design patterns and components
- **[🧪 Testing Guide](./docs/TESTING.md)** - Testing strategy (Unit/Integration/E2E)
- **[🔧 Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues

### 📖 Reference
- **[📚 Documentation Index](./docs/INDEX.md)** - All documentation navigation
- **[🔌 API Reference](./docs/API_REFERENCE.md)** - Complete API documentation
- **[⚙️ Configuration](./docs/CONFIGURATION.md)** - Configuration options
- **[🚀 Build & Deploy](./docs/BUILD_RELEASE.md)** - Building and deploying
- **[❓ FAQ](./docs/FAQ.md)** - Frequently asked questions

## ✨ Key Features Explained

### DDD/Clean Architecture
Code is organized by layers (Domain → Application → Infrastructure → Presentation) rather than features. This provides:
- Better testability (domain logic has no framework dependencies)
- Easier to swap implementations
- Clear separation of concerns
- Scalable codebase

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed explanation.

### Suzuki Brezza Tuning
The app is specifically tuned for Suzuki Brezza with:
- Accurate gear ratio calculations based on speed
- Shift points at 1500-2000 RPM (driver's preference)
- Realistic RPM simulation
- Authentic engine sound samples

See [GEAR_LOGIC.md](./docs/GEAR_LOGIC.md) for technical details.

### NFS-Style Audio
Engine sounds are modulated like in Need for Speed:
- Pitch changes with RPM
- Gear-specific sound samples
- Smooth transitions on gear shifts
- Volume scales with speed

See [AUDIO_SYSTEM.md](./docs/AUDIO_SYSTEM.md) for implementation details.

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Works on mobile browsers with GPS support

## Google Maps integration

The launcher supports a live Google map, device-location recentering, and Google Maps driving directions. It keeps an artistic offline map when no key or network is available.

1. Enable **Maps JavaScript API** in Google Cloud.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_GOOGLE_MAPS_API_KEY` to a browser key restricted to the Maps JavaScript API and the launcher's allowed origins.
4. Optionally set `VITE_GOOGLE_MAPS_MAP_ID` for a Cloud-based map style.

Do not commit `.env.local`. For the native Android launcher, use a separate Android-restricted key with the Maps SDK for Android rather than reusing the browser key.

## 🔐 Privacy & Security

- ✅ The launcher has no first-party analytics or tracking
- ⚠️ When Google Maps is configured, map requests are sent to Google under Google's Maps Platform terms
- ✅ Device location is requested only for the visible map and is not stored by this project
- ✅ Offline-capable (pre-loaded sounds)
- ✅ Open source - inspect the code

## ⚠️ Important Notes

- **Simulation Only**: This is for entertainment and learning purposes only
- **Safety First**: Do not use while actively driving
- **GPS Accuracy**: Best results with clear line of sight to sky
- **Audio Quality**: Works best with quality speakers or headphones
- **Mobile**: Tested on Chrome Android and Safari iOS

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- RPMGauge.test.ts
```

See [TESTING.md](./docs/TESTING.md) for testing strategy.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [DEV_WORKFLOW.md](./docs/DEV_WORKFLOW.md) for detailed Git workflow.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🔗 Related Projects

- [NFS Sound Mods](https://www.nfsmods.com/) - Inspiration for audio system
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio documentation
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) - GPS documentation
- [Vue 3](https://vuejs.org/) - Framework documentation

## 📞 Support

- 📖 Read [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues
- ❓ Check [FAQ.md](./docs/FAQ.md) for frequently asked questions
- 🐛 Report bugs in [GitHub Issues](https://github.com/yourusername/carSOUNDMOD/issues)
- 💬 Discuss in [GitHub Discussions](https://github.com/yourusername/carSOUNDMOD/discussions)

---

**⚠️ Safety Warning**: This is a simulation system for entertainment purposes only. Always prioritize safe driving practices. Never interact with the app while driving.

**Made with ❤️ for car enthusiasts and developers**
