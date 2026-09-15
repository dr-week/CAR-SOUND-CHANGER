# domain/vehicle

Pure business logic for vehicle state and physics. No framework imports, no side effects.

## Files

| File | Purpose |
|---|---|
| `types.ts` | `VehicleProfile` and `VehicleState` interfaces |
| `constants.ts` | Gear ratios, physics tuning constants |
| `controls.ts` | `DriveAction` union type (`"accelerate"` \| `"brake"`) |
| `carProfiles.ts` | Pre-built profiles: Brezza, Mustang, Porsche, F1 |
| `vehiclePhysics.ts` | `createVehicleState()`, `stepVehicle()` — physics loop |
| `index.ts` | Barrel — re-exports everything above |

## Key Rules

- **No Vue imports** — all functions are pure TypeScript
- **No side effects** — no `console.log`, no DOM access
- `stepVehicle` mutates `VehicleState` in-place (by design — reactive object)
- `GEAR_RATIOS[0]` is always 0 (unused placeholder — gear index starts at 1)

## Usage

```ts
import { createVehicleState, stepVehicle, CAR_PROFILES } from '@/domain/vehicle';

const state = createVehicleState(CAR_PROFILES.brezza);
state.throttle = 1;
stepVehicle(state, 0.016); // advance 1 frame at 60fps
```

## Test location

`src/domain/vehicle/__tests__/vehiclePhysics.spec.ts`
