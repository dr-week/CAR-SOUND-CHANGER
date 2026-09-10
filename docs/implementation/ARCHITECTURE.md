# Implementation architecture

## Delivery model

The app is a Vite-served, installable Progressive Web App built with Vue 3, TypeScript, and Web Audio. It needs no backend for the initial simulator: state and audio run locally in the browser. Deploying the static build to any HTTPS host enables installation on Android, iOS, and desktop browsers.

## Folder ownership

| Folder | Responsibility |
| --- | --- |
| `src/domain/vehicle` | Pure vehicle profiles, state, and physics; no browser APIs. |
| `src/domain/scoring` | Pure local eco-driving points rules; no browser APIs. |
| `src/application/controllers` | Coordinates domain state and infrastructure. |
| `src/application/bootstrap` | Creates and wires the application. |
| `src/infrastructure/audio` | Web Audio implementation. |
| `src/infrastructure/input` | Keyboard and future hardware input adapters. |
| `src/infrastructure/telemetry` | GPS and future OBD-II/Bluetooth adapters. |
| `src/presentation/dashboard` | DOM rendering and interactions. |
| `src/presentation/styles` | Presentation-only CSS. |
| `public` | PWA manifest, service worker, and static assets. |
| `scripts/windows` | Windows operational tooling, isolated from the root. |
| `docs/implementation` | Decisions and delivery plan. |

## Current functional scope

- W accelerates and S brakes; 1/Numpad 1 upshifts and 2/Numpad 2 downshifts.
- The Brezza profile uses a five-speed manual layout and a 1,500 RPM suggested shift point.
- F1, Mustang, and Porsche profiles are parameter sets for the generated sound.
- Web Audio makes a synthesized engine sound after an explicit user gesture.
- GPS speed is optional and uses browser geolocation permission. No Google service, account, or API key is required.
- Bluetooth playback is selected by the operating system/browser audio route. Web browsers cannot reliably force a specific Bluetooth speaker.
- Green scoring is local-only and separated from vehicle, audio, and telemetry code.

## Planned integrations

1. Add `infrastructure/telemetry/WebBluetoothObdAdapter.js` for a supported BLE OBD-II device. Browser Bluetooth availability is limited, particularly on iOS.
2. Add a telemetry arbitration policy in `domain/vehicle` to choose OBD-II, GPS, or simulated speed by confidence and freshness.
3. Add asset-backed audio layers only for sounds you own or license; retain the synthesizer as an offline fallback.
4. Add a server only for optional profile sync, licensed sound-library delivery, authentication, or fleet telemetry. Keep real-time driving audio local.

## Dependencies

Runtime: browser APIs only (Web Audio, Geolocation, Service Worker). Development: Vite. No Google Maps dependency is appropriate for the current GPS-speed requirement.

## Validation and launch

Run `npm install`, then `npm run dev`. On Windows, run `scripts\\windows\\launch-car-sound-mod.bat`; it stops the process currently listening on port 5173 before starting a fresh instance. Run `npm run check` before changes and `npm run build` for a production bundle.
