# Sound engine and historical instrument design — 2026-09-17

> UI status: the instrument dashboard described below is retained as historical engineering context. The active product is now a landscape Android launcher. Follow [UI_DESIGN.md](../UI_DESIGN.md) and [UX_AUDIT.md](../UX_AUDIT.md) for current UI decisions.

## Research and scope

- **NFS reference:** EA's _Sounds of The Run_ article describes capturing real car engines and building the game's soundscape. Its indexed summary was available during research; the article URL itself returned 404. This supports recording-led character, not a claim about the proprietary implementation of every NFS title. [EA source](https://www.ea.com/news/need-for-speeds-sounds-of-the-run-series-starts-today).
- **RPM/load blending:** Audiokinetic's Blend Container documentation describes combining engine sounds across acceleration, deceleration, and gear changes. Use that principle for separate sound layers; this project does not integrate Wwise. The indexed documentation was available; direct retrieval was blocked. [Audiokinetic documentation](https://www.audiokinetic.com/en/public-library/2024.1.7_8863/?id=blend_container_property_editor&source=Help).
- **Browser synthesis:** custom periodic waves define harmonic content; normalization bounds the waveform peak. [MDN createPeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave).
- **Transitions:** AudioParam targets provide gradual parameter changes rather than instantaneous jumps. [MDN setTargetAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime).
- **Bluetooth correction:** Web Bluetooth exposes BLE/GATT device access, not general speaker routing. Selecting a device is not proof that audio is connected. [Chrome documentation](https://developer.chrome.com/docs/capabilities/bluetooth).

## Mistakes found and changes

| Finding                                                                                            | Implemented response                                                                                    |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Arbitrary baseTone multiplier inflated physical firing frequency, especially V12.                  | Four-stroke firing rate = RPM × cylinder count / 120; character now comes from spectral coefficients.   |
| Stacked sawtooth harmonics produced excessive upper-frequency energy and little vehicle character. | Normalized custom exhaust waveform, separate crank-frequency body layer, and filtered intake noise.     |
| Throttle primarily altered loudness.                                                               | Load controls exhaust/intake gain and filter brightness; releasing throttle darkens and softens output. |
| Gear changes had no sound envelope.                                                                | A 120 ms load dip follows a gear change; pitch follows drivetrain RPM.                                  |
| Volume changes bypassed the load envelope.                                                         | Independent, smoothed master gain; zero remains muted through engine updates.                           |
| Profile selection created audio before an explicit enable gesture.                                 | Only resume creates the graph; profile changes reuse the three sources.                                 |
| Errors were swallowed while the UI could claim audio was enabled.                                  | Startup rejects on failure; UI catches errors and allows retry.                                         |
| Bluetooth picker claimed speaker connection without routing audio.                                 | Removed that flow from the active UI; show OS pairing/output guidance.                                  |
| Small twin gauges competed with gear and decoration.                                               | One dominant tachometer, large numeric speed, separate gear/shift guide.                                |
| Redline began 1,000 RPM early; exact-thousand ceilings could erase its arc.                        | Exact redline marker with scale headroom.                                                               |
| Forced blur and global Space shortcut disrupted focused buttons.                                   | Preserve focus; native button activation is not intercepted; pedals support held Enter/Space.           |
| Mobile five-column controls squeezed labels.                                                       | Two-row mobile controls; pedals remain the primary actions.                                             |

## Modular implementation

- Domain: `src/domain/audio/engineSound.ts` — pure frequency, load, gain, and timbre policy.
- Infrastructure: `src/infrastructure/audio/WebAudioEngine.ts` — Web Audio graph and lifecycle.
- Presentation: the current launcher keeps audio-node logic outside Vue components and exposes the engine system through a separate background Engine app.
- Styling: the active launcher uses a near-black cabin, ivory text, an acid-lime active signal, editorial typography, and an asymmetric map-led Home composition.

## Verification and limits

- TypeScript check and 73 unit tests pass. Inactive legacy display components still contain non-blocking formatting warnings.
- Production build passes.
- Landscape launcher, app drawer, Engine, Settings, navigation fallback, and adjustable UI scale were reviewed in Chromium. The native release still requires physical 1024 × 600 head-unit testing.
- Browser audio-enable gesture reaches the active state. Real Web Audio analysis detects output across vehicle profiles and silence after volume zero; measurements are not a subjective listening review.
- Profile signatures are artistic approximations, not measured Brezza/Mustang/Porsche/F1 recordings. No copyrighted game samples were downloaded or reused.
- Exact vehicle matching requires owned/licensed idle, loaded, and coast recordings at multiple RPM bands with loop/crossfade tuning. That asset work is not included here.
- Physical speaker/Bluetooth latency, Safari/iOS, and subjective sound realism still need device listening tests. Do not label this NFS-equivalent or a completed cross-device release.
