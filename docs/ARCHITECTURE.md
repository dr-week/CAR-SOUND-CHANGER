# Architecture

## Runtime today

The current product is a Vue 3 + TypeScript PWA. Vite builds a small static bundle and service worker. Browser adapters provide Web Audio, geolocation, keyboard input, and optional Bluetooth state.

```text
Vue launcher
    ↓ commands / rendered state
Application services and ports
    ↓ domain operations
Vehicle, audio, and scoring domain
    ↑ implementations
Web Audio, geolocation, input, Maps
```

## Boundaries

### Domain — `src/domain`

Pure vehicle physics, engine-sound policy, profiles, controls, and scoring. It must not import Vue, DOM, Web Audio, Google Maps, or Android APIs.

### Application — `src/application`

Coordinates driving sessions and exposes ports such as `EngineSoundOutput`. Vue composables adapt application state for presentation.

### Infrastructure — `src/infrastructure`

Implements browser/device concerns: synthesized Web Audio output, geolocation, Bluetooth capability state, and keyboard input.

### Composition — `src/composition`

Creates concrete adapters and injects them into application services. Keep construction here instead of importing infrastructure directly into the domain.

### Presentation — `src/app` and `src/presentation`

Owns launcher navigation, components, Google Maps rendering, interaction states, and CSS. It may call application APIs but must not implement vehicle or audio algorithms.

## Main flows

### Engine audio

```text
input or GPS → DrivingSession → vehicle state → EngineSoundOutput → WebAudioEngine
```

The launcher can leave the Engine screen while the application session continues. Music-aware reduction currently changes engine output volume in the launcher state. Native Android must replace this with audio-focus-aware behavior.

### Navigation

```text
launcher → lazy Google Maps loader → browser geolocation
launcher → Google Maps api=1 URL → external directions
```

If the Maps key or network is unavailable, presentation renders the local fallback. `.env.local` is never committed.

## State ownership

- Domain state: vehicle, RPM, gear, profile, score.
- Application state: session lifecycle and control intent.
- Launcher state: active surface, UI scale, map query, engine mix preferences.
- Native future state: installed apps, phone, media session, driving state, radio, camera, DSP, and system telemetry.

Persist only user preferences. Do not persist precise location or fabricate device state.

## Native migration

Keep the domain and application boundaries. Replace browser infrastructure with Kotlin adapters and connect the UI through a small bridge or migrate presentation to Compose. Details are in [ANDROID.md](./ANDROID.md).
