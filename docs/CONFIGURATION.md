# Configuration & Vehicle Profiles Guide

Configuration reference for **Car Sound Changer & Infotainment Launcher**.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` for local development:

```env
# Google Maps JavaScript API Key (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional Google Map Style ID
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

---

## 🚗 Vehicle Profiles (`src/domain/vehicle/carProfiles.ts`)

Vehicle profiles define the simulation physics, transmission gears, and engine timbre characteristics:

```typescript
export const CAR_PROFILES = {
  brezza: {
    id: "brezza",
    name: "Suzuki Brezza 2021",
    cylinders: 4,
    gears: 5,
    idleRpm: 800,
    redlineRpm: 6500,
    shiftRpm: 1500,
    baseTone: 58,
    topSpeedKph: 180,
  },
  mustang: {
    id: "mustang",
    name: "Ford Mustang V8",
    cylinders: 8,
    gears: 6,
    idleRpm: 750,
    redlineRpm: 7000,
    shiftRpm: 2800,
    baseTone: 42,
    topSpeedKph: 240,
  },
  supra: {
    id: "supra",
    name: "Supra-inspired Inline-6 Turbo",
    cylinders: 6,
    gears: 6,
    idleRpm: 800,
    redlineRpm: 7000,
    shiftRpm: 3500,
    baseTone: 52,
    topSpeedKph: 280,
    induction: "turbo",
  },
  // Additional profiles: porsche, f1, skyline, golf, civic, v10
};
```

---

## 🛠️ Adding a Custom Car Profile

To add a new vehicle profile:
1. Open `src/domain/vehicle/carProfiles.ts`.
2. Add your profile object to `CAR_PROFILES`.
3. Specify `cylinders`, `gears`, `idleRpm`, `redlineRpm`, `shiftRpm`, `topSpeedKph`, and optional `induction: "turbo"`.
