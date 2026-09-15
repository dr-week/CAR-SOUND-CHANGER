# Testing Strategy & Guidelines

Comprehensive testing approach for Car Sound Changer with coverage goals and best practices.

## Testing Pyramid

```
        E2E Tests (UI/Integration)
           ↑
       ↗   ↑   ↖
   Integration Tests
         ↑   ↑   ↑
      Unit Tests (Domain)
        ↓   ↓   ↓
```

**Test Distribution**:
- 70% Unit Tests
- 20% Integration Tests
- 10% E2E Tests

## Test Setup

### Installation

Tests are configured with Vitest + Vue Test Utils:

```bash
# Already installed, but verify
npm list vitest @vue/test-utils

# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/index.ts'
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

## Unit Tests (Domain Layer)

### Purpose

Test pure business logic with NO framework dependencies.

### Location

```
src/domain/vehicle/
├── vehiclePhysics.ts
└── __tests__/
    ├── vehiclePhysics.test.ts
    └── fixtures.ts
```

### Example: RPM Calculation Tests

```typescript
// src/domain/vehicle/__tests__/vehiclePhysics.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRPM, calculateGear, shouldShift } from '../vehiclePhysics';
import { BREZZA_GEAR_SPEED_RANGES, SHIFT_RPM } from '../constants';

describe('calculateRPM', () => {
  describe('idle state', () => {
    it('should return idle RPM at 0 speed', () => {
      const rpm = calculateRPM(0, 1);
      expect(rpm).toBe(900);
    });

    it('should return idle RPM below minimum gear speed', () => {
      const rpm = calculateRPM(-10, 1);
      expect(rpm).toBe(900);
    });
  });

  describe('within gear range', () => {
    it('should interpolate RPM correctly mid-gear', () => {
      const rpmAt0 = calculateRPM(0, 1);
      const rpmAtMax = calculateRPM(15, 1);
      const rpmAtMid = calculateRPM(7.5, 1);

      const expectedMid = (rpmAt0 + rpmAtMax) / 2;
      expect(rpmAtMid).toBeCloseTo(expectedMid, 0);
    });

    it('should return shift RPM at max speed for gear', () => {
      expect(calculateRPM(15, 1)).toBe(SHIFT_RPM);
      expect(calculateRPM(30, 2)).toBe(SHIFT_RPM);
      expect(calculateRPM(50, 3)).toBe(SHIFT_RPM);
      expect(calculateRPM(70, 4)).toBe(SHIFT_RPM);
    });
  });

  describe('above gear range', () => {
    it('should return shift RPM above maximum gear speed', () => {
      const rpm = calculateRPM(100, 1); // Way above 1st gear max (15)
      expect(rpm).toBe(SHIFT_RPM);
    });
  });

  describe('all gears', () => {
    it('should work correctly for all 5 gears', () => {
      const testSpeeds = [7.5, 22.5, 40, 60, 125];
      const testGears = [1, 2, 3, 4, 5];

      testSpeeds.forEach((speed, index) => {
        const rpm = calculateRPM(speed, testGears[index]);
        expect(rpm).toBeGreaterThanOrEqual(900);
        expect(rpm).toBeLessThanOrEqual(SHIFT_RPM);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined gear gracefully', () => {
      const rpm = calculateRPM(50, 99);
      expect(rpm).toBe(900); // Default fallback
    });

    it('should handle decimal speeds', () => {
      const rpm = calculateRPM(12.5, 1);
      expect(typeof rpm).toBe('number');
      expect(rpm).toBeGreaterThanOrEqual(900);
    });

    it('should handle very high speeds', () => {
      const rpm = calculateRPM(1000, 5);
      expect(rpm).toBe(SHIFT_RPM);
    });
  });
});

describe('calculateGear', () => {
  it('should return 1st gear for low speeds', () => {
    expect(calculateGear(0)).toBe(1);
    expect(calculateGear(5)).toBe(1);
    expect(calculateGear(15)).toBe(1);
  });

  it('should return correct gear for each range', () => {
    expect(calculateGear(20)).toBe(2); // 15-30
    expect(calculateGear(40)).toBe(3); // 30-50
    expect(calculateGear(60)).toBe(4); // 50-70
    expect(calculateGear(100)).toBe(5); // 70+
  });

  it('should return 5th gear for very high speeds', () => {
    expect(calculateGear(150)).toBe(5);
    expect(calculateGear(200)).toBe(5);
  });

  it('should handle speed at gear boundaries', () => {
    expect(calculateGear(15)).toBe(1); // Boundary between 1st and 2nd
    expect(calculateGear(30)).toBe(3); // Boundary between 2nd and 3rd
  });
});

describe('shouldShift', () => {
  it('should return true when at shift RPM', () => {
    expect(shouldShift(SHIFT_RPM, 1)).toBe(true);
  });

  it('should return true when above shift RPM', () => {
    expect(shouldShift(SHIFT_RPM + 100, 1)).toBe(true);
  });

  it('should return false below shift RPM', () => {
    expect(shouldShift(1500, 1)).toBe(false);
    expect(shouldShift(1200, 1)).toBe(false);
  });

  it('should return false in 5th gear', () => {
    expect(shouldShift(2000, 5)).toBe(false);
  });

  it('should work for intermediate gears', () => {
    expect(shouldShift(SHIFT_RPM, 3)).toBe(true);
    expect(shouldShift(1500, 3)).toBe(false);
  });
});
```

### Test Fixtures

```typescript
// src/domain/vehicle/__tests__/fixtures.ts
export const testVehicleProfiles = {
  brezza: {
    make: 'Suzuki',
    model: 'Brezza',
    maxRPM: 6000,
  },
};

export const testScenarios = {
  cityDriving: {
    speeds: [0, 5, 10, 15, 20, 25, 30],
    expectedGears: [1, 1, 1, 1, 2, 2, 2],
  },
  highwayDriving: {
    speeds: [60, 80, 100, 120, 140],
    expectedGears: [4, 4, 5, 5, 5],
  },
};
```

## Integration Tests (Application Layer)

### Purpose

Test services and how layers work together.

### Example: DrivingSession Service

```typescript
// src/application/services/__tests__/DrivingSession.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DrivingSession } from '../DrivingSession';
import { MockAudioEngine } from '@/__tests__/mocks/MockAudioEngine';

describe('DrivingSession', () => {
  let session: DrivingSession;
  let mockAudio: MockAudioEngine;

  beforeEach(() => {
    mockAudio = new MockAudioEngine();
    session = new DrivingSession(mockAudio);
  });

  describe('speed update flow', () => {
    it('should calculate RPM on speed update', () => {
      session.onSpeedUpdate(30);
      expect(session.getRPM()).toBeGreaterThan(900);
    });

    it('should change gear based on speed', () => {
      session.onSpeedUpdate(0);
      expect(session.getGear()).toBe(1);

      session.onSpeedUpdate(25);
      expect(session.getGear()).toBe(2);

      session.onSpeedUpdate(60);
      expect(session.getGear()).toBe(4);
    });

    it('should trigger audio update on speed change', () => {
      session.onSpeedUpdate(30);
      expect(mockAudio.lastPlayCall).toBeDefined();
      expect(mockAudio.lastPlayCall.rpm).toBeGreaterThan(900);
    });
  });

  describe('gear shifts', () => {
    it('should detect gear shift requirement', () => {
      session.onSpeedUpdate(15); // 1st gear at max RPM
      expect(session.shouldShift()).toBe(true);
    });

    it('should handle gear shift', () => {
      session.onSpeedUpdate(15); // 1st at shift point
      session.shiftGear();
      expect(session.getGear()).toBe(2);
      expect(session.getRPM()).toBeLessThan(1000); // Post-shift RPM drop
    });

    it('should trigger shift sound', () => {
      session.onSpeedUpdate(15);
      session.shiftGear();
      expect(mockAudio.shiftSoundPlayed).toBe(true);
    });
  });

  describe('session metrics', () => {
    it('should track session duration', () => {
      const metrics1 = session.getMetrics();
      // Simulate time passing
      vi.advanceTimersByTime(1000);
      const metrics2 = session.getMetrics();
      
      expect(metrics2.duration).toBeGreaterThan(metrics1.duration);
    });

    it('should track distance traveled', () => {
      session.onSpeedUpdate(50); // 50 km/h
      vi.advanceTimersByTime(1000); // 1 second
      const metrics = session.getMetrics();
      
      // 50 km/h for 1s ≈ 0.014 km
      expect(metrics.distance).toBeCloseTo(0.014, 2);
    });
  });
});
```

### Mock Objects

```typescript
// src/__tests__/mocks/MockAudioEngine.ts
import type { EngineSoundOutput } from '@/application/ports/EngineSoundOutput';

export class MockAudioEngine implements EngineSoundOutput {
  lastPlayCall: any = null;
  shiftSoundPlayed = false;
  playCount = 0;

  playEngineSound(params: { rpm: number; gear: number; volume: number }): void {
    this.lastPlayCall = params;
    this.playCount++;
  }

  playShiftSound(params: { fromGear: number; toGear: number }): void {
    this.shiftSoundPlayed = true;
  }

  stop(): void {
    this.lastPlayCall = null;
  }

  reset(): void {
    this.lastPlayCall = null;
    this.shiftSoundPlayed = false;
    this.playCount = 0;
  }
}
```

## Component Tests (Presentation Layer)

### Example: RPMGauge Component

```typescript
// src/presentation/components/__tests__/RPMGauge.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RPMGauge from '../RPMGauge.vue';

describe('RPMGauge.vue', () => {
  it('renders rpm value', () => {
    const wrapper = mount(RPMGauge, {
      props: { rpm: 2500 }
    });

    expect(wrapper.text()).toContain('2500');
  });

  it('updates when prop changes', async () => {
    const wrapper = mount(RPMGauge, {
      props: { rpm: 1000 }
    });

    await wrapper.setProps({ rpm: 3000 });
    expect(wrapper.text()).toContain('3000');
  });

  it('displays correct needle position', async () => {
    const wrapper = mount(RPMGauge, {
      props: { rpm: 3000, maxRPM: 6000 }
    });

    // Needle should be at 50% (3000/6000)
    const needle = wrapper.find('line');
    expect(needle.exists()).toBe(true);
  });

  it('handles edge cases', async () => {
    const wrapper = mount(RPMGauge, {
      props: { rpm: 0, maxRPM: 6000 }
    });

    expect(wrapper.text()).toContain('0');

    await wrapper.setProps({ rpm: 10000 }); // Above max
    expect(wrapper.text()).toContain('10000'); // Should still display
  });
});
```

## E2E Tests (Full Application Flow)

### Vitest for E2E (Browser Testing)

```typescript
// src/__tests__/e2e/main-flow.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import { MockGPSService } from '@/__tests__/mocks/MockGPSService';
import { MockAudioEngine } from '@/__tests__/mocks/MockAudioEngine';

describe('Main Application Flow (E2E)', () => {
  let app: any;
  let mockGPS: MockGPSService;
  let mockAudio: MockAudioEngine;

  beforeEach(() => {
    mockGPS = new MockGPSService();
    mockAudio = new MockAudioEngine();
    
    app = mount(App, {
      global: {
        provide: {
          gpsService: mockGPS,
          audioEngine: mockAudio
        }
      }
    });
  });

  afterEach(() => {
    app.unmount();
  });

  describe('start driving session', () => {
    it('should initialize components on mount', () => {
      expect(app.find('.rpm-gauge').exists()).toBe(true);
      expect(app.find('.speed-display').exists()).toBe(true);
      expect(app.find('.gear-indicator').exists()).toBe(true);
    });

    it('should start GPS on start button click', async () => {
      const startButton = app.find('[data-test="start-button"]');
      await startButton.trigger('click');

      expect(mockGPS.isTracking).toBe(true);
    });
  });

  describe('city driving scenario', () => {
    it('should simulate acceleration from 0 to 60 km/h with gear shifts', async () => {
      const startButton = app.find('[data-test="start-button"]');
      await startButton.trigger('click');

      // Simulate GPS updates
      const speeds = [0, 10, 15, 20, 30, 50, 60];
      for (const speed of speeds) {
        mockGPS.setSpeed(speed);
        vi.advanceTimersByTime(100);
        await app.vm.$nextTick();

        // Check RPM gauge updates
        expect(app.find('.rpm-gauge').text()).toBeTruthy();
      }

      // Verify audio played multiple times (for different gears)
      expect(mockAudio.playCount).toBeGreaterThan(5);
    });
  });

  describe('gear shift sound effects', () => {
    it('should play shift sound when shifting gears', async () => {
      const startButton = app.find('[data-test="start-button"]');
      await startButton.trigger('click');

      mockGPS.setSpeed(15); // 1st gear at shift point
      vi.advanceTimersByTime(100);
      await app.vm.$nextTick();

      // Should trigger shift to 2nd
      expect(mockAudio.shiftSoundPlayed).toBe(true);
    });
  });

  describe('stop session', () => {
    it('should stop GPS and audio when stopping', async () => {
      const startButton = app.find('[data-test="start-button"]');
      await startButton.trigger('click');

      const stopButton = app.find('[data-test="stop-button"]');
      await stopButton.trigger('click');

      expect(mockGPS.isTracking).toBe(false);
    });
  });
});
```

## Coverage Goals

### Minimum Coverage by Layer

```
Layer              Files  Lines  Functions  Branches
──────────────────────────────────────────────────
Domain             100%   90%    90%        85%
Application        80%    80%    80%        75%
Infrastructure     70%    70%    70%        65%
Presentation       60%    60%    60%        55%
──────────────────────────────────────────────────
Overall            80%    80%    80%        75%
```

### Check Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific file
npm run test:coverage -- --reporter=text -- src/domain/vehicle/vehiclePhysics.ts
```

## Running Tests

### Development

```bash
# Run all tests once
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm run test -- vehiclePhysics.test.ts

# Run tests matching pattern
npm run test -- --grep "should calculate"

# Run with UI
npm run test -- --ui
```

### CI/CD Pipeline

```bash
# Run tests with coverage
npm run test:coverage

# Fail if coverage below threshold
npm run test:coverage -- --coverage.lines=80 --coverage.functions=80
```

## Test Patterns

### Pattern 1: Arrange-Act-Assert (AAA)

```typescript
it('should calculate correct RPM', () => {
  // Arrange
  const speed = 30;
  const gear = 2;

  // Act
  const rpm = calculateRPM(speed, gear);

  // Assert
  expect(rpm).toBeGreaterThan(900);
  expect(rpm).toBeLessThanOrEqual(SHIFT_RPM);
});
```

### Pattern 2: Describe-Nested Structure

```typescript
describe('calculateGear', () => {
  describe('with valid input', () => {
    it('should return correct gear', () => {});
  });

  describe('with edge cases', () => {
    it('should handle boundary', () => {});
  });
});
```

### Pattern 3: Parameterized Tests

```typescript
it.each([
  [0, 1],
  [20, 2],
  [40, 3],
  [60, 4],
  [100, 5]
])('should return gear %i for speed %i', (speed, expectedGear) => {
  expect(calculateGear(speed)).toBe(expectedGear);
});
```

## Debugging Tests

### Print Debug Info

```typescript
import { describe, it } from 'vitest';

it('debug test', () => {
  const value = calculateRPM(30, 2);
  console.log('RPM:', value); // Will show in test output
});
```

### Use Debugger

```bash
# Debug tests in Node debugger
node --inspect-brk ./node_modules/.bin/vitest
```

## Related Documentation

- [DEV_RULES.md](./DEV_RULES.md) - Testing standards section
- [CODE_DIVISION_RULES.md](./CODE_DIVISION_RULES.md) - Code organization
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System layers being tested

