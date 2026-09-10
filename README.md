# Car Sound Changer - Suzuki Brezza Edition (Android)

A GPS-based Android car sound modification app that simulates realistic engine sounds synchronized with your vehicle's speed and gear changes. Specifically tuned for Suzuki Brezza with shift points at 1500-2000 RPM.

## 🚗 Features

- **GPS-Based Speed Detection**: Real-time speed monitoring using Android GPS
- **Automatic Gear Simulation**: Intelligent gear change detection based on speed
- **Realistic Engine Sounds**: High-quality audio samples for each gear
- **Bluetooth Speaker Support**: Route audio to connected Bluetooth speakers or car audio system
- **Multi-Audio Output**: Support for phone speaker, Bluetooth, wired headphones, and car audio
- **RPM Simulation**: Accurate RPM calculation based on speed and gear
- **Suzuki Brezza Tuned**: Optimized for Brezza's transmission characteristics
- **Modern UI**: Beautiful, responsive interface built with React Native + TypeScript
- **Real-time Visualization**: Live RPM gauge and speedometer
- **Audio Device Switching**: Automatic detection and switching between audio outputs
- **Customizable Settings**: Adjust shift points, volume, and sound profiles
- **Background Service**: Runs in background while driving
- **Keep Screen On**: Option to prevent screen from sleeping

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

- **Framework**: React Native (Latest)
- **Language**: TypeScript
- **UI Library**: React Native Paper / NativeBase / Custom UI
- **Navigation**: React Navigation
- **Audio Management**: react-native-sound / react-native-track-player
- **Bluetooth Audio**: react-native-audio-routing / Native Android AudioManager
- **GPS Integration**: react-native-geolocation-service
- **State Management**: Zustand / Redux Toolkit
- **Build Tool**: Metro Bundler
- **Package Manager**: npm/yarn
- **Android SDK**: API Level 24+ (Android 7.0+)

## 📁 Project Structure

```
carSOUNDMOD/
├── android/                  # Native Android code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── java/
│   └── build.gradle
├── ios/                      # iOS (optional future support)
├── src/
│   ├── components/           # React Native components
│   │   ├── ui/              # Reusable UI components
│   │   ├── gauges/          # RPM/Speed gauges
│   │   └── screens/         # Screen components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # GPS, Audio, Background services
│   ├── stores/              # State management
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── navigation/          # Navigation setup
│   └── assets/              # Audio files, images
│       ├── sounds/          # Engine sound files
│       └── images/          # UI images
├── docs/                    # Documentation
├── __tests__/              # Test files
└── app.json                # App configuration
```

## 🚀 Quick Start

See [INSTALLATION.md](./INSTALLATION.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Install iOS pods (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Build APK
npm run build:android
```

## 📖 Documentation

### 🚀 Getting Started
- **[📋 Project Overview](./PROJECT_OVERVIEW.md)** - Complete project guide (START HERE!)
- **[⚙️ Installation Guide](./INSTALLATION.md)** - Setup and installation
- **[🤝 Contributing](./CONTRIBUTING.md)** - How to contribute

### 🏗️ Architecture & Development
- **[🏛️ Architecture Overview](./docs/ARCHITECTURE.md)** - System design
- **[📁 Code Structure](./docs/MODULAR_STRUCTURE.md)** - Code organization
- **[✂️ Code Division Rules](./docs/CODE_DIVISION_RULES.md)** - Manageable development
- **[🔄 Dev Workflow](./docs/DEV_WORKFLOW.md)** - Git workflow and process
- **[📝 Dev Rules](./docs/DEV_RULES.md)** - Coding standards
- **[✅ Tasks & Roadmap](./docs/TASKS.md)** - Complete task list

### 🔧 Technical Guides
- **[📍 GPS Integration](./docs/GPS_INTEGRATION.md)** - GPS and location tracking
- **[🔊 Audio System](./docs/AUDIO_SYSTEM.md)** - NFS-style engine sounds
- **[📻 Bluetooth Audio](./docs/BLUETOOTH_AUDIO.md)** - Bluetooth speaker setup
- **[⚙️ Gear Logic](./docs/GEAR_LOGIC.md)** - Gear and RPM calculations
- **[🔄 Background Service](./docs/BACKGROUND_SERVICE.md)** - Background operation

### 🎨 UI & Testing
- **[🎨 UI Design System](./docs/UI_DESIGN.md)** - Design patterns and components
- **[🧪 Testing Guide](./docs/TESTING.md)** - Testing strategy
- **[🔧 Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues

### 📖 Reference
- **[📚 Documentation Index](./docs/INDEX.md)** - All documentation navigation
- **[🔌 API Reference](./docs/API_REFERENCE.md)** - Complete API docs
- **[📱 Android Permissions](./docs/ANDROID_PERMISSIONS.md)** - Required permissions
- **[🚀 Build & Release](./docs/BUILD_RELEASE.md)** - Building and releasing
- **[❓ FAQ](./docs/FAQ.md)** - Frequently asked questions

## ⚠️ Important Notes

- Requires Android 7.0 (API 24) or higher
- Requires GPS and Location permissions
- Requires audio playback permissions
- Best experienced with quality speakers/headphones or car audio system
- Designed for simulation purposes only - not for actual vehicle modification
- Do not use while actively driving - passenger/testing use only

## 📱 Android Requirements

- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Permissions**: 
  - ACCESS_FINE_LOCATION
  - ACCESS_COARSE_LOCATION
  - FOREGROUND_SERVICE
  - WAKE_LOCK
  - BLUETOOTH
  - BLUETOOTH_CONNECT (Android 12+)
  - MODIFY_AUDIO_SETTINGS

## 🤝 Contributing

See [Contribution Guidelines](docs/CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🔗 Related Documents

- [Configuration Guide](./docs/CONFIGURATION.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Performance Optimization](./docs/PERFORMANCE.md)
- [Sound File Specifications](./docs/SOUND_FILES.md)

---

**⚠️ Safety Warning**: This is a simulation system for entertainment purposes. Always prioritize safe driving practices. Do not interact with the app while driving.
