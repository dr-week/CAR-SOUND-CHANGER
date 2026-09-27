# Android Integration Plan

Research checked: 2026-09-18. Strategy: reuse installed apps and platform services; build the launcher experience, not replacement navigation, streaming, telephony, or projection systems.

## Target and platform boundary

Owner reports a modified 2021 Blaupunkt San Jose 1000-type 10.1-inch unit. Android version, MCU, RAM, Play services, firmware privileges, and installed packages must be measured. Specifications from newer product revisions are not evidence for this unit.

Treat it as ordinary Android until AAOS is confirmed. Android Auto projects supported phone apps onto a compatible receiver; AAOS runs apps in the vehicle. A launcher or Car App Library dependency does not turn a generic head unit into an Android Auto receiver. [Android for Cars](https://developer.android.com/training/cars)

Reference products combine projection, Bluetooth audio/phone, radio, camera access, and audio setup. These are feature benchmarks, not evidence of shared APIs: [Sony receiver specifications](https://www.sony.com/electronics/support/mobile-cd-players-digital-media-players-xav-series/xav-ax6000/specifications), [Pioneer receiver brochure](https://pioneercarentertainment.com/wp-content/uploads/2024/10/DMH-AP6650BT-Brochure-2pp.pdf).

## Integration matrix

| Feature | Preferred implementation | Requirements / boundary |
| --- | --- | --- |
| Maps, routes, traffic, guidance | Google Maps native intent; Maps URL fallback | Installed Maps for native navigation. URLs need no API key. No custom routing engine. [Intents](https://developer.android.com/guide/components/google-maps-intents), [URLs](https://developers.google.com/maps/documentation/urls/get-started) |
| Embedded map widget, optional | Official Maps SDK for Android, or existing Maps JavaScript API prototype | Cloud project, enabled API, billing, restricted key; separate Android package/signing restrictions and web-origin restrictions. A map SDK alone is not navigation. Defer extra Places/Routes/Navigation SDK dependencies. [Setup](https://developers.google.com/maps/documentation/android-sdk/get-api-key), [billing](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing) |
| Spotify, YouTube Music, other installed players | Launch selected app; observe/control supported Android media sessions | MediaSessionManager + MediaController. Active-session access needs privileged MEDIA_CONTENT_CONTROL or user-enabled notification-listener access. Do not request privileged permission as though ordinary apps can obtain it. [Media sessions](https://developer.android.com/reference/android/media/session/MediaSessionManager) |
| Spotify-specific browsing/control, optional | Spotify App Remote | Spotify installed and signed in; developer registration, client ID, redirect URI, package/fingerprint, user authorization. Review policy/account restrictions before committing. Not an independent streaming engine. [SDK requirements](https://developer.spotify.com/documentation/android/tutorials/getting-started) |
| Local/USB music | Launch existing player first | A launcher-owned library is optional. If justified later, use Media3 and user-selected storage access rather than a custom decoder. |
| YouTube video | Open installed app only in a parked-use flow | Do not embed by default. IFrame Player API is the supported web embedding path if separately approved; Data API is not a video decoder. Unknown driving state must not be treated as parked. [Player API](https://developers.google.com/youtube/iframe_api_reference) |
| Bluetooth phone/audio | Stock phone and Bluetooth music app; standard intents where handled | MCU-controlled receivers may differ from Android Bluetooth. Pairing, HFP, AVRCP and contact access require hardware validation. Opening a dialer does not grant call answer/end control. [Common intents](https://developer.android.com/guide/components/intents-common) |
| Android Auto / CarPlay | Launch existing compatible receiver/projection app | Verify hardware, firmware and existing licensed solution. No custom receiver or assumption that phone-side SDKs supply one. |
| Radio, EQ/DSP, camera | Discover installed stock activity; device-profile adapter only for confirmed controls | No universal Sony/JBL/HARMAN/Blaupunkt control SDK established for this target. Keep reverse-camera takeover owned by stock firmware. |
| Volume and steering keys | AudioManager, standard media key events, verified vendor mapping where necessary | Confirm whether MCU or Android owns each audio source. Do not equate app gain with hardware master volume. |
| Speed and compass | Existing location provider | Runtime location permission; GPS heading is direction of travel, not stationary magnetic orientation. Hide stale readings, not the instrument face. |
| Voice | Delegate to available system assistant/voice activity | Probe handler first; no always-listening microphone implementation. |
| Engine sound | Separate user-started native media service | Foreground notification, focus handling and explicit stop. No assumption of independent front/rear routing. |

## Minimal SDK and permission strategy

Current repository: Kotlin WebView shell; compile/target SDK 34, min SDK 24; AndroidX Core, AppCompat, WebKit and Material. These are current code settings, not a verified device compatibility or release-policy decision.

- **Required baseline:** Android SDK, Kotlin, lifecycle-aware native adapters, existing AndroidX libraries. Pin tested dependencies; choose min SDK after the device probe.
- **Media controller:** framework MediaSessionManager/MediaController and a narrowly scoped NotificationListenerService. Notification access is sensitive; explain its purpose, request it explicitly, handle revocation, and do not store unrelated notifications.
- **Our own background audio only:** Media3 session/player where appropriate, or a native engine service with a media session. Declare applicable foreground-service permissions/type and handle foreground notification requirements. [Media3 service](https://developer.android.com/media/media3/session/background-playback)
- **Bluetooth:** Android 12+ CONNECT for relevant connection operations; SCAN only if implementing discovery. Legacy permissions and location rules differ by API level. Avoid requesting Bluetooth permission merely to launch the stock app. [Permissions](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions)
- **App discovery:** PackageManager/LauncherApps and scoped queries first. Broad QUERY_ALL_PACKAGES access needs a justified launcher use case and distribution-policy review. Never populate installed-app tiles from guessed packages. [Visibility](https://developer.android.com/training/package-visibility/declaring)
- **No blanket permissions:** microphone, contacts, call logs, SMS and background location are not baseline launcher requirements. Request only when implementing a feature that actually needs them.
- **Optional, not baseline:** Maps SDK, Spotify App Remote, Car App Library, YouTube embedding. No OAuth secrets in WebView JavaScript, repository files, or APK assets.

## Audio, safety and security invariants

- Observing or controlling another player must not request playback focus itself. The current shell requests focus at startup: remove this before native release.
- Own audio requests focus when playback begins, responds to loss/duck/pause, and releases it when stopped. Targeting Android 15+ adds top-app/foreground-service constraints. [Audio focus](https://developer.android.com/media/optimize/audio-focus)
- Standard EQ effects attach to an audio session; global output session-0 insert effects are deprecated. Prefer stock DSP for system-wide sound. Front/rear separation is unsupported until an adapter proves distinct routes. [AudioEffect](https://developer.android.com/reference/android/media/audiofx/AudioEffect)
- External services open outside the privileged launcher WebView. Restrict bridge origins/navigation, validate arguments, and never expose the JavaScript bridge to arbitrary remote pages. [Native bridge guidance](https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges)
- No video shortcuts considered safe solely because speed is zero or GPS is missing. Parking/driver restrictions require a separate verified policy.
- Device names, MCU chips, vendor broadcasts, latency figures and Bluetooth internals are hypotheses until measured. Earlier blanket hardware claims were removed.

## Implementation status and next gates

1. **Implemented, web tests pass:** exact package launch avoids redirecting Spotify to Bluetooth; Google Maps destination URL generation; native Google Maps bridge method with external browser fallback; honest phone-app launch failures.
2. **Native verification pending:** Kotlin Maps launcher has not been compiled or tested here. Repository lacks a Gradle wrapper; no system Gradle was found. Resolve native resources/toolchain and permission UX before claiming an installable release.
3. **Next: capability discovery/settings:** choose installed navigation, player, phone, DSP and projection apps; remove guessed vendor shortcuts; expose launch-only versus controllable status.
4. **Then: real now-playing:** native session observer/transport adapter, user-granted access, lifecycle cleanup and provider loss. Current metadata broadcasts and demo transport do not establish universal playback control.
5. **Then: native hardening:** secure WebView navigation, audit startup focus, verify Bluetooth/volume/steering/camera behavior, stock-launcher recovery, ignition sleep/wake.
6. **Last: optional SDKs:** add only for a user-visible capability that app handoff and media sessions cannot supply.

## Device discovery and acceptance

Run locally with the head unit connected; do not publish identifiers, contacts or account data:

```text
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell wm size
adb shell wm density
adb shell pm list packages
adb shell dumpsys media_session
adb shell dumpsys audio
```

Confirm Google Play services/Maps availability, stock phone/DSP/radio/projection activities, notification access, media control support, location permissions, standard steering keys, and recovery to the stock launcher.

Acceptance: installed/missing apps; denied/revoked access; offline Maps; process death; ignition resume; music + guidance + calls; repeated taps; safe camera takeover; English labels; 1024×600 and 130% scale. Hardware-dependent features remain unavailable until proven.
