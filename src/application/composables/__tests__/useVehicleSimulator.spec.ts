import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useVehicleSimulator } from "../useVehicleSimulator";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";
import { createMockAudio, createMockGeolocation } from "./mockSimulatorEnvironment";

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

    for (let i = 0; i < 10; i++) sim.shift(1);
    expect(sim.vehicle.gear).toBe(CAR_PROFILES.brezza.gears);

    for (let i = 0; i < 10; i++) sim.shift(-1);
    expect(sim.vehicle.gear).toBe(1);
  });

  it("switches vehicle profile and resets drivetrain", () => {
    const { sim } = mountSimulator();

    sim.selectProfile("mustang");
    expect(sim.vehicle.profile.id).toBe("mustang");
    expect(sim.vehicle.rpm).toBe(CAR_PROFILES.mustang.idleRpm);
    expect(sim.vehicle.gear).toBe(1);

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
