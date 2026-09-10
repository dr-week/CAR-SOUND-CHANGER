# Open source and privacy boundary

## Approved baseline

The only build dependency is Vite, an MIT-licensed, open-source project maintained publicly on GitHub. Production code uses browser-standard APIs only: Web Audio, Geolocation, Service Workers, and optional Web Bluetooth. This minimizes vendor cost and avoids embedding a remote SaaS dependency in the driving path.

## Local-first data policy

- Audio synthesis, vehicle state, key presses, and the green score remain in process on the device.
- GPS permission is requested only when the user enables it. The app uses only `coords.speed`; it neither stores nor sends coordinates.
- The application contains no analytics, advertising, tracking pixels, cloud loggers, account SDKs, remote configuration, or third-party audio calls.
- Bluetooth audio selection stays with the device operating system. A future OBD-II adapter must parse telemetry locally and must not upload identifiers or raw trips by default.

## GitHub dependency admission rule

Before adding any GitHub package: verify its license is compatible, inspect its permissions and transitive dependencies, pin an exact version in the lockfile, keep it in a narrow infrastructure adapter, and run `npm audit` plus the project checks. Do not load code directly from a GitHub URL or CDN at runtime. Dependabot-style update automation may be enabled later, but updates must be reviewed before merging.

## Green score

`src/domain/scoring/greenScore.js` owns the policy. It starts at 100 points, awards modest points for smooth propulsion, and deducts locally for heavy braking above 15 km/h, sustained RPM materially above the selected car's shift point, and sharp throttle transitions. No score leaves the device.
