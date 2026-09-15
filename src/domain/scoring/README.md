# domain/scoring

Eco-driving green score. Purely functional — no framework dependencies.

## Files

| File | Purpose |
|---|---|
| `greenScore.ts` | `GreenScore` interface, `createGreenScore`, `updateGreenScore`, `getGreenScoreSummary` |
| `index.ts` | Barrel export |

## Scoring Logic

Points start at 100 and are adjusted each frame:

| Condition | Rate |
|---|---|
| Harsh brake (brake > 0.8 at speed > 15 km/h) | −1.5 pts/s |
| Over-rev (rpm > shiftRpm + 1200) | −0.4 pts/s |
| Harsh throttle (change rate > 8/s) | −0.25 pts/s |
| Smooth driving (throttle > 0, no penalties) | +0.15 pts/s |

Final score = `clamp(0, 100, 100 + earned − sum(penalties))`

## Usage

```ts
import { createGreenScore, updateGreenScore } from '@/domain/scoring';

const score = createGreenScore();
updateGreenScore(score, vehicleState, dt);
console.log(score.points); // 0–100
```

## Test location

`src/domain/scoring/__tests__/greenScore.spec.ts`
