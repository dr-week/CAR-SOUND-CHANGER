# infrastructure/telemetry

Geolocation API adapter. Converts GPS position fixes to speed values in km/h.

## Files

| File | Purpose |
|---|---|
| `BrowserGeolocation.ts` | `watchPosition` wrapper with stale detection |
| `index.ts` | Barrel export |

## Validation Rules

Each GPS fix is validated before use:

- `speed` must be finite and ≥ 0
- Speed must be ≤ 450 km/h
- Fix timestamp must be within `staleAfterMs` (default 5 s) of `Date.now()`

## Status Values

| Status | Meaning |
|---|---|
| `inactive` | Not started or cleanly stopped |
| `active` | Receiving valid fixes |
| `unavailable` | `navigator.geolocation` missing |
| `denied` | User denied permission |
| `error` | Other geolocation error |
| `stale` | Last valid fix older than 5 s |

## Usage

```ts
import { BrowserGeolocation } from '@/infrastructure/telemetry';

const gps = new BrowserGeolocation(
  (speedKph) => session.setGpsSpeed(speedKph),
  (status)   => uiStore.telemetryStatus = status,
);
gps.start();
gps.stop();
```
