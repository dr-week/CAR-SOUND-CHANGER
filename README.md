# Cockpit Infotainment Launcher & Synthetic Engine Sound Mod

[![Build & Typecheck](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Framework](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![Bundler](https://img.shields.io/badge/Vite-7.0-646cff.svg)](https://vitejs.dev/)
[![Test Suite](https://img.shields.io/badge/Tests-206%20Passed-brightgreen.svg)](https://vitest.dev/)
[![Architecture](https://img.shields.io/badge/Code%20Audit-%E2%89%A4%20180%20lines%2Ffile-success.svg)](./scripts/audit-monoliths.js)

An ultra-responsive, landscape-first Automotive Cockpit Launcher and procedural Synthetic Engine Sound Mod designed for aftermarket and OEM Android head units (1024×600, 1280×720, 1280×800) and in-car tablets. Optimized for constrained automotive hardware (such as 2GB RAM Quad-core SoCs) with low-overhead CSS/Canvas rendering, real-time WebAudio synthesis, and seamless wireless companion integration.

---

## Key Features

### 1. Automotive Cockpit & Instrument Cluster
- **Real-Time Telemetry & Gauges:** Dual-sweep instrument cluster featuring an analog/digital speedometer, RPM tachometer, digital gear indicator, and live trip metrics.
- **Low-RAM Idle Animations:** Lightweight GPU-accelerated rotational glows on the speedometer and smooth vinyl turntable rotation on the media player—eliminating heavy memory leaks and CPU-intensive pulse effects.
- **Glassmorphic Landscape Layout:** High-contrast obsidian dark UI tailored for windshield visibility, with an adaptive right-hand pill navigation dock.
- **Quick Controls Drawer:** One-tap access to volume, display brightness, cockpit scaling (100%–130%), and quick diagnostic toggles.

### 2. Procedural Synthetic Engine Audio Engine
- **Multi-Profile Acoustic Engine:** 9 hand-crafted engine models (American Muscle V8, High-Revving Inline-4 Turbo, Twin-Rotor Wankel, Electric Hypercar, Track V10, and more).
- **Dynamic Throttle & RPM Physics:** Real-time synthesis linked to vehicle velocity, simulated throttle, or physical OBD-II / CAN inputs with zero-clipping limiter guards.
- **Acoustic Harmonics & Combustion Texture:** Sub-octave rumble, turbo spool envelope, and exhaust overrun decel pops.
- **Smart Audio Focus & Ducking:** Automatically ducks engine synthesis when navigation voice alerts, phone calls, or external music are playing.
- **5-Band Graphic Equalizer:** In-car parametric acoustic tuning for subwoofer, mid-bass, vocal presence, and treble.

### 3. Navigation & Google Maps Integration
- **Interactive Google Maps Layer:** Integrated Google Maps JavaScript API with search, route tracking, and responsive automotive dark skinning.
- **Zero-Crash Artistic Fallback:** High-contrast offline vector map with GPS compass heading when operating without cellular data.
- **External App Handoff:** Instant one-touch navigation launch to standalone Google Maps, Waze, or native navigation apps.

### 4. Native Companion Broadcaster App (`companion/`)
A dedicated Android companion application installed on the driver's smartphone that bridges handheld intelligence to the vehicle head unit without consuming car RAM:
- **Notification Relay:** Secure foreground `NotificationListenerService` forwarding caller ID, SMS, and WhatsApp alerts directly to the cockpit HUD in real-time.
- **Phone Telemetry Bridge:** Displays live phone battery percentage, charging state, and cellular network status on the in-car status bar.
- **Low-Latency Audio Streaming:** High-performance foreground audio broadcast service streaming phone media over local Wi-Fi / Hotspot.
- **Instant Ultrasonic & QR Pairing:** Connects effortlessly via high-frequency ultrasonic sonic chirps or instant QR-code Wi-Fi handshake.
- **SSE Event Bridge:** Ultra-low latency Server-Sent Events (SSE) daemon running on `port 8088`.

### 5. Multi-Device File Sharing & Sound Pack API
- Compatible with the companion **Lumen Files** ecosystem (`fileMAN`):
  - **REST Transfer Engine (Port 8888):** Bidirectional Wi-Fi file transfer enabling wireless upload of custom engine sound packs, audio recordings, and music playlists from Windows PC or Android devices directly into the car unit.
  - **UDP Subnet Auto-Discovery (Port 8889):** Automatic peer detection across local vehicular hotspot networks.

---

## Architecture & Codebase Health

The project follows a strict layered clean architecture with strict modularity:
- **Zero-Monolith Rule:** Every single file across the codebase is maintained at **$\le 180$ lines** (enforced by automated CI linting and `scripts/audit-monoliths.js`).
- **Comprehensive Test Suite:** **39 test suites** and **206 automated unit & integration tests** covering vehicle physics, telemetry validation, audio synthesis, and bridge protocols.

```text
carSOUNDMOD/
├── android/            # Native Android container & launcher wrapper
├── companion/          # Native Android Broadcaster / Companion phone app
│   └── app/src/main/   # Notification relay, audio capture & sonic pairing
├── docs/               # Architecture, audio synthesis & UX audit documentation
├── scripts/            # Build, test, APK packaging, and cockpit dev orchestrator
├── src/
│   ├── app/            # Cockpit shell, modal manager & surface views
│   ├── application/    # Composables, ports, driving session & phone clients
│   ├── composition/    # Dependency injection & simulator wiring
│   ├── domain/         # Vehicle physics, acoustic envelopes & scoring logic
│   ├── infrastructure/ # WebAudio engine, GPS, Bluetooth & Android bridges
│   └── presentation/   # Cockpit gauges, views, media player & navigation
└── tests/              # Cross-module and integration test suites
```

---

## Getting Started

### Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Java JDK 17+** & **Android SDK** (for building Android APKs)

### Installation
```bash
# Clone the repository
git clone https://github.com/dr-week/CAR-SOUND-CHANGER.git
cd CAR-SOUND-CHANGER

# Install dependencies
npm install
```

### Running Locally
```bash
# Launch Cockpit development server
npm run dev

# Launch Cockpit simulator in desktop kiosk mode
npm run cockpit:kiosk

# Start the Phone Bridge daemon (Port 8088)
npm run bridge

# Run the complete multi-process dev orchestrator (Vite + Bridge + Telemetry)
npm run dev:cockpit
```

### Building the Android APKs
```bash
# Build Cockpit Head Unit Launcher APK
npm run apk:build

# Install Cockpit Launcher to connected Android device / Head Unit via ADB
npm run apk:run

# Build the Android Companion Broadcaster App
npm run companion:build
```

---

## Automated Verification & Quality Suite

Run the full validation pipeline before submitting changes:

```bash
# 1. Monolith line-budget check (ensures all files ≤ 180 lines)
npm run audit:lines

# 2. TypeScript typecheck
npm run check

# 3. Vitest comprehensive unit & integration tests (206 tests)
npm run test

# 4. System health doctor check
npm run doctor

# 5. Production bundle build
npm run build
```

---

## Safety & In-Car Compliance

- **Driver Safety Notice:** Never configure complex parameters, sound profiles, or file transfers while operating a moving vehicle.
- **Auditory Safety:** The procedural synthesis engine includes a calibrated dynamic limiter and soft-clipper to protect vehicle speakers and occupants' hearing.
- **Privacy Assurance:** No telematics, location data, or phone notifications leave the local vehicle LAN. All pairing and data exchange remain strictly on-device.

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
