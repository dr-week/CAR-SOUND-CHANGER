# Car Sound Mod — product case study

## Product problem

Drivers who want an engaging engine-audio experience usually need bespoke hardware or apps that collect unnecessary driving data. Car Sound Mod explores a privacy-first alternative: a browser-installable simulator that turns local controls and optional speed data into synthetic engine feedback.

## Product boundaries

- This is a simulation and prototyping tool, not a vehicle control system.
- It never controls a vehicle and must not be used where it distracts from safe driving.
- It does not copy game audio or manufacturer recordings; the audio layer is synthesized.
- Location coordinates are not persisted or transmitted.

## Demonstrated engineering decisions

| Challenge                 | Decision                                             | Benefit                                                           |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Browser audio latency     | Web Audio synthesis on-device                        | Works offline; no audio streaming cost.                           |
| Future device variability | Infrastructure adapters behind application contracts | GPS, keyboard, and future OBD-II can change independently.        |
| Product safety/privacy    | Local-first state and explicit permission            | No account, telemetry vendor, or trip-data leak.                  |
| Framework change risk     | Pure TypeScript domain layer                         | Vehicle and score rules are testable without Vue/browser runtime. |
| Release confidence        | CI quality gate and unit tests                       | Every pull request is type-checked, linted, tested, and built.    |

## Portfolio talking points

1. Designed a local-first PWA that combines typed domain rules, browser device APIs, and low-latency synthesized audio.
2. Applied dependency inversion: `DrivingSession` owns the use case and depends on an `EngineSoundOutput` contract, while Web Audio is only one implementation.
3. Built a privacy boundary that limits GPS use to speed data inside the active browser session.
4. Added deterministic domain and application-service tests plus GitHub Actions delivery checks.
