# Engineering plan

## Quality target

This is a local-first, installable Vue 3 + TypeScript application designed as a demonstrable engineering portfolio project. The implementation prioritizes correctness, clear dependency direction, privacy, and deployability over unnecessary backend complexity.

## Required stack

| Concern | Decision | Reason |
| --- | --- | --- |
| UI | Vue 3 Composition API, TypeScript strict mode | Mature component system with typed business boundaries. |
| Build | Vite | Fast, standard Vue development/build workflow. |
| Audio | Web Audio API | Low-latency local synthesis with no sound-hosting cost. |
| GPS | Browser Geolocation API | Permission-based local speed source. |
| Installation | PWA manifest + service worker | Installable browser app on supported mobile and desktop platforms. |
| Quality | ESLint + TypeScript checks | Automated, repeatable quality gate. |

## Dependency direction

`presentation → application → domain`

`infrastructure → application → domain`

The domain never imports Vue or browser APIs. The application composable is the composition root: it creates domain state and injects infrastructure. Presentation components consume typed props and emit typed events. This makes the audio engine, GPS source, and keyboard input replaceable without rewriting vehicle rules.

## Module responsibilities

| Module | Public responsibility | Must not contain |
| --- | --- | --- |
| `domain/vehicle` | Profiles, state contracts, deterministic physics | Vue, DOM, network code |
| `domain/scoring` | Green-score policy | Rendering, telemetry access |
| `application/composables` | Lifecycle and module coordination | Audio DSP or HTML strings |
| `infrastructure/audio` | Web Audio adapter | Vehicle physics |
| `infrastructure/input` | Keyboard adapter | UI rendering |
| `infrastructure/telemetry` | Geolocation and future OBD-II adapters | Score policy |
| `presentation/components` | Focused reusable Vue views | Direct browser API calls |
| `app` | Feature composition/root screen | Business calculations |

## Delivery phases

1. **Foundation — complete:** typed Vue/PWA simulator, keyboard and touch controls, synthesized audio, profile selection, GPS option, local green score, Windows single-instance launcher.
2. **Reliability:** add Vitest unit coverage for `vehiclePhysics` and `greenScore`; add Playwright smoke tests; add GitHub Actions CI for install, type-check, lint, build, and tests.
3. **Telemetry:** introduce a typed `TelemetrySource` interface, GPS freshness handling, then a local Web Bluetooth OBD-II adapter behind an explicit experimental flag.
4. **Sound quality:** define a licensed/owned sound asset pipeline and layer it behind an `EngineSoundOutput` interface. Never include copied Need for Speed or manufacturer recordings.
5. **Optional services:** only after a concrete need, add an authenticated API for user-owned profile sync. Maintain local operation when offline.

## Definition of done for every change

- Strict type check passes: `npm run check`.
- Lint passes: `npm run lint`.
- Production bundle passes: `npm run build`.
- New domain behavior has unit coverage once the test phase is added.
- No new telemetry, third-party script, cloud API, or permission is introduced without updating the privacy document.
