import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InstrumentDashboard from "../InstrumentDashboard.vue";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";

describe("InstrumentDashboard UI Integration", () => {
  const defaultProps = {
    rpm: 3200,
    gear: 3,
    speedKph: 55,
    profile: CAR_PROFILES.brezza,
    accelerating: false,
    braking: false,
    audioStatus: "active" as const,
    muted: false,
    telemetryStatus: "active" as const,
    greenScore: 92,
    bluetoothStatus: "connected" as const,
  };

  it("renders cockpit twin-cluster, speed, gear, and telemetry", () => {
    const wrapper = mount(InstrumentDashboard, { props: defaultProps });

    expect(wrapper.find(".instrument-dashboard").exists()).toBe(true);
    expect(wrapper.find(".twin-cluster").exists()).toBe(true);

    // Speedometer displays speed
    expect(wrapper.text()).toContain("55");
    // Gear indicator displays gear
    expect(wrapper.text()).toContain("3");
  });

  it("emits control event when gas pedal is pressed and released", async () => {
    const wrapper = mount(InstrumentDashboard, { props: defaultProps });

    const gasPedal = wrapper.find(".pedal.accelerate");
    expect(gasPedal.exists()).toBe(true);

    await gasPedal.trigger("pointerdown", { button: 0 });
    expect(wrapper.emitted("control")).toBeTruthy();
    expect(wrapper.emitted("control")![0]).toEqual(["accelerate", true]);

    await gasPedal.trigger("pointerup");
    expect(wrapper.emitted("control")![1]).toEqual(["accelerate", false]);
  });

  it("emits control event when brake pedal is pressed and released", async () => {
    const wrapper = mount(InstrumentDashboard, { props: defaultProps });

    const brakePedal = wrapper.find(".pedal.brake");
    expect(brakePedal.exists()).toBe(true);

    await brakePedal.trigger("pointerdown", { button: 0 });
    expect(wrapper.emitted("control")).toBeTruthy();
    expect(wrapper.emitted("control")![0]).toEqual(["brake", true]);

    await brakePedal.trigger("pointerup");
    expect(wrapper.emitted("control")![1]).toEqual(["brake", false]);
  });

  it("emits shift events when gear paddle buttons are clicked", async () => {
    const wrapper = mount(InstrumentDashboard, { props: defaultProps });

    const shiftButtons = wrapper.findAll(".shift");
    expect(shiftButtons.length).toBeGreaterThanOrEqual(2);

    // First button is upshift (+1), second is downshift (-1)
    await shiftButtons[0].trigger("click");
    expect(wrapper.emitted("shift")).toBeTruthy();
    expect(wrapper.emitted("shift")![0]).toEqual([1]);

    await shiftButtons[1].trigger("click");
    expect(wrapper.emitted("shift")![1]).toEqual([-1]);
  });

  it("emits reset event when reset button is clicked", async () => {
    const wrapper = mount(InstrumentDashboard, { props: defaultProps });

    const resetBtn = wrapper.find(".reset");
    expect(resetBtn.exists()).toBe(true);

    await resetBtn.trigger("click");
    expect(wrapper.emitted("reset")).toBeTruthy();
  });

  it("applies active styles to pedals when accelerating or braking is true", () => {
    const wrapper = mount(InstrumentDashboard, {
      props: {
        ...defaultProps,
        accelerating: true,
        braking: true,
      },
    });

    const gasPedal = wrapper.find(".pedal.accelerate");
    const brakePedal = wrapper.find(".pedal.brake");

    expect(gasPedal.classes()).toContain("active");
    expect(brakePedal.classes()).toContain("active");
  });

});
