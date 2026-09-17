# Car Sound Mod Launcher

A lightweight, landscape-first Android car-launcher prototype with Google Maps, media controls, an installed-app surface, and a configurable synthetic engine-audio layer.

The current build is a Vue 3 PWA used to design and validate the experience. Becoming a real default Android launcher, reading installed apps, controlling radio/camera/DSP hardware, and routing front/rear audio require the native Android bridge described in [docs/ANDROID.md](./docs/ANDROID.md).

## Current experience

- Calm 1024 × 600 landscape interface
- Home with destination, map, and current media
- Lazy Google Maps loading with an artistic offline fallback
- Media, Navigation, All Apps, Engine, and Settings surfaces
- Persistent 100–130% interface scaling
- Synthetic engine profiles with music-aware ducking
- Offline-capable production bundle
- English-only active UI

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
npm run lint
npm run test
npm run build
```

## Google Maps

Copy `.env.example` to `.env.local`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_restricted_browser_key
VITE_GOOGLE_MAPS_MAP_ID=optional_map_style_id
```

Restrict the browser key to the Maps JavaScript API and approved origins. The future Android build must use a separate Android-restricted key. Without a key, the launcher keeps its offline map and Google Maps URL handoff.

## Repository

```text
src/
  app/             launcher shell and surfaces
  application/     use cases, ports, and Vue composition
  composition/     dependency wiring
  domain/          vehicle, audio, and scoring rules
  infrastructure/  Web Audio, GPS, Bluetooth, and input adapters
  presentation/    launcher, map, components, and styles
docs/               maintained project documentation
tests/              cross-module tests
```

## Documentation

- [Documentation index](./docs/INDEX.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Development](./docs/DEVELOPMENT.md)
- [UI/UX system](./docs/UI_DESIGN.md)
- [UI/UX audit](./docs/UX_AUDIT.md)
- [Audio system](./docs/AUDIO_SYSTEM.md)
- [Android integration](./docs/ANDROID.md)
- [Contributing](./CONTRIBUTING.md)

## Safety and truthfulness

- Do not operate complex controls while driving.
- The web prototype cannot determine whether the vehicle is moving.
- Static media, network, battery, and temperature values are design placeholders until native providers replace them.
- Front/rear speaker routing is a requested preference until the device exposes compatible DSP or audio-HAL controls.
- Google Maps requests are governed by Google Maps Platform terms; this project has no first-party analytics.

## Status

Type checking, production build, and 73 automated tests pass. Physical head-unit testing and the native Android shell remain required before in-car release.
