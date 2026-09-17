# UI/UX Design System - Avant-Garde Car Infotainment Launcher

Design system documentation for the **Car Sound Changer & Infotainment Launcher**.

---

## 🎨 Overview & Aesthetic Goals

The launcher UI/UX is engineered specifically for **landscape 16:9 / 16:10 automotive touchscreens** (e.g. Blaupunkt, Android head units, tablets). It embodies an **avant-garde, dark glassmorphic automotive aesthetic**:

1. **High Contrast Obsidian Palette**: Deep obsidian backgrounds (`#0B0F0D`) paired with luminous electric acid lime (`#D9FF78`), warm exhaust amber (`#E7BF76`), and crisp technical typography.
2. **Glanceable Tactile Targets**: All primary touch targets adhere to a minimum of **64px** in height/width, ensuring effortless and safe operation in a moving or stationary vehicle.
3. **Typographic Juxtaposition**: Bespoke pairing of editorial serif (`Playfair Display`) for greeting elegance, industrial monospace (`DM Mono`) for technical instrumentation, and neo-grotesque sans-serif (`Manrope`) for legible UI labels.
4. **Hardware-Accelerated 60 FPS Micro-Animations**: Smooth SVG arc sweeps on tachometer/speedometer, real-time acoustic frequency harmonic pulses, dynamic soundstage propagation waves, and blur-filtered smoked glass surfaces (`backdrop-filter: blur(20px)`).

---

## 📐 Screen Layout Grid (Landscape 16:9)

```
┌──────┬────────────────────────────────────────────────────────┐
│      │ Status Bar (60px)                                      │
│      │ [Ready · Clock (Tap for Quick Controls) · GPS · Net]   │
│ Rail ├────────────────────────────────────────────────────────┤
│ Dock │ Dynamic Stage Views:                                   │
│ 90px │ • Home (Cockpit Telemetry HUD + Greeting + Map + Media)│
│ [m]  │ • Gauges (Full-Screen Performance Cluster)             │
│ Gauge│ • Sound Lab (Harmonic Visualizer + Profile Cards)      │
│ Car  │ • Media Studio (Now Playing + Ducking Indicator)       │
│ Music│ • Navigate (Google Maps + Directions Sheet)            │
│ Nav  │ • All Apps (Automotive Utilities & Diagnostics)        │
│ Apps │ • Settings (Display Brightness + 100-130% UI Scaling)  │
│ Sett.│                                                        │
└──────┴────────────────────────────────────────────────────────┘
```

---

## 🧩 UI Components & Modules

### 1. Navigation Rail (`.rail`)

- **Position**: Fixed left navigation rail (90px width).
- **Tabs**:
  - `Home` (`m` brand mark): Fused Cockpit Dashboard.
  - `Gauges` (`gauge`): Dedicated Full-Screen Performance Instrument Cluster.
  - `Sound Lab` (`car`): Vehicle Sound Synthesizer & Acoustic Studio.
  - `Media` (`music`): Interactive Music / Soundstage Studio.
  - `Navigate` (`nav`): Full-screen Google Maps Navigation.
  - `All Apps` (`grid`): Automotive Utilities & Diagnostics Drawer.
  - `Settings` (`settings`): Launcher preferences, UI scaling (100–130%), and Bluetooth.

### 2. Status Bar

- **Position**: Fixed top status bar (60px height).
- **Widgets**:
  - Ignition / Engine readiness indicator (`STANDBY` vs `ENGINE ON`).
  - Interactive digital clock & date with Quick Controls drawer trigger.
  - Real-time Web Bluetooth connection toggle and device name.
  - Real-time GPS telemetry status button with live speed readout.
  - Genuine Web Battery API gauge with online/offline connectivity fallback.

### 3. `CockpitTelemetry.vue`

- **Fused Kinetic Cockpit HUD**:
  - **Speedometer**: Digital readout with GPS vs Simulation telemetry source indicator.
  - **Tachometer Arc**: 220-degree kinetic SVG arc with glowing redline threshold.
  - **Gear Indicator**: Race-style engaged gear badge with dynamic `SHIFT ↑` light.
  - **Green Eco-Driving Score**: Real-time score (0–100) with dynamic color rating.
  - **Virtual Drive Pedals**: Optional expandable touch pedals (Throttle, Brake, Sequential Shift) for bench testing.

### 4. `InstrumentDashboard.vue` (Dedicated Gauges Cluster)

- **Full-Screen Performance Instrument Cluster**:
  - **Twin Sweep Dials**: Dual analog/digital gauges for Tachometer (`VehicleTachometer.vue`) and Speedometer (`SpeedometerGauge.vue`) styled in obsidian smoked glass.
  - **Central Race Gear Display**: Oversized gear readout with dynamic shift light (`GearDisplay.vue`).
  - **Telemetry Indicators**: Audio, GPS/Sim source, Eco score, and Bluetooth state (`StatusIndicators.vue`).
  - **Tactile Drive Pads**: Sequential gear shifter and throttle/brake pedals (`DriveControls.vue`).

### 5. `HarmonicVisualizer.vue` & `SoundProfileCard.vue` (Sound Lab)

- **Living Acoustic Engine Studio**:
  - **Harmonic Visualizer**: Real-time acoustic frequency spectrum computing 4-stroke firing frequency (`RPM × cylinders ÷ 120`) and harmonic resonance.
  - **Sound Profile Selector**: Sculptural vehicle character cards (Suzuki Brezza, Ford Mustang V8, Porsche Flat-6, Formula V12, Supra Turbo, Skyline GT-R, Golf R, Civic Type R, Lamborghini V10).
  - **Soundstage Blueprint**: Top-down automotive acoustic blueprint displaying animated sound wave propagation rings for `front`, `rear`, and `all` speaker zones.
  - **Acoustic Music Ducking**: Automatic engine synthesis attenuation slider when media plays.

### 6. `GoogleMap.vue` & Smart Navigation

- Embedded Google Maps JavaScript API with dark cartography (`mapId`), GPS recentering, directions handoff, and fallback offline canvas map.
- Quick category search shortcuts: Fuel/EV Chargers, Parking, Coffee, Saved places.

### 7. Automotive Utilities Drawer & Diagnostics Modal

- **De-Duplicated App Drawer**: Contains secondary tools (Hands-Free Phone, FM Radio Tuner, 360°/Reverse Camera, Vehicle Diagnostics, Bluetooth Pairing) without repeating navigation rail destinations.
- **Vehicle Systems Inspector**: Live diagnostics modal displaying OBD-II telemetry, engine physics, throttle/brake %, and green driving score penalties.
- **Reverse Camera HUD**: Dynamic parking guidelines with obstacle distance radar.

---

## 🎨 Design Tokens & Palette

| Token             | Value                    | Role & Usage                                   |
| ----------------- | ------------------------ | ---------------------------------------------- |
| `--bg`            | `#0B0F0D`                | Main screen background                         |
| `--panel`         | `#151A17`                | Card background                                |
| `--panel-glass`   | `rgba(21, 26, 23, 0.78)` | Smoked glassmorphic cards & overlays           |
| `--line`          | `rgba(241, 239, 232, 0.11)`| Frosted structural borders                    |
| `--acid`          | `#D9FF78`                | Electric lime active indicator, tachometer arc |
| `--amber`         | `#E7BF76`                | Exhaust heat, shift warning, redline zone      |
| `--ink` / `--text`| `#F1EFE8`                | Primary text and instrumentation figures       |
| `--muted`         | `#89918B`                | Technical captions, subtitles, and units       |
| `--blue`          | `#A9C8FF`                | City speed zone & navigation badges            |
| `--green`         | `#34C759`                | Eco drive score & rear camera guide            |
| `--red`           | `#FF453A`                | Critical alerts & stop boundary                |

---

## 📱 Landscape Responsiveness

The launcher automatically adapts across automotive screen sizes via `--ui-scale`:

- **1024 × 600** (Standard 7-inch Android head unit)
- **1280 × 720** (HD 9-inch / 10-inch Android head unit)
- **1920 × 1080** (Full HD automotive display)
