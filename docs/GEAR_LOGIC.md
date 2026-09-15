# Gear Logic & RPM Calculations

Complete specification for Suzuki Brezza gear and RPM calculations.

## Vehicle Profile: Suzuki Brezza 2023

```typescript
export const SUZUKI_BREZZA = {
  make: 'Suzuki',
  model: 'Brezza',
  year: 2023,
  displacement: 1197, // cc (1.2L)
  maxRPM: 6000,
  maxPower: 83, // bhp
  maxTorque: 113, // nm
  transmission: 'Manual 5-speed',
  wheelSize: 205, // mm tires
  wheelbase: 2520, // mm
  groundClearance: 200, // mm
} as const;
```

## Gear Ratios (5-Speed Manual)

Suzuki Brezza uses a 5-speed manual transmission. The following are typical gear ratios:

```typescript
export const BREZZA_GEAR_RATIOS = {
  1: 3.808, // 1st gear
  2: 2.235, // 2nd gear
  3: 1.481, // 3rd gear
  4: 1.134, // 4th gear
  5: 0.893, // 5th gear (overdrive)
  reverse: 4.000, // Reverse
  final: 5.118, // Final drive ratio
} as const;
```

## Shift Points (Driver Preference: 1500-2000 RPM)

The driver typically shifts between 1500-2000 RPM for optimal fuel efficiency and engine lifespan.

```typescript
// Conservative (fuel efficient, quiet)
export const SHIFT_RPM_CONSERVATIVE = 1500;

// Moderate (balanced)
export const SHIFT_RPM_MODERATE = 1750;

// Aggressive (performance)
export const SHIFT_RPM_AGGRESSIVE = 2000;

// Default: Moderate
export const SHIFT_RPM = SHIFT_RPM_MODERATE; // 1750 RPM
```

## Speed Ranges by Gear

Based on Suzuki Brezza specifications:

```typescript
export const BREZZA_GEAR_SPEED_RANGES = {
  1: { min: 0, max: 15 }, // 0-15 km/h
  2: { min: 15, max: 30 }, // 15-30 km/h
  3: { min: 30, max: 50 }, // 30-50 km/h
  4: { min: 50, max: 70 }, // 50-70 km/h
  5: { min: 70, max: 180 }, // 70+ km/h (max speed ~180 km/h)
} as const;

// Alternative: Calculate from engine characteristics
// Max speed at shift RPM = (RPM / gear_ratio / final_ratio) * wheel_circumference / 60
```

## RPM Calculation Formula

### Basic Formula

```
RPM = (Speed × Gear_Ratio × Final_Drive_Ratio / Wheel_Circumference) × 60

Where:
- Speed: Vehicle speed in km/h
- Gear_Ratio: Ratio for current gear
- Final_Drive_Ratio: 5.118 for Brezza
- Wheel_Circumference: π × Tire_Diameter_m = π × 0.205 ≈ 0.644 m
- 60: Conversion from seconds to minutes
```

### Simplified Implementation

For simulation purposes, we use a simpler approach:

```typescript
// Idle and shift point constants
const IDLE_RPM = 900; // Engine idle RPM
const SHIFT_RPM = 1750; // RPM at which driver shifts (1500-2000)

/**
 * Calculate RPM based on speed and gear
 * Linear interpolation between idle RPM and shift RPM
 */
export function calculateRPM(
  speed: number,
  gear: number,
  speedRanges = BREZZA_GEAR_SPEED_RANGES,
  idleRPM = IDLE_RPM,
  shiftRPM = SHIFT_RPM
): number {
  // Get speed range for current gear
  const range = speedRanges[gear as keyof typeof speedRanges];
  if (!range) return idleRPM; // Invalid gear

  const { min: minSpeed, max: maxSpeed } = range;

  // Clamp speed to gear range
  if (speed <= minSpeed) {
    return idleRPM; // Below min speed for gear
  }

  if (speed >= maxSpeed) {
    return shiftRPM; // At or above max speed for gear
  }

  // Linear interpolation between idle and shift RPM
  const speedInGear = speed - minSpeed;
  const speedRangeSize = maxSpeed - minSpeed;
  const rpmRange = shiftRPM - idleRPM;

  const rpm = idleRPM + (speedInGear / speedRangeSize) * rpmRange;

  return Math.round(rpm); // Round to nearest RPM
}
```

### Example Calculations

```typescript
// 1st Gear (0-15 km/h)
calculateRPM(0, 1)   // → 900 RPM (idle)
calculateRPM(7.5, 1) // → 1325 RPM (mid-gear)
calculateRPM(15, 1)  // → 1750 RPM (shift point)

// 2nd Gear (15-30 km/h)
calculateRPM(15, 2)  // → 900 RPM (just shifted)
calculateRPM(22.5, 2) // → 1325 RPM (mid-gear)
calculateRPM(30, 2)  // → 1750 RPM (shift point)

// 5th Gear (70+ km/h)
calculateRPM(70, 5)  // → 900 RPM (just shifted)
calculateRPM(125, 5) // → 1325 RPM (cruising)
calculateRPM(180, 5) // → 1750 RPM (max speed)
```

## Gear Selection Logic

### Automatic Gear Selection

```typescript
/**
 * Determine current gear based on speed
 * Uses speed ranges defined in BREZZA_GEAR_SPEED_RANGES
 */
export function calculateGear(
  speed: number,
  speedRanges = BREZZA_GEAR_SPEED_RANGES
): number {
  // Check each gear's speed range
  for (const gearNum in speedRanges) {
    const gear = Number(gearNum) as keyof typeof speedRanges;
    const range = speedRanges[gear];

    // Check if speed is in this gear's range
    if (speed >= range.min && speed < range.max) {
      return gear;
    }
  }

  // Default to highest gear if speed exceeds all ranges
  return 5;
}
```

### Gear Shift Detection

```typescript
/**
 * Determine if driver should shift to next gear
 * Returns true when RPM reaches shift point
 */
export function shouldShift(
  rpm: number,
  gear: number,
  shiftRPM = SHIFT_RPM
): boolean {
  return rpm >= shiftRPM && gear < 5; // Don't shift past 5th
}

/**
 * Determine next gear after shift
 */
export function getNextGear(currentGear: number): number {
  if (currentGear >= 5) return 5;
  return currentGear + 1;
}

/**
 * Determine previous gear for downshift
 */
export function getPreviousGear(currentGear: number): number {
  if (currentGear <= 1) return 1;
  return currentGear - 1;
}
```

### Hysteresis to Prevent Gear Hunting

Add hysteresis to prevent rapid gear changes near boundaries:

```typescript
/**
 * Calculate gear with hysteresis to prevent gear hunting
 * Once shifted, stay in gear until speed drops below threshold
 */
export function calculateGearWithHysteresis(
  speed: number,
  currentGear: number,
  hysteresisThreshold = 2 // km/h
): number {
  const nextGear = calculateGear(speed);

  // If switching to higher gear
  if (nextGear > currentGear) {
    // Confirm before shifting up
    return nextGear;
  }

  // If switching to lower gear, apply hysteresis
  if (nextGear < currentGear) {
    const range = BREZZA_GEAR_SPEED_RANGES[currentGear];
    const downshiftThreshold = range.min - hysteresisThreshold;

    // Only downshift if significantly below current gear minimum
    if (speed < downshiftThreshold) {
      return nextGear;
    }

    // Stay in current gear
    return currentGear;
  }

  // No change
  return currentGear;
}
```

## Acceleration Simulation

```typescript
/**
 * Calculate acceleration based on throttle input
 * Used for realistic acceleration sound effects
 */
export function calculateAcceleration(
  currentSpeed: number,
  throttleInput: number, // 0-1
  gear: number,
  maxSpeedInGear: number,
  deltaTime: number // milliseconds since last update
): number {
  // Maximum acceleration decreases as speed increases (air resistance)
  const baseAcceleration = 5; // m/s² (rough estimate for Brezza)
  const speedFactor = 1 - (currentSpeed / maxSpeedInGear) ** 0.5;
  const throttleFactor = throttleInput;

  const acceleration = baseAcceleration * speedFactor * throttleFactor;
  const newSpeed = currentSpeed + (acceleration * deltaTime) / 1000;

  return Math.min(newSpeed, maxSpeedInGear);
}
```

## Deceleration/Engine Braking

```typescript
/**
 * Calculate deceleration when throttle is released or brakes applied
 */
export function calculateDeceleration(
  currentSpeed: number,
  brakingIntensity: number, // 0-1, 0 = no brake, 1 = full brake
  gear: number,
  deltaTime: number // milliseconds
): number {
  const engineBrakingFactor = 0.3 + gear * 0.1; // More braking in lower gears
  const brakingFactor = 3; // m/s² for full braking
  const airResistance = 0.5; // m/s²

  const totalDeceleration = 
    engineBrakingFactor + 
    (brakingFactor * brakingIntensity) + 
    airResistance;

  const newSpeed = Math.max(0, currentSpeed - (totalDeceleration * deltaTime) / 1000);

  return newSpeed;
}
```

## Realistic Behavior

### Post-Shift RPM Drop

After shifting to the next gear, RPM drops:

```typescript
/**
 * Calculate RPM immediately after gear shift
 */
export function calculatePostShiftRPM(
  speedBeforeShift: number,
  gearBefore: number,
  gearAfter: number
): number {
  // RPM after shift ≈ (RPM_before / gear_ratio_before) × gear_ratio_after
  const rpmBefore = calculateRPM(speedBeforeShift, gearBefore);
  const ratioChange = BREZZA_GEAR_RATIOS[gearAfter] / BREZZA_GEAR_RATIOS[gearBefore];
  
  // Slightly less than theoretical due to friction losses
  return Math.round(rpmBefore * ratioChange * 0.95);
}
```

### Downshift Blip Matching

For aggressive driving, match RPM on downshift:

```typescript
/**
 * Calculate rev-match RPM for downshift
 */
export function calculateDownshiftRevMatch(
  speedAfterDownshift: number,
  targetGear: number
): number {
  // Need to rev to this RPM before engaging lower gear
  return calculateRPM(speedAfterDownshift, targetGear, undefined, 900, SHIFT_RPM);
}
```

## Test Cases

### Unit Test Examples

```typescript
describe('calculateRPM', () => {
  it('should return idle RPM at 0 speed', () => {
    expect(calculateRPM(0, 1)).toBe(900);
  });

  it('should return shift RPM at max speed for gear', () => {
    expect(calculateRPM(15, 1)).toBe(1750);
    expect(calculateRPM(30, 2)).toBe(1750);
    expect(calculateRPM(50, 3)).toBe(1750);
  });

  it('should interpolate RPM correctly mid-gear', () => {
    const rpm = calculateRPM(7.5, 1); // Mid-range of 1st gear
    expect(rpm).toBe(1325); // (900 + 1750) / 2
  });

  it('should handle all gears', () => {
    for (let gear = 1; gear <= 5; gear++) {
      const range = BREZZA_GEAR_SPEED_RANGES[gear];
      const rpm = calculateRPM(range.max - 0.1, gear);
      expect(rpm).toBeCloseTo(SHIFT_RPM, 10);
    }
  });

  it('should return idle RPM below min speed', () => {
    expect(calculateRPM(-10, 1)).toBe(900);
  });

  it('should return shift RPM above max speed', () => {
    expect(calculateRPM(200, 5)).toBe(1750);
  });
});

describe('calculateGear', () => {
  it('should return 1st gear for low speeds', () => {
    expect(calculateGear(0)).toBe(1);
    expect(calculateGear(10)).toBe(1);
  });

  it('should return correct gear for speed range', () => {
    expect(calculateGear(20)).toBe(2);
    expect(calculateGear(40)).toBe(3);
    expect(calculateGear(60)).toBe(4);
    expect(calculateGear(100)).toBe(5);
  });

  it('should return 5th gear for high speeds', () => {
    expect(calculateGear(180)).toBe(5);
    expect(calculateGear(200)).toBe(5);
  });
});

describe('shouldShift', () => {
  it('should return true when RPM at shift point', () => {
    expect(shouldShift(1750, 1)).toBe(true);
    expect(shouldShift(1800, 1)).toBe(true);
  });

  it('should return false below shift RPM', () => {
    expect(shouldShift(1500, 1)).toBe(false);
  });

  it('should return false when already in 5th gear', () => {
    expect(shouldShift(2000, 5)).toBe(false);
  });
});
```

## Configuration

### User-Adjustable Parameters

```typescript
export interface GearConfiguration {
  shiftRPM: number; // 1500-2000, default 1750
  idleRPM: number; // 800-1000, default 900
  minSpeed: Record<number, number>; // Speed range for each gear
  maxSpeed: Record<number, number>;
  hysteresisThreshold: number; // 1-5 km/h, default 2
}

// Allow users to tune based on preference
export function createGearConfig(preferences?: Partial<GearConfiguration>): GearConfiguration {
  return {
    shiftRPM: preferences?.shiftRPM ?? SHIFT_RPM,
    idleRPM: preferences?.idleRPM ?? IDLE_RPM,
    minSpeed: preferences?.minSpeed ?? Object.fromEntries(
      Object.entries(BREZZA_GEAR_SPEED_RANGES).map(([k, v]) => [k, v.min])
    ),
    maxSpeed: preferences?.maxSpeed ?? Object.fromEntries(
      Object.entries(BREZZA_GEAR_SPEED_RANGES).map(([k, v]) => [k, v.max])
    ),
    hysteresisThreshold: preferences?.hysteresisThreshold ?? 2,
  };
}
```

## Performance Characteristics

### Acceleration Profile (0-100 km/h)

```
Gear  Time (s)  Final RPM  Notes
────────────────────────────────
1     2.5       1750       Rapid acceleration
2     3.2       1750       Shift at 15 km/h
3     4.1       1750       Shift at 30 km/h
4     5.5       1750       Shift at 50 km/h
Total 5.5-6.0   1750       Total time ~6 seconds
```

### Fuel Efficiency

- **Optimal RPM Range**: 1200-1500 RPM (fuel efficient)
- **Economical Speed**: 50-70 km/h in 4th-5th gear
- **Highway Cruising**: 100-120 km/h in 5th gear at ~1400 RPM

---

## Related Files

- [ARCHITECTURE.md](./ARCHITECTURE.md) - How gear logic integrates
- [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md) - How sound changes with RPM
- [domain/vehicle/vehiclePhysics.ts](../src/domain/vehicle/vehiclePhysics.ts) - Implementation

