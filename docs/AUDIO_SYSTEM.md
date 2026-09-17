# Audio System

## Purpose

Engine Sound is an optional background audio layer. It is separate from media playback and is configured only in the Engine app.

## Current implementation

`WebAudioEngine` synthesizes the engine in real time. No copyrighted game or manufacturer recordings are included.

The domain calculates:

- Four-stroke firing frequency: `RPM × cylinders ÷ 120`
- Harmonic character per vehicle profile
- Load, intake, exhaust, pitch, and gain behavior
- Gear-change and turbo envelopes

The infrastructure adapter owns oscillators, filters, gain smoothing, startup, suspension, and teardown. Audio begins only after a user gesture.

## User controls

- Start or stop the engine layer
- Select a vehicle character
- Set engine level
- Request front, rear, or all-speaker output
- Reduce engine level while music is playing

Preferences persist locally. The selected speaker zone is only a request in the web build.

## Mixing policy

Priority from highest to lowest:

1. Calls, alarms, and critical vehicle alerts
2. Spoken navigation
3. Primary media
4. Engine sound

The web prototype applies configurable music ducking. Native Android must use `AudioFocusRequest`, accurate `AudioAttributes`, and a foreground playback service where required. Pause or mute during calls and restore only after focus returns.

## Routing limits

Web Bluetooth does not route normal A2DP audio. Standard Android APIs may expose the complete amplifier as one stereo device. Independent front/rear routing requires a compatible vendor DSP API, audio HAL, MCU command, or multichannel device.

The native bridge must detect capability. If unsupported, disable the zone selector and explain the limitation; never pretend routing succeeded.

## Extension rules

- Keep audio math in `src/domain/audio`.
- Implement playback behind `EngineSoundOutput`.
- Smooth parameter changes to prevent clicks.
- Do not create audio before explicit user activation.
- Use only owned, licensed, or synthesized assets.
- Add automated envelope/domain tests and perform a physical listening check.

## Known limits

- Profiles are artistic approximations, not measured vehicles.
- Browser output latency and channel routing depend on the OS and head unit.
- Subjective tuning still requires in-car testing at idle, acceleration, cruise, and braking.
