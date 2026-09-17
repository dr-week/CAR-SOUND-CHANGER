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

### UI correction backlog — instrument cluster review

**Evidence:** screenshot supplied by the user after the initial instrument-cluster implementation. The following issues are implementation defects, not changes to product scope.

#### P0 — correct before further visual work

| Issue                       | Observed problem                                                                              | Required correction                                                                                                     | Acceptance criterion                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Gear display collision      | The gear/speed card overlays the dial, redline arc, and upper-scale labels.                   | Give gear and speed a reserved layout region outside the SVG dial; do not use an absolute overlay on desktop or mobile. | At 320 px and desktop widths, the gear/speed display does not overlap any gauge tick, numeral, needle, or redline segment. |
| Missing visible needle      | The center RPM numeral is visible, but the needle is not perceptible at idle.                 | Increase needle contrast/length and ensure its idle angle is visible against the dial.                                  | At idle, mid-range, and redline, a tester can identify the needle position without relying on the numeric RPM text.        |
| Driving controls below fold | The oversized dial pushes throttle, brake, and shift controls outside the first viewport.     | Reorder the screen and reduce dial height so controls precede profile configuration.                                    | On a 320×640 mobile viewport, throttle, brake, and both shift controls are visible without scrolling after initial load.   |
| Speed is secondary          | Speed appears as small text within the gear card rather than as a primary driving instrument. | Add a dedicated digital speed display adjacent to gear, with its source label retained separately.                      | Speed is readable at a glance, independent of gear, and does not share its main visual area with the tachometer.           |

#### P1 — correct in the same visual stabilization milestone

| Issue                          | Observed problem                                                                                | Required correction                                                                                 | Acceptance criterion                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Ambiguous RPM scale            | Dial labels `0–7` have no `×1000 RPM` explanation.                                              | Add a persistent scale caption with accessible text.                                                | A new user can interpret `800 RPM` and the dial scale without prior product knowledge.              |
| Overweight redline             | The redline arc is visually larger than the needle and distracts from live RPM.                 | Narrow the arc and derive its start/end precisely from the selected profile.                        | Redline is visible as a limit indicator but does not obscure labels, needle, or gear/speed display. |
| Duplicate audio state          | Header text and status row communicate the same inactive-audio state.                           | Give each status element a unique role: one action/result message and one compact system indicator. | No repeated status phrase appears simultaneously; status row contains distinct system information.  |
| Excess header whitespace       | The header pushes the primary instrument and controls down the page.                            | Reduce vertical spacing and keep header content compact.                                            | The primary driving controls remain above the fold in the target mobile viewport.                   |
| Incorrect information priority | Vehicle configuration is visible before the driving controls required to operate the simulator. | Order content as: instrument/speed → primary controls → system status → vehicle configuration.      | A user can start, accelerate, brake, shift, and read feedback before encountering configuration.    |

#### Verification checklist

- Capture manual screenshots at 320×640, 390×844, and desktop widths after each layout change.
- Test idle, acceleration, braking, and redline values for every vehicle profile.
- Verify keyboard-only operation and visible focus states after visual reordering.
- Verify `prefers-reduced-motion` retains a readable static needle position.
- Add component tests for the displayed RPM value, `×1000 RPM` caption, gear, speed, and source label.

### UI correction backlog — second visual review

**Evidence:** follow-up screenshot supplied by the user after the first P0 layout pass.

| Priority | Issue                              | Observed problem                                                                               | Required correction                                                                                                   | Acceptance criterion                                                                             |
| -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| P1       | Tachometer center collision        | The RPM caption competes with the hub and makes the needle’s idle position difficult to read.  | Reserve separate center zones for RPM value, unit/scale caption, hub, and needle; do not render text through the hub. | At idle and mid-range, RPM, scale caption, hub, and needle are independently legible.            |
| P1       | Disconnected digital readouts      | Gear and speed are two unrelated cards with uneven visual hierarchy.                           | Treat gear and speed as one grouped digital readout with consistent label, value, unit, and border treatment.         | Gear and speed scan as one information group without reducing speed prominence.                  |
| P1       | Excessively heavy controls         | The five large control tiles dominate the screen more than the driving instruments.            | Reduce non-primary key visual weight; preserve distinct brake/accelerator affordances and clear touch targets.        | RPM, gear, and speed remain the first visual scan target; controls are accessible but secondary. |
| P1       | Status cards near viewport edge    | The status row appears compressed against the lower boundary after the controls.               | Add stable bottom spacing and allow status cards to wrap or stack gracefully on narrow screens.                       | At the target mobile viewports, all status cards are fully visible with spacing below them.      |
| P2       | Ambiguous speed source label       | The speed card shows `Speed · Simulation`, mixing measurement and source in one cramped label. | Use `Speed` as the label and a separate concise source badge/secondary label.                                         | Measurement, unit, and source are readable without forced or awkward line wrapping.              |
| P2       | Shift semantics rely on text alone | `1` and `2` are valid keyboard labels but lack directional visual meaning.                     | Add original up/down chevrons or accessible directional labels while retaining the keyboard key labels.               | A touch-only user understands which control raises or lowers gear without reading the help text. |

**Second-review exit gate:** the instrument center, digital readouts, controls, and status row have clear visual hierarchy at mobile and desktop widths; no meaningful element is clipped, overlaps another, or relies on color alone.

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

## Focused implementation checkpoint — 2026-09-12

This checkpoint records implemented changes, not a claim that all milestone exit gates pass.

| Area | Change implemented | Verification |
| --- | --- | --- |
| Tachometer | Removed conflicting CSS needle transform; constrained mobile gauge width; moved the digital RPM below the needle sweep; red zone now starts at the profile redline rather than 1,000 RPM early. | Type check and build pass; visual browser/device review remains open. |
| Audio | Added mute/volume and teardown; replaced voices disconnect their oscillator and gain nodes; oscillators start at profile idle frequency instead of the browser's default 440 Hz; output starts silent. | New mocked Web Audio lifecycle regression test passes. Audible realism and physical output are not verified by this test. |
| Input and simulation | Keyboard shortcuts ignore form editing/modifier shortcuts; invalid GPS values, time steps, and gear commands are rejected. | Application regression tests pass. |
| GPS fallback | Stale/invalid/error status clears GPS speed so simulation can resume. | Device permission, freshness, and real GPS tests remain open. |
| Offline build | Production build emits a service worker precaching hashed assets; registration is production-only and paths are relative. | Build emits service worker; installed/offline browser behavior remains unverified. |
| Windows launcher | Waits for the stopped process and allows time to acquire the restart mutex. | Concurrent-launch/restart acceptance test remains open. |

Checks completed: TypeScript check, ESLint, 14 unit tests across 4 files, and production build pass.

Next required verification, in order:

1. Browser-check the needle and readouts at idle, acceleration, braking, and each profile; check narrow-screen overflow and touch/keyboard releases.
2. Listen at low volume through idle, gear changes, acceleration, deceleration, mute/resume, and profile changes. Synthetic output is not an exact recording of a named vehicle.
3. Exercise GPS denial/stale recovery, Windows restart/concurrent launch, and installed offline startup. Keep these gates open until observed.

## Deferred intentionally

- Login, Google account flow, server database, profile sharing, and cloud telemetry.
- Forced Bluetooth speaker selection; browser/OS output routing controls this.
- Any driving-data upload or background tracking.
- Real vehicle control, safety-critical behavior, or claims of production OBD-II compatibility.

## Execution order

### Sound and design checkpoint — 2026-09-17

#### Sound, simulation, and UI correction pass

##### Audio engineering follow-up

- Isolated bass filtering from exhaust brightness; added bounded, amplitude-only idle unevenness that settles under load.
- Resume clears stale voice gains; silent profile transitions now set the new frequencies before fading in, avoiding an old-to-new pitch slide.
- Fade automation holds the current scheduled value where supported, with a capture-before-cancel fallback.
- Failed graph construction closes/disconnects partial resources and allows retry. Disposal during asynchronous resume is detected safely.
- Invalid/zero turbo time steps no longer trigger blow-off or mutate charged boost.
- Unchanged audio parameter targets are not redundantly scheduled every frame; caches reset on profile changes, resume, and disposal.
- Verification is automated for these changes; subjective sound quality and physical-speaker listening remain unverified in this follow-up. No UI or server changes.

- Rebalanced exhaust versus bass; added cylinder-family body waveforms; filter follows firing frequency so high-RPM engines do not lose their fundamental. Deep pitch styling remains an artistic approximation.
- Profile changes fade layer gains to zero before changing waveforms. Drive reset now resets audio/turbo history. Gear shifts also unload turbo pressure.
- Application/domain corrections: brake overrides accelerator; profile selection clears held controls, old speed, score, and GPS mode; simulation caps elapsed time consistently and limits acceleration by gear redline and profile top speed without abruptly clamping existing overspeed.
- UI corrections: explicit zero-volume mute indication, disabled audio button during pending transitions, pedal-hold instructions, and larger settings/help text.
- Existing architecture remains client-only; no server, database, uploads, or new production dependencies were added.
- TypeScript, 61 tests across seven files, targeted lint, and production build pass. Browser verification exercises acceleration, simultaneous brake, profile reset, volume-zero feedback, and actual Web Audio output. Physical listening and Safari/iOS verification remain open.

#### Listening feedback: deep sports exhaust

- Added four turbo presets (Supra-inspired inline-six, Skyline-inspired twin turbo, Golf R-inspired four-cylinder, Civic Type R-inspired four-cylinder) and a naturally aspirated Lamborghini-inspired V10: nine choices total.
- Turbo presets get a quiet, load-built spool layer and a short throttle-lift air release. Idle and naturally aspirated presets have no turbo layer. Envelope policy is isolated in `domain/audio/TurboEnvelope.ts` and covered by regression tests.
- Names describe sound-inspired simulations; presets are not verified factory specifications or exact car recordings. Skyline's twin-turbo label uses the same simplified single boost envelope.

- User rejected the earlier tone as too artificial/high-pitched.
- Retuned all profiles toward bass: dominant 38–96 Hz rounded body pulses, quieter upper firing harmonics, 220–580 Hz low-pass range, and reduced low-frequency intake texture instead of hiss.
- Preserved RPM response, load changes, shift dips, master volume, and gain headroom. Bass pitch compression is an intentional artistic effect, not an authentic model of each engine.
- Added idle-to-redline bass/gain regression checks for every profile. Subjective approval and physical-speaker listening remain open; no UI changes in this pass.
- Verification after turbo/profile additions: TypeScript check, 53 tests across seven files, targeted lint, and production build pass. Updated sound has not been subjectively listened to in this pass; vehicle selector now identifies turbo versus naturally aspirated profiles.

- Implemented RPM-correct, load-sensitive layered sound; independent master volume; persistent audio graph; gear-change gain dip; explicit startup errors.
- Redesigned the active dashboard with an ivory/charcoal editorial layout, one clear tachometer, digital speed/gear, accessible controls, and mobile two-row pedals.
- Removed the misleading Bluetooth speaker picker from the active UI. Speaker routing stays in OS settings.
- Updated colocated audio tests and repaired the lint command's stale `tests` directory reference.
- Research, specific defects, architecture, verification evidence, and remaining listening/device gates are recorded in [Sound and design research](SOUND_AND_DESIGN_RESEARCH.md).
- This checkpoint supersedes older sound/UI implementation claims, not the remaining release gates.

`Milestone 1 → Milestone 2 → Milestone 3 → Milestone 4 → Milestone 5`

Do not begin a new milestone until the prior exit gate passes. Each task must include tests when it changes domain/application behavior and must preserve the dependency rule: presentation and infrastructure cannot import each other directly.
