import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useVehicleSimulator } from "../useVehicleSimulator";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";

function createMockAudio() {
  const param = () => ({
    value: 0,
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  });
  function makeNode() {
    return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      gain: param(),
      frequency: param(),
      Q: param(),
      setPeriodicWave: vi.fn(),
      buffer: null,
      loop: false,
      type: "",
    };
  }
  class MockAudioContext {
    state = "suspended";
    currentTime = 0;
    sampleRate = 44100;
    destination = {};
    resume = vi.fn(async () => {
      this.state = "running";
    });
    suspend = vi.fn(async () => {
      this.state = "suspended";
    });
    close = vi.fn(async () => {
      this.state = "closed";
    });
    createGain = vi.fn(() => makeNode());
    createOscillator = vi.fn(() => makeNode());
    createBiquadFilter = vi.fn(() => makeNode());
    createBufferSource = vi.fn(() => makeNode());
    createBuffer = vi.fn(() => ({ getChannelData: () => new Float32Array(100) }));
    createPeriodicWave = vi.fn(() => ({}));
  }
  vi.stubGlobal("AudioContext", MockAudioContext);
}

function createMockGeolocation() {
  let watchCb: ((pos: any) => void) | null = null;
  const mockWatch = vi.fn((success) => {
    watchCb = success;
    return 10;
  });
  const mockClear = vi.fn();
  vi.stubGlobal("navigator", {
    geolocation: {
      watchPosition: mockWatch,
      clearWatch: mockClear,
    },
    bluetooth: {
      requestDevice: vi.fn(async () => ({
        name: "Blaupunkt BT Headunit",
        gatt: {
          connected: true,
          disconnect: vi.fn(),
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    },
  });
  return {
    emitPosition: (speedKph: number) => {
      if (watchCb) {
        watchCb({
          coords: { latitude: 12.9, longitude: 77.5, speed: speedKph / 3.6 },
          timestamp: Date.now(),
        });
      }
    },
  };
}

describe("useVehicleSimulator UI Integration", () => {
  beforeEach(() => {
    createMockAudio();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mountSimulator() {
    let sim!: ReturnType<typeof useVehicleSimulator>;
    const TestComponent = defineComponent({
      setup() {
        sim = useVehicleSimulator();
        return () => h("div");
      },
    });
    const wrapper = mount(TestComponent);
    return { sim, wrapper };
  }

  it("initializes with default Suzuki Brezza profile and idle state", () => {
    const { sim } = mountSimulator();
    expect(sim.vehicle.profile.id).toBe("brezza");
    expect(sim.vehicle.rpm).toBe(CAR_PROFILES.brezza.idleRpm);
    expect(sim.vehicle.gear).toBe(1);
    expect(sim.vehicle.speedKph).toBe(0);
    expect(sim.greenScore.points).toBe(100);
    expect(sim.audioEnabled.value).toBe(false);
    expect(sim.gpsEnabled.value).toBe(false);
  });

  it("synchronizes reactive accelerating and braking states from setControl", () => {
    const { sim } = mountSimulator();

    sim.setControl("accelerate", true);
    expect(sim.accelerating.value).toBe(true);

    sim.setControl("accelerate", false);
    expect(sim.accelerating.value).toBe(false);

    sim.setControl("brake", true);
    expect(sim.braking.value).toBe(true);

    sim.setControl("brake", false);
    expect(sim.braking.value).toBe(false);
  });

  it("handles gear shifting within profile bounds", () => {
    const { sim } = mountSimulator();
    expect(sim.vehicle.gear).toBe(1);

    sim.shift(1);
    expect(sim.vehicle.gear).toBe(2);

    // Max gear clamp
    for (let i = 0; i < 10; i++) sim.shift(1);
    expect(sim.vehicle.gear).toBe(CAR_PROFILES.brezza.gears);

    // Min gear clamp
    for (let i = 0; i < 10; i++) sim.shift(-1);
    expect(sim.vehicle.gear).toBe(1);
  });

  it("switches vehicle profile and resets drivetrain", () => {
    const { sim } = mountSimulator();

    sim.selectProfile("mustang");
    expect(sim.vehicle.profile.id).toBe("mustang");
    expect(sim.vehicle.rpm).toBe(CAR_PROFILES.mustang.idleRpm);
    expect(sim.vehicle.gear).toBe(1);

    // Invalid profile is safely ignored
    sim.selectProfile("non_existent_car");
    expect(sim.vehicle.profile.id).toBe("mustang");
  });

  it("manages volume setting and clamping", () => {
    const { sim } = mountSimulator();

    sim.setVolume(85);
    expect(sim.volume.value).toBe(85);

    sim.setVolume(-15);
    expect(sim.volume.value).toBe(0);

    sim.setVolume(200);
    expect(sim.volume.value).toBe(100);
  });

  it("toggles audio engine on and off with reactive status updates", async () => {
    const { sim } = mountSimulator();
    expect(sim.audioEnabled.value).toBe(false);
    expect(sim.audioStatus.value).toBe("inactive");

    await sim.enableAudio();
    expect(sim.audioEnabled.value).toBe(true);
    expect(sim.audioStatus.value).toBe("active");

    await sim.enableAudio();
    expect(sim.audioEnabled.value).toBe(false);
    expect(sim.audioStatus.value).toBe("inactive");
  });

  it("toggles GPS telemetry and feeds position fixes", () => {
    const { emitPosition } = createMockGeolocation();
    const { sim } = mountSimulator();

    sim.setGps(true);
    expect(sim.gpsEnabled.value).toBe(true);

    emitPosition(45);
    expect(sim.telemetryStatus.value).toBe("active");
    expect(sim.vehicle.speedKph).toBe(45);

    sim.setGps(false);
    expect(sim.gpsEnabled.value).toBe(false);
  });

  it("handles Bluetooth pairing and reactive status updates", async () => {
    createMockGeolocation();
    const { sim } = mountSimulator();

    await sim.connectBluetooth();
    expect(sim.bluetoothStatus.value).toBe("connected");
    expect(sim.bluetoothDeviceName.value).toBe("Blaupunkt BT Headunit");

    sim.disconnectBluetooth();
    expect(sim.bluetoothStatus.value).toBe("idle");
  });

  it("fully resets drivetrain, scoring, and UI pedal states", () => {
    const { sim } = mountSimulator();

    sim.setControl("accelerate", true);
    sim.shift(1);
    sim.greenScore.points = 70;

    sim.reset();

    expect(sim.accelerating.value).toBe(false);
    expect(sim.braking.value).toBe(false);
    expect(sim.vehicle.gear).toBe(1);
    expect(sim.vehicle.speedKph).toBe(0);
    expect(sim.vehicle.rpm).toBe(CAR_PROFILES.brezza.idleRpm);
    expect(sim.greenScore.points).toBe(100);
  });
});
