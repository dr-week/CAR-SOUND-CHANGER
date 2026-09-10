# App completion plan

## Completion target

Deliver an installable, local-first car-sound simulator that runs in a browser/PWA, supports keyboard and touch control, optionally reads browser GPS speed, produces synthetic engine sound, and is safe to demonstrate as a portfolio project. It is **not** a vehicle-control application.

## Non-negotiable engineering constraints

- Make the smallest safe change that completes a task; do not add a framework, server, device permission, or package without a demonstrated need.
- Keep modules focused. A file that gains unrelated responsibilities must be split before extending it.
- Preserve dependency direction: domain has no browser/Vue imports; application services and ports do not import infrastructure types; presentation never calls device APIs directly. A dedicated composition root may wire application contracts to infrastructure implementations.
- Add or update tests before changing domain rules, scoring, telemetry selection, or control behavior.
- Never send GPS, Bluetooth, vehicle, or score data off-device without an explicit, separately approved product requirement.
- Treat OBD-II/Web Bluetooth as optional, experimental input only. Never issue vehicle commands or make safety/performance claims.
- The launcher may manage only verified project processes on explicit local ports; it must refuse uncertain targets.
- The launcher must require its configured port rather than silently accepting a fallback port.
- Bind development and preview servers to localhost by default. LAN exposure requires an explicit, documented opt-in command.
- Validate external/UI identifiers at runtime; TypeScript types do not replace input validation.
- Keep third-party dependencies minimal, licensed, pinned by lockfile, and reviewed for their permissions and transitive impact.
- Format all source and Vue templates consistently before public release; passing lint alone is not sufficient for reviewability.

## Current baseline

| Capability                                | Status                                                        | Code owner                               |
| ----------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| Vue 3 + strict TypeScript app shell       | Complete                                                      | `src/app`, `src/main.ts`, `public`       |
| Installable/offline PWA behavior          | Planned — shell only is present                               | `public`, build configuration            |
| Keyboard controls                         | Complete                                                      | `infrastructure/input`                   |
| Touch controls                            | Prototype — cancellation handling remains                     | `presentation/components`                |
| Brezza, Mustang, Porsche, F1 profiles     | Complete                                                      | `domain/vehicle/carProfiles.ts`          |
| Five-speed Brezza setup and RPM model     | Prototype — profile-specific drivetrain data remains          | `domain/vehicle`                         |
| Synthetic engine audio                    | Complete as prototype                                         | `infrastructure/audio`                   |
| Optional GPS speed                        | Prototype — failure/status handling remains                   | `infrastructure/telemetry`               |
| Green-driving score                       | Prototype — scoring model/reset remains                       | `domain/scoring`                         |
| Source type check, lint, tests, build     | Complete locally — test/config quality coverage remains       | `src`, `tests`, package scripts          |
| GitHub Actions CI                         | Prepared; inactive until repository is initialized and pushed | `.github/workflows`                      |
| Windows start/restart/test launcher       | Prototype — strict-port/restart hardening remains             | `scripts/windows`                        |
| Deployment hosting/security configuration | Planned                                                       | deployment configuration, `docs/release` |

## Milestone 1 — stabilize the demo

**Goal:** make every current feature reliable and clear in a portfolio demo.

| Task                                                | Module                                                 | Acceptance criterion                                                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Add unavailable/denied GPS UI states                | `presentation/components`, `BrowserGeolocation`        | The user sees a clear local error message without a console error or broken control state.                                                 |
| Add typed telemetry status                          | `application/ports`, `BrowserGeolocation`              | The UI distinguishes inactive, active, unavailable, denied, errored, and stale GPS states.                                                 |
| Add audio unsupported/suspended UI states           | `WebAudioEngine`, `App.vue`                            | Audio button communicates whether browser audio is ready, blocked, or unsupported.                                                         |
| Add reset-drive action                              | `DrivingSession`, `DriveControls.vue`                  | Reset returns simulated state and green score to profile defaults.                                                                         |
| Harden pointer control lifecycle                    | `DriveControls.vue`                                    | Pointer capture, pointer-up, pointer-cancel, lost-capture, and window blur always release throttle/brake.                                  |
| Make active controls visibly pressed                | `DriveControls.vue`                                    | Keyboard and pointer interactions have matching visible states.                                                                            |
| Add empty-state speed-source label                  | `TelemetryPanel.vue`                                   | User can see `Simulation` or `GPS` as the active source.                                                                                   |
| Move driving action contracts out of infrastructure | `domain/vehicle` or `application/ports`                | `DrivingSession` imports no infrastructure type or implementation.                                                                         |
| Extract a composition root                          | `src/composition` or `src/bootstrap`                   | Only this layer wires concrete infrastructure adapters to application contracts; application services/ports have no infrastructure import. |
| Validate vehicle-profile selection                  | `domain/vehicle`, application layer                    | Invalid profile identifiers cannot produce an undefined profile or crash the simulator.                                                    |
| Bind local development safely                       | `package.json`, `scripts/windows`                      | Default dev/preview servers bind only to localhost; LAN sharing is a separate explicit command.                                            |
| Enforce the launcher port                           | `scripts/windows`                                      | Vite fails clearly when the configured port is unavailable; restart waits for a verified project process to exit.                          |
| Bootstrap every launcher action                     | `scripts/windows`                                      | `start`, `test`, `build`, and `preview` install lockfile dependencies when `node_modules` is absent.                                       |
| Format source consistently                          | Formatting configuration, `src`                        | Source and Vue templates have a stable, reviewable format applied by one command.                                                          |
| Test control lifecycle                              | `tests/unit/application`, component tests              | Releasing controls, pointer cancellation, lost capture, and window blur always remove throttle/brake.                                      |
| Expand quality-gate scope                           | `tsconfig.json`, ESLint configuration, package scripts | Type checks and lint cover `src`, `tests`, and maintained configuration/operational scripts; CI enforces the same scope.                   |

**Exit gate:** all quality commands pass over source and test code; demo runs for five minutes with keyboard, touch cancellation, profile changes, audio toggle, GPS permission denial, and an unavailable GPS API tested manually. Application services/ports have no infrastructure import, and the dedicated composition root is the only layer that creates infrastructure adapters.

## Visual direction — original automotive instrument cluster

**Reference:** user-provided dashboard image. It is a mood/layout reference only. Do not reproduce its artwork, logo, proprietary marks, exact gauges, icons, or assets.

**Design goal:** replace the generic telemetry-card layout with an original, legible driving interface that feels like a modern performance instrument cluster while preserving keyboard, touch, and accessibility behavior.

| Visual element           | Original implementation direction                                                                                                                         | Module                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Surface                  | Near-black layered background with a subtle CSS-only diagonal/carbon-inspired texture. No downloaded image texture.                                       | `presentation/styles`                                           |
| Primary instrument       | Central responsive tachometer driven by current RPM and redline values. Use SVG/CSS primitives generated from vehicle profile data, not copied gauge art. | `presentation/components/Tachometer.vue`                        |
| Needle/range             | Smooth animated needle, clear idle/redline bands, numeric RPM label, and reduced-motion fallback.                                                         | `presentation/components/Tachometer.vue`, `presentation/styles` |
| Gear display             | Prominent digital gear display integrated beside/below the tachometer, with shift feedback from `DrivingSession`.                                         | `presentation/components/GearDisplay.vue`                       |
| Direction/shift controls | Accessible left/right or up/down shift affordances that supplement, but never replace, the existing `1`/`2` keyboard controls.                            | `presentation/components/DriveControls.vue`                     |
| Status row               | Small labeled indicators for audio, GPS source/status, green score, and future telemetry connection; color is never the sole signal.                      | `presentation/components/StatusIndicators.vue`                  |
| Color system             | Charcoal/black base; red reserved for redline/brake/error; amber for caution/stale data; green for active/efficient state; high-contrast neutral text.    | `presentation/styles/tokens.css`                                |

### Visual implementation tasks

| Task                            | Acceptance criterion                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Define design tokens            | Colors, spacing, typography, elevation, focus state, motion duration, and gauge dimensions are CSS custom properties; components contain no hardcoded theme colors. |
| Build a data-driven tachometer  | The dial derives ticks, labels, redline, RPM, and animation from `VehicleProfile`/`VehicleState`; no visual state is duplicated in the component.                   |
| Preserve responsive operation   | A 320 px-wide mobile layout remains usable with touch controls; desktop retains keyboard operation and does not require hover.                                      |
| Meet accessibility requirements | Text alternatives and labels exist for gauges/indicators; contrast and focus remain visible; `prefers-reduced-motion` disables needle sweep animation.              |
| Keep visual assets original     | CSS/SVG code and self-created iconography only; no extracted image, logo, game asset, or vehicle-manufacturer artwork.                                              |
| Add visual regression coverage  | Component-level tests verify rendered RPM/gear/status text; a manual screenshot checklist verifies mobile and desktop layouts.                                      |

**Visual exit gate:** the UI clearly communicates RPM, gear, speed source, audio state, and driving status at a glance; it remains accessible without color perception, motion, or pointer-only interaction.

## Milestone 2 — audio quality and realistic control model

**Goal:** make the simulation feel intentional without copied recordings.

| Task                                                           | Module                                        | Acceptance criterion                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace hardcoded oscillator mix with profile sound parameters | `domain/audio`, `WebAudioEngine`              | Each profile defines harmonics, gain, and response values; adapter has no car-specific constants.                                                                |
| Add profile-specific drivetrain data                           | `domain/vehicle`                              | Each profile owns validated gear ratios and required drivetrain constants; profile gear count and ratio count cannot diverge.                                    |
| Define score semantics                                         | `domain/scoring`, product documentation       | The score is explicitly either a 0–100 rolling rating, a session score, or an achievement counter; rewards, penalties, cap, and reset behavior are test-covered. |
| Add engine states                                              | `domain/vehicle`                              | Idle, acceleration, lift-off, shift, and braking transitions have deterministic behavior.                                                                        |
| Add clutch/shift transient                                     | `domain/audio`, `application/services`        | Up/down shift creates a brief RPM drop and audio transition without clicks.                                                                                      |
| Add volume and mute preference                                 | `presentation/components`, `application`      | Settings affect only local audio and persist locally using a dedicated preference adapter.                                                                       |
| Define owned/licensed asset interface                          | `application/ports`                           | A future asset player can replace or layer synthesis without changing domain code.                                                                               |
| Add deterministic audio-domain checks                          | `tests/unit/domain`, `tests/unit/application` | Profile parameters, gain bounds, state transitions, and calculated oscillator frequencies are validated without requiring a physical audio device.               |

**Exit gate:** no copyrighted game/manufacturer sound asset is used; profile sound differences are audible; no clipping at normal volume; automated tests cover sound parameter and transition invariants.

## Milestone 3 — telemetry adapter foundation

**Goal:** prepare GPS and OBD-II cleanly without claiming unsupported browser capabilities.

| Task                                         | Module                                       | Acceptance criterion                                                                                                                                                               |
| -------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add `TelemetrySource` application port       | `application/ports`                          | GPS and simulated data expose one typed speed/RPM contract.                                                                                                                        |
| Validate telemetry values at the boundary    | `application/ports`, `domain/telemetry`      | Non-finite, negative, stale, and physically implausible readings cannot mutate vehicle state or reach the audio layer.                                                             |
| Add telemetry freshness/confidence policy    | `domain/telemetry`                           | The app selects OBD-II, GPS, or simulation by documented priority and stale-data timeout.                                                                                          |
| Improve GPS speed smoothing                  | `domain/telemetry`                           | Outliers cannot cause a sudden audio/RPM spike.                                                                                                                                    |
| Add optional Web Bluetooth OBD-II prototype  | `infrastructure/telemetry/obd`               | Device selection requires an explicit gesture; data stays local; unsupported browsers show a feature message.                                                                      |
| Run a time-boxed Bluetooth feasibility spike | `docs/decisions`, `infrastructure/telemetry` | Browser support, selected adapter protocol, pairing, reconnection, iOS constraints, and local-only behavior are evidenced; a documented go/no-go decision precedes prototype work. |
| Define source diagnostics UI                 | `presentation/components`                    | User can inspect source, update age, and connection status.                                                                                                                        |

**Exit gate:** GPS continues working when Bluetooth is absent; telemetry validation blocks invalid readings; Bluetooth features remain isolated and marked experimental, particularly for iOS.

## Milestone 4 — PWA and release readiness

**Goal:** make installation and offline behavior demonstrable.

| Task                               | Module                                              | Acceptance criterion                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add generated PNG PWA icons        | `public/icons`                                      | Android/desktop install prompts use proper raster icons; iOS has an Apple touch icon.                                                                           |
| Define offline cache strategy      | PWA build configuration, `public/service-worker.js` | The hashed production JavaScript, CSS, icons, manifest, and HTML shell are precached after first load; version updates remove stale cache.                      |
| Define deployment base path        | Vite configuration, manifest, service worker        | The app is tested at both a domain root and a repository subpath; routes, PWA start URL, cache URLs, and assets resolve in the selected hosting model.          |
| Select deployment target and owner | `docs/release`, hosting configuration               | A named static host, release owner, deployment mechanism, rollback procedure, and environment/base-path configuration are documented before release.            |
| Define static-host security policy | Hosting configuration, `docs/release`               | HTTPS is required; host-specific CSP permits only required local assets; `Permissions-Policy` limits geolocation to the app; no third-party scripts are loaded. |
| Add install guidance               | `presentation/components`                           | Browser-specific install instructions appear only when relevant.                                                                                                |
| Add accessibility audit            | `presentation`                                      | Keyboard navigation, visible focus, labels, contrast, and reduced-motion behavior meet practical WCAG 2.2 AA expectations.                                      |
| Add browser test matrix            | `docs/release`                                      | Chrome Android, Chrome desktop, Edge desktop, Safari iOS, and Safari desktop behavior are recorded.                                                             |

**Exit gate:** a production build installs and launches offline on at least one Android/desktop browser; constraints for iOS are documented truthfully.

## Milestone 5 — portfolio delivery

**Goal:** package the work as evidence of engineering judgment.

| Task                              | Output            | Acceptance criterion                                                                                                             |
| --------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Capture a short demo              | `docs/portfolio`  | Shows audio enablement, controls, profile change, green score, GPS permission, and launcher test command.                        |
| Add architecture decision records | `docs/decisions`  | Records local-first choice, Web Audio design, telemetry boundary, and dependency policy.                                         |
| Add release notes                 | `CHANGELOG.md`    | Features, limitations, setup, and known browser differences are clear.                                                           |
| Configure repository metadata     | GitHub repository | README, license, issue templates, and CI status are present before public sharing.                                               |
| Activate and verify CI            | GitHub repository | Repository default branch matches the workflow trigger, Actions is enabled, and one pull request completes the quality workflow. |
| Add dependency-review process     | CI/documentation  | Production dependency audit is run in CI or release review; advisory upgrades are reviewed rather than applied automatically.    |

**Exit gate:** a reviewer can clone, run one launcher command, understand boundaries, see a completed GitHub Actions run, and explain the architecture from the documentation.

## Deferred intentionally

- Login, Google account flow, server database, profile sharing, and cloud telemetry.
- Forced Bluetooth speaker selection; browser/OS output routing controls this.
- Any driving-data upload or background tracking.
- Real vehicle control, safety-critical behavior, or claims of production OBD-II compatibility.

## Execution order

`Milestone 1 → Milestone 2 → Milestone 3 → Milestone 4 → Milestone 5`

Do not begin a new milestone until the prior exit gate passes. Each task must include tests when it changes domain/application behavior and must preserve the dependency rule: presentation and infrastructure cannot import each other directly.
