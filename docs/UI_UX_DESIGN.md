# UI/UX Design and Work Queue

Single source for design decisions and UI tasks. Work top-to-bottom, one phase per verified change. Unchecked items are pending, not implemented claims.

## Fixed decisions

- Two independent landscape widget panels; preserve the right-side navigation pill.
- Prioritize right-hand driver reach. Keep volume available across widget changes.
- Keep the speedometer face visible without GPS: centered dash, muted signal icon, no false needle.
- Integrated speedometer compass: revolving True North beacon on $r=132$ outer orbit with center hub heading readout (`NW · 315°`). No detached bubble.
- English, icon-led controls with accessible names; short text only when needed.
- Circular instruments/actions, rounded-square selectors, restrained glass surfaces. Avoid heavy blur, decorative animation and excessive glow.
- Reuse Google Maps and installed media apps. Integration requirements belong in [Android integration](./ANDROID_INTEGRATION.md).

## Control ownership

| Surface | Purpose | Do not duplicate |
| --- | --- | --- |
| Panel header | Choose the widget shown in that panel (Speed/Map/Clock on left; Music/Call/Apps on right) | Full-app launch shortcuts |
| Right pill | Home, Media, navigation app, All Apps, Settings | Bottom navigation row |
| Bottom-right audio tray | Mute/restore, volume −/+, readout | In-panel volume controls or full-width empty footer |
| Top status row | Time, Bluetooth, GPS, device battery when known (borderless, unified row) | Separate capsule around every indicator |

Music and navigation selectors can coexist with dock destinations only if their different behavior is clear. Keep the panel Apps option only if it has a distinct purpose.

## Phase 1 — Remove redundancy & duplicates

- [x] Remove bottom Navigate and Phone shortcuts; preserve panel and dock access.
- [x] Integrate compass into speedometer ($r=132$ revolving North beacon); remove detached bubble and external chips.
- [ ] Replace full-width enclosing footer (`home-footer`) with a compact, floating right-aligned volume capsule.
- [ ] Demarcate panel Map tab (in-panel preview) vs. dock Navigate (full-app launch); remove giant overlay button in map preview.
- [ ] Confirm only one persistent volume group remains.
- [ ] Distinguish panel Apps widget from dock All Apps.

Done when: each visible control has a single clear purpose; volume remains reachable with every widget; zero competing navigation or phone buttons.

## Phase 2 — Balance geometry & alignment

- [ ] Align horizontal and vertical centerlines of speedometer dial and vinyl turntable.
- [ ] Expand vinyl turntable to balance the visual weight of the speedometer.
- [ ] Restore full vertical height to cockpit panels by removing full-width bottom bar container.
- [ ] Keep panel dimensions stable when changing widgets.
- [ ] Verify bottom tray does not clip at maximum interface scale.

Done when: both panels read as one balanced composition, with zero accidental vertical voids or misaligned instrument centers.

Done when: both panels read as one composition, with no crowded edges or large accidental gaps.

## Phase 3 — Simplify visual language

- [ ] Replace top status capsules with a quiet, aligned icon row and consistent top clearance.
- [ ] Remove the clock's green dot unless it conveys a defined state.
- [ ] Unify icon weight; use a recognizable settings gear without changing the right pill.
- [ ] Increase dial-label contrast; simplify compass markings.
- [ ] Use consistent sans-serif labels and tabular numerals; reduce heavy uppercase technical text.
- [ ] Reserve the brightest accent for the primary action; reduce selector glow.
- [ ] Replace “NO. 07” with real artwork or a neutral music fallback.
- [ ] Keep demo disclosure visible but secondary.
- [ ] Refine surface contrast and fine edges before adding blur.

Done when: hierarchy is clear without relying on glow, tiny text, or decorative detail.

## Phase 4 — Complete widget behavior

- [ ] Add discreet position indicators and a tap-accessible widget chooser.
- [ ] Save independent panel selections.
- [ ] Preserve playback state across widget switches.
- [ ] Restore the previous widget after a call, unless the user chose another.
- [ ] Verify swipes ignore buttons, sliders and interactive maps.
- [ ] Prevent duplicate launches and delayed-touch command queues.
- [ ] Show selected, pressed, pending, unavailable and permission-denied states.
- [ ] Distinguish real playback, preview playback and unsupported controls.
- [ ] Identify the source of volume and battery readings; never imply vehicle hardware control without evidence.
- [ ] Test compass stopping, stale fixes and north-crossing without false direction or abrupt full-circle rotation.

Done when: interaction is predictable and every displayed state has a verified source.

## Phase 5 — Verification gate

- [ ] Inspect 1024×600 and 1280×800 at 100%, 110%, 120% and 130% interface scale.
- [ ] Primary touch targets ≥64 CSS px; secondary ≥48 CSS px; essential labels ≥18 CSS px at 100%.
- [ ] Check physical target size, driver reach and delayed touch on the Blaupunkt while parked.
- [ ] Test long titles, missing artwork, offline Maps, denied GPS, missing apps and disconnected phone.
- [ ] Check daylight/night contrast and reduced-motion behavior.
- [ ] Verify ignition resume, process recreation, returning from external apps, and audio continuity.
- [ ] Run typecheck, lint, relevant tests and production build.
- [ ] Record tested viewport/state and remaining hardware limitations in the handoff.

Done when: automated and visual checks pass; physical-device claims have actual device evidence. Earlier layout checks do not validate the current composition.

## Implementation ownership

- `HomeView.vue`: layout composition and event forwarding.
- `views/home/`: panel widgets, swipe handling, shared audio controls and scoped styles.
- `launcher/InfotainmentHeader.vue`: top status row.
- `launcher/SidebarDock.vue`: intentional right pill; preserve.
- `components/SpeedometerGauge.vue`, `components/media/`: instrument and media presentation.
- Application/infrastructure adapters: state, permissions and external integrations.

Keep modules focused; follow [Contributing](../CONTRIBUTING.md). Update this checklist instead of adding another audit or roadmap.
