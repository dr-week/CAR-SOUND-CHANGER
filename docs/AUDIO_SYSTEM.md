# Audio System

The engine synthesizer is a separate, optional app/service. It is absent from Home and never controls third-party music.

## Signal path

```text
RPM/load input -> profile + harmonics -> gain/ducking -> Android audio output
```

The four-stroke firing fundamental is `RPM × cylinders ÷ 120`. The prototype generates harmonics with Web Audio; native Android should use a low-latency engine such as Oboe/AAudio only after measuring the target unit.

## Mixing policy

| Event | Engine response |
| --- | --- |
| Safety alert | Mute immediately |
| Phone call | Pause and release focus |
| Navigation guidance | Duck smoothly |
| Music starts | Apply the user’s configurable duck amount |
| Engine service stops | Release audio focus and resources |

The native service must be explicitly started by the user, use a persistent media-style notification, and restore only user-approved state after reboot.

## Equalizer truthfulness

- The launcher EQ affects only audio rendered by this project.
- Android `Equalizer` and related `AudioEffect` APIs are session-scoped and device support varies.
- The stock DSP app is the preferred control for Bluetooth, radio, navigation, and other system sources.
- A “Hardware DSP” action is shown only when Android resolves a verified activity.
- Presets are convenience starting points, not claims of calibrated sound.

## Speaker routing

`front`, `rear`, and `all` are preferences until hardware discovery confirms addressable output buses. A standard aftermarket Android app usually sees one stereo music output. Real zone routing needs a vendor DSP service/SDK, privileged routing API, or an automotive Audio HAL. Unsupported controls remain disabled and clearly explained.

## Performance and safety

- Avoid allocations, logging, and UI work in the real-time callback.
- Ramp gain changes to prevent clicks.
- Limit synthesis output and provide a one-tap stop.
- Verify calls, guidance, safety chimes, suspend/resume, and a two-hour thermal run on the actual head unit.
- Do not claim sub-20 ms latency until it is measured on the installed hardware.

Native behavior and capability detection are specified in [Android integration](./ANDROID_INTEGRATION.md).
