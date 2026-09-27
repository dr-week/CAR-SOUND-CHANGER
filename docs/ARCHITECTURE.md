# Architecture

## Runtime split

The repository currently contains a Vue 3 PWA for rapid UI validation and an early Android bridge. The production direction is a lightweight native Kotlin/Jetpack Compose launcher. Domain rules remain independent; browser and Android capabilities live behind adapters.

```text
UI (Vue prototype / Compose production)
  -> application use cases
     -> pure vehicle and audio domain
     -> capability ports
        -> web adapters
        -> portable Android adapters
        -> optional vendor/device-profile adapters
```

## Ownership

- `src/domain`: pure vehicle and audio rules; no Vue, DOM, Web Audio, or Android imports.
- `src/application`: sessions, use cases, capability ports, and state orchestration.
- `src/infrastructure`: Web Audio, location, Bluetooth, media, and Android-facing adapters.
- `src/presentation` and `src/app`: views and interaction only.
- `android`: native launcher shell and bridge experiments.

The launcher shell composes focused controllers: navigation, preferences, media, overlays, device state, and engine audio. `App.vue` wires them together; it must not reimplement their state or persistence.

## Modular UI ownership

`MediaPlayer.vue` is the stable composition entry point. Its private `components/media/` folder owns demo playlist data, `usePreviewPlayback` state/lifecycle, and scoped styles grouped by player, artwork, transport, and Home. The preview controller is not a native media adapter. Preserve existing props/events during extraction and run behavior tests before adding features.

Follow the module-size review thresholds in CONTRIBUTING. Next structural debt: split `styles/app.css` by feature, then review the remaining large legacy components. Do not move unrelated code or create arbitrary numbered file chunks.

`HomeView.vue` only composes and forwards events. `views/home/DriverPanel.vue` owns speed/map selection; `MediaPanel.vue` owns media/phone/apps selection; `PhoneWidget.vue` owns call presentation. `SwipeSurface.vue` owns gesture recognition. Styles are grouped by panel/widget, with layout owned by Home. No changes to these modules should alter the persistent right-side dock.

Home always renders the speedometer face. Numeric speed and its needle require active telemetry and a finite nonnegative reading; otherwise use a dash and signal icon. Do not display simulated drivetrain values or fabricated heading. Missing call data never establishes phone connectivity. Native call command support remains a separate integration requirement. The prioritized UI work queue lives only in [UI/UX design](./UI_UX_DESIGN.md).

## Native capability model

`CapabilityRegistry` is the only UI entry point for device features. Suggested ports are `AppCatalog`, `MediaController`, `NavigationLauncher`, `AudioFocusController`, `RadioController`, `DspController`, `CameraController`, `SteeringKeySource`, `VehicleSignalSource`, and `AudioZoneController`.

Each reports `available`, `launch-only`, `controllable`, or `unavailable`. This keeps guessed vendor behavior out of presentation code and lets one APK support multiple head units through small device profiles.

## Core flows

```text
Installed apps -> AppCatalog -> deduplicate/filter -> All Apps -> launch intent
Active player -> MediaSession -> normalized now-playing -> Home/Media controls
Engine start -> foreground service -> audio focus -> synth -> safe duck/pause
Hardware action -> CapabilityRegistry -> verified adapter -> fallback/settings
```

## Non-negotiable boundaries

- Home contains navigation context and current media, not engine or DSP controls.
- Simulated data is visibly marked and never presented as live hardware state.
- Vendor package names, broadcasts, MCU protocols, and privileged APIs belong only in tested device profiles.
- Camera and safety functions remain owned by the stock system unless proven safe to integrate.
- New durable knowledge updates an existing document; do not add one-off reports.

See [Android integration](./ANDROID_INTEGRATION.md) for the implementation plan and [Audio system](./AUDIO_SYSTEM.md) for engine/EQ behavior.
