# UI/UX Design System - Avant-Garde Car Infotainment Launcher

Design system documentation for the **Car Sound Changer & Infotainment Launcher**.

---

## 🎨 Overview & Aesthetic Goals

The launcher UI/UX is built specifically for **landscape 16:9 / 16:10 automotive touchscreens** (e.g. Blaupunkt, Android head units, tablets). It follows an **avant-garde, dark glassmorphic automotive aesthetic**:

1. **High Contrast Dark Palette**: Deep obsidian backgrounds (`#0B0E14`) paired with glowing cyan (`#00F2FE`), neon amber (`#FF9F0A`), and emerald green (`#34C759`) indicators.
2. **Glanceable Safety Controls**: All main touch targets are **64px+** in size, ensuring effortless operation while parked or mounted in a vehicle.
3. **100% English & Icon-Driven**: Clean iconography (Lucide icons) eliminates language barriers and minimizes textual clutter.
4. **Smooth 60 FPS Micro-Animations**: Hardware-accelerated CSS transitions and smooth canvas/SVG gauge needles.

---

## 📐 Screen Layout Grid (Landscape 16:9)

```
┌──────┬────────────────────────────────────────────────────────┐
│      │ InfotainmentHeader.vue (56px)                          │
│      │ [Clock · Date · GPS Speed · Bluetooth Status · Volume] │
│      ├────────────────────────────────────────────────────────┤
│ Side │                                                        │
│ Dock │                                                        │
│ 72px │ Main View Container (Dashboard / Google Map / Audio)   │
│      │                                                        │
│      │                                                        │
│      │                                                        │
└──────┴────────────────────────────────────────────────────────┘
```

---

## 🧩 UI Components & Modules

### 1. `SidebarDock.vue`

- **Position**: Fixed left navigation bar (72px width).
- **Tabs**:
  - `Home`: Main Cockpit Instrument Dashboard.
  - `Gauges`: Focused Speedometer & Tachometer view.
  - `Media`: Interactive Music / Audio Engine Controls.
  - `Sound Lab`: Vehicle Sound Profile Selector (Brezza, Mustang, Porsche, F1, Supra, etc.).
  - `All Apps`: Triggers `AppDrawer.vue` modal grid.
  - `Settings`: Launcher preferences and audio output controls.

### 2. `InfotainmentHeader.vue`

- **Position**: Fixed top status bar (56px height).
- **Widgets**:
  - Digital 24-hour clock and date.
  - Live GPS Speed badge (`active` / `stale` / `inactive`).
  - Web Bluetooth connectivity status and device name.
  - Master volume control slider with instant mute toggle.

### 3. `InstrumentDashboard.vue`

- **Dual Analog/Digital Cockpit Gauges**:
  - **Tachometer (RPM)**: Live RPM readout, dynamic redline glow, gear shift indicator.
  - **Speedometer (Km/h)**: GPS/simulated speed display with top speed scaling.
  - **Drive Controls**: Touch acceleration/brake pedals and manual sequential gear shift up/down buttons.
  - **Eco-Driving Score**: Real-time Green Driving score (0–100) with penalty breakdown.

### 4. `AppDrawer.vue`

- **Modal App Launcher Grid**:
  - Displays icons for popular Android car apps: **Google Maps**, **Spotify**, **FM Radio**, **Phone / Bluetooth Call**, **Car Sound Lab**, **Settings**.
  - Includes a quick search bar to filter installed applications.

### 5. `GoogleMap.vue`

- Embedded live Google Map with custom dark theme map styling (`mapId`), vehicle location marker, recenter button, and fallback offline map visualization.

---

## 🎨 Color Palette

| Token             | Hex                      | Usage                                    |
| ----------------- | ------------------------ | ---------------------------------------- |
| `--bg-dark`       | `#0B0E14`                | Main screen background                   |
| `--surface-glass` | `rgba(22, 28, 38, 0.75)` | Glassmorphic cards and modal overlays    |
| `--accent-cyan`   | `#00F2FE`                | Primary active tab & speedometer accents |
| `--accent-orange` | `#FF9F0A`                | Tachometer needle & redline warning      |
| `--accent-green`  | `#34C759`                | Active GPS fix & Eco Green score         |
| `--text-primary`  | `#F2F4F8`                | Primary readable text                    |
| `--text-muted`    | `#8A94A6`                | Secondary labels and metadata            |

---

## 📱 Landscape Responsiveness

The launcher layout automatically scales to standard head unit display resolutions:

- **1024 × 600** (Standard 7-inch Android head unit)
- **1280 × 720** (HD 9-inch / 10-inch Android head unit)
- **1920 × 1080** (Full HD automotive display)
