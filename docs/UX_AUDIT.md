# UI/UX Audit

Last reviewed: 2026-09-17

## Scope

This audit covers the active Vue launcher at 1024 × 600 landscape scale. It separates implemented behavior from capabilities that require a native Android launcher bridge.

## Mistakes found and resolved

| Mistake                                                                        | Why it was harmful                                                                                       | Resolution                                                                                                                                    |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Home existed as both a brand button and dock icon.                             | Duplicate navigation consumed scarce rail space and weakened the brand.                                  | The brand mark is the sole Home action.                                                                                                       |
| Home contained navigation, media, engine, and climate cards.                   | Too many equal surfaces produced dashboard clutter and poor glance hierarchy.                            | Home now contains only destination, map, and media.                                                                                           |
| Engine controls appeared on Home and in Settings.                              | Users had multiple conflicting places to manage one background service.                                  | Engine Sound is a separate app with all related controls.                                                                                     |
| Maps, Music, and Settings were pinned and repeated in All Apps.                | Repeated icons increased scanning time without adding access.                                            | Static drawer entries now contain only secondary functions. Native enumeration may still show installed apps according to user configuration. |
| App tiles repeated their title with descriptive echo text.                     | Labels such as “Music / Now playing” and “Settings / System” added noise.                                | Tiles use one icon and one name.                                                                                                              |
| Date appeared in both the status bar and Home eyebrow.                         | Duplicate information distracted from the greeting.                                                      | Date remains only in the central clock.                                                                                                       |
| Map surfaces showed multiple state/action labels.                              | “Offline map,” “Navigation,” and “Tap to choose a route” competed on one visual.                         | Compact Home map shows one action; detailed map retains provider state.                                                                       |
| UI presented hard-coded Pixel, 5G, weather, song, and location states as real. | Mock data could be mistaken for device truth.                                                            | Phone model was removed; remaining prototype data must be replaced by native providers before release.                                        |
| Small 8–10 px labels and 42 px media buttons were used.                        | They are difficult to read and touch on common 1024 × 600 displays.                                      | Essential labels scale with the interface and launcher targets use 64 px; secondary controls use at least 44 px.                              |
| Interface scale was fixed.                                                     | Head units vary substantially in physical size and Android density configuration.                        | Settings now provides persistent 100–130% UI scaling.                                                                                         |
| Decorative editorial labels repeated page titles.                              | Copy such as “calm machine” and “your machine · your tools” added personality at the expense of clarity. | Removed from functional pages; expressive typography is limited to Home.                                                                      |
| Decorative map was presented as navigation.                                    | It suggested functionality that did not exist.                                                           | Added lazy Google Maps integration, GPS recentering, directions handoff, and an explicit offline fallback.                                    |
| Bluetooth UI implied it could route general audio through Web Bluetooth.       | Web Bluetooth is BLE/GATT and does not select ordinary A2DP speaker output.                              | Device-specific routing is reserved for Android/vendor integration.                                                                           |
| Front/rear speaker selection looked guaranteed.                                | Standard Android devices may expose one stereo output instead of four independently routable speakers.   | UI treats it as a requested zone; native capability detection must confirm support.                                                           |

## Open issues before an Android release

### P0 — safety and truthfulness

- Replace static 5G, battery, temperature, location, and media metadata with real providers or hide them.
- Add driving-versus-parked state and prevent unsafe applications while moving.
- Add Android audio focus behavior for calls, navigation speech, music, and engine audio.
- Ensure the launcher never claims a route, connection, speaker zone, or media session that is unavailable.

### P1 — native launcher capability

- Implement `CATEGORY_HOME` and default-launcher selection.
- Populate All Apps through `LauncherApps` or `PackageManager`.
- Launch actual package intents and handle removed/disabled applications.
- Connect MediaSession, Bluetooth, radio, reverse camera, steering-wheel controls, and vendor DSP capabilities.
- Replace browser Maps credentials with an Android-restricted Maps SDK key.

### P2 — usability validation

- Test at physical 7-inch, 9-inch, and 10.1-inch 1024 × 600 displays.
- Test 100%, 110%, and 130% launcher scale with Android density overrides.
- Test daylight, night, glare, polarized glasses, and low-brightness conditions.
- Test left- and right-hand-drive reach patterns.
- Conduct parked task tests for destination, source change, call, app launch, and engine toggle.
- Run contrast and touch-target accessibility checks.

## Content-deletion test

For each visible label, ask: “If this disappears, can the driver still understand the icon, state, or next action?” If yes, remove it. Exceptions are accessibility names, uncertain icons, safety warnings, errors, and state changes the user must understand.

## Duplication test

A function may appear in:

1. One persistent navigation location.
2. One detailed surface.
3. A contextual shortcut only when it reduces a real task.

Anything beyond those three cases requires a documented reason.

## Acceptance gate

A UI change is not complete until type checking, tests, production build, and a 1024 × 600 visual review pass. Changes affecting scale or navigation must also be reviewed at 100% and 130% interface size.
