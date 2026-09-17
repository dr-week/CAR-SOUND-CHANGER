# Android Integration

## Goal

Turn the validated PWA experience into a real landscape Android launcher for generic 1024 × 600 head units without coupling domain logic to a specific vendor.

## Required native capabilities

- `CATEGORY_HOME` activity and default-launcher selection
- Installed-app enumeration through `LauncherApps` or `PackageManager`
- Safe package launching and removed/disabled-app handling
- Foreground engine-audio service and Android audio focus
- MediaSession metadata and transport controls
- Bluetooth and call-state providers
- Maps SDK/Places SDK with an Android-restricted key
- Driving/parked state for distraction safeguards
- Window insets, fixed landscape orientation, boot behavior, and process restoration

## Vendor-dependent capabilities

- FM/AM radio
- Reverse camera activity
- DSP and front/rear speaker routing
- Steering-wheel controls
- CAN/MCU vehicle state
- Amplifier, equalizer, and illumination controls

Detect these capabilities at runtime behind vendor adapters. Do not hard-code package names or report success before the device confirms it.

## Audio behavior

The engine layer has the lowest priority. It ducks for music and spoken navigation, pauses or mutes for calls and critical alerts, and resumes only after focus returns. Android 15 targets require the app to be foreground or use an eligible foreground service to request audio focus.

## Safety

When moving, expose only driving-appropriate apps and short flows. Disable video, complex settings, and unsafe third-party applications. Prefer saved places and voice entry over typing. Preserve interrupted tasks.

## Credentials and privacy

- Use a separate Maps key restricted by Android package name and signing certificate.
- Request location only when navigation needs it.
- Do not store precise location by default.
- Avoid broad package visibility when targeted queries are sufficient.
- Explain microphone, contacts, call-log, and notification permissions before requesting them.

## Device validation

Test on the target Blaupunkt unit and at least one comparable generic head unit:

- Cold boot and resume
- 1024 × 600 at multiple density settings
- Day, night, glare, and low brightness
- GPS loss and offline map
- Calls and navigation prompts during engine playback
- Bluetooth reconnect
- Steering-wheel buttons
- Reverse camera interruption
- Vendor radio/DSP availability
- 100%, 110%, and 130% launcher scale
