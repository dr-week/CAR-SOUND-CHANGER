import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VehiclePersonaCard from "../VehiclePersonaCard.vue";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";

describe("VehiclePersonaCard UI Component", () => {
  const defaultProps = {
    profile: CAR_PROFILES.brezza,
    rpm: 1200,
    speedKph: 35,
    audioEnabled: true,
    throttle: 0.65,
    brake: 0,
    profiles: CAR_PROFILES,
  };

  it("renders vehicle identity, specs, and live firing frequency", () => {
    const wrapper = mount(VehiclePersonaCard, { props: defaultProps });

    expect(wrapper.find(".machine-name").text()).toBe("Suzuki Brezza 2021");
    expect(wrapper.text()).toContain("4 CYLINDER");
    expect(wrapper.text()).toContain("REDLINE 6,500 RPM");

    // Firing frequency: (1200 * 4) / 120 = 40 HZ
    expect(wrapper.find(".cell-val").text()).toContain("40 HZ");
  });

  it("displays throttle and brake percentage force meters", () => {
    const wrapper = mount(VehiclePersonaCard, { props: defaultProps });

    expect(wrapper.find(".pedal-pct").text()).toBe("65%");
    const throttleFill = wrapper.find(".throttle-fill");
    expect(throttleFill.attributes("style")).toContain("width: 65%");
  });

  it("emits toggleEngine when ignition button is clicked", async () => {
    const wrapper = mount(VehiclePersonaCard, { props: defaultProps });

    const ignBtn = wrapper.find(".ignition-button");
    expect(ignBtn.exists()).toBe(true);
    await ignBtn.trigger("click");

    expect(wrapper.emitted("toggleEngine")).toBeTruthy();
  });

  it("emits selectProfile when a quick vehicle pill is clicked", async () => {
    const wrapper = mount(VehiclePersonaCard, { props: defaultProps });

    const pills = wrapper.findAll(".quick-profile-pill");
    expect(pills.length).toBeGreaterThanOrEqual(2);

    await pills[1].trigger("click");
    expect(wrapper.emitted("selectProfile")).toBeTruthy();
  });
});
