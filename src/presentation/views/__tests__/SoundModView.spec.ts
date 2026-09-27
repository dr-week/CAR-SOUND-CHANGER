import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SoundModView from "../SoundModView.vue";
import type { VehicleProfile } from "../../../domain/vehicle/types";

const mockProfile: VehicleProfile = {
  id: "brezza",
  name: "Suzuki Brezza 2021",
  cylinders: 4,
  gears: 5,
  idleRpm: 800,
  redlineRpm: 6500,
  shiftRpm: 6000,
  baseTone: 58,
  topSpeedKph: 180,
};

const mockProfiles: Record<string, VehicleProfile> = {
  brezza: mockProfile,
};

describe("SoundModView", () => {
  const createWrapper = (propsOverrides = {}) => {
    return mount(SoundModView, {
      props: {
        audioEnabled: true,
        profiles: mockProfiles,
        activeProfile: mockProfile,
        rpm: 2400,
        gear: 2,
        frequencyData: null,
        engineVolume: 80,
        effectiveEngineVolume: 80,
        engineZone: "all",
        duckEngine: false,
        duckAmount: 35,
        playing: false,
        accelerating: false,
        braking: false,
        ...propsOverrides,
      },
    });
  };

  it("renders Car Sound Changer title and ignition button", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Car Sound Changer");
    expect(wrapper.text()).toContain("Mod Active · Stop");
  });

  it("renders all driving controls (Accelerate, Brake, Upshift, Downshift, Reset)", () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".drive-btn--gas").exists()).toBe(true);
    expect(wrapper.find(".drive-btn--brake").exists()).toBe(true);
    expect(wrapper.find(".upshift").exists()).toBe(true);
    expect(wrapper.find(".downshift").exists()).toBe(true);
    expect(wrapper.find(".reset-btn").exists()).toBe(true);
  });

  it("emits shift event delta on upshift and downshift", async () => {
    const wrapper = createWrapper();
    await wrapper.find(".upshift").trigger("click");
    expect(wrapper.emitted("shift")?.[0]).toEqual([1]);

    await wrapper.find(".downshift").trigger("click");
    expect(wrapper.emitted("shift")?.[1]).toEqual([-1]);
  });

  it("emits reset event when reset button clicked", async () => {
    const wrapper = createWrapper();
    await wrapper.find(".reset-btn").trigger("click");
    expect(wrapper.emitted("reset")).toBeTruthy();
  });

  it("emits control event when gas pedal pointerdown is activated", async () => {
    const wrapper = createWrapper();
    const gas = wrapper.find(".drive-btn--gas");
    await gas.trigger("pointerdown", { button: 0, pointerId: 1 });
    expect(wrapper.emitted("control")?.[0]).toEqual(["accelerate", true]);
  });

  it("emits update:engineZone when zone picker button is clicked", async () => {
    const wrapper = createWrapper();
    const rearBtn = wrapper.findAll(".zone-btn").find((btn) => btn.text().toLowerCase() === "rear");
    expect(rearBtn).toBeDefined();
    await rearBtn?.trigger("click");
    expect(wrapper.emitted("update:engineZone")?.[0]).toEqual(["rear"]);
  });

  it("emits update:duckEngine when ducking switch clicked", async () => {
    const wrapper = createWrapper();
    await wrapper.find(".switch").trigger("click");
    expect(wrapper.emitted("update:duckEngine")?.[0]).toEqual([true]);
  });

  it("emits toggleEngine on ignition button click", async () => {
    const wrapper = createWrapper({ audioEnabled: false });
    expect(wrapper.text()).toContain("Ignite Sound Mod");
    await wrapper.find(".power-button").trigger("click");
    expect(wrapper.emitted("toggleEngine")).toBeTruthy();
  });
});
