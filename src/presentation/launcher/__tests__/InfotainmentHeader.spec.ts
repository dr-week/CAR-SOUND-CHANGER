import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import InfotainmentHeader from "../InfotainmentHeader.vue";

describe("InfotainmentHeader UI Component", () => {
  const defaultProps = {
    time: "14:32",
    date: "Thursday, 17 September",
    quickOpen: false,
    bluetoothStatus: "connected",
    telemetryStatus: "live",
    speedKph: 68,
    batteryLevel: 85,
    isOnline: true,
  };

  it("supports the bottom information row without an extra speed readout", () => {
    const wrapper = mount(InfotainmentHeader, {
      props: { ...defaultProps, inline: true, currentView: "home" },
    });
    expect(wrapper.classes()).toContain("telltale-strip--inline");
    expect(wrapper.find(".telltale-speed").exists()).toBe(false);
    expect(wrapper.find(".clock-time").text()).toBe("14:32");
  });

  it("renders speed telltale, clock, battery, and GPS status correctly", () => {
    const wrapper = mount(InfotainmentHeader, { props: defaultProps });

    expect(wrapper.find(".telltale-speed strong").text()).toBe("68");
    expect(wrapper.find(".clock-time").text()).toBe("14:32");
    expect(wrapper.find(".gps-pill svg").exists()).toBe(true);
    expect(wrapper.find(".gps-pill").attributes("title")).toContain("GPS: live");
    expect(wrapper.find(".clock-dot").exists()).toBe(false);
    expect(wrapper.find(".telltale-battery").exists()).toBe(false);
    expect(wrapper.find(".internet-indicator").attributes("aria-label")).toBe("Network connected");
    expect(wrapper.text()).not.toContain("LAUNCHER");
  });

  it("exposes drawer state and keeps unavailable GPS icon-only", () => {
    const wrapper = mount(InfotainmentHeader, {
      props: { ...defaultProps, quickOpen: true, telemetryStatus: "inactive" },
    });
    expect(wrapper.find(".telltale-clock").attributes("aria-expanded")).toBe("true");
    expect(wrapper.find(".gps-pill").text()).toBe("");
    expect(wrapper.find(".gps-pill").attributes("title")).toContain("inactive");
    expect(wrapper.findAll(".gps-pill circle")).toHaveLength(1);
  });

  it("displays headlight illumination telltale badge when isNight is true", () => {
    const wrapperNight = mount(InfotainmentHeader, {
      props: { ...defaultProps, isNight: true },
    });
    expect(wrapperNight.find(".telltale-illum").exists()).toBe(true);
    expect(wrapperNight.find(".telltale-illum").text()).toContain("ILLUM");

    const wrapperDay = mount(InfotainmentHeader, {
      props: { ...defaultProps, isNight: false },
    });
    expect(wrapperDay.find(".telltale-illum").exists()).toBe(false);
  });

  it("emits events on interactive telltale cluster buttons", async () => {
    const wrapper = mount(InfotainmentHeader, { props: defaultProps });

    await wrapper.find(".telltale-clock").trigger("click");
    expect(wrapper.emitted("toggleQuick")).toBeTruthy();

    await wrapper.find(".gps-pill").trigger("click");
    expect(wrapper.emitted("toggleGps")).toBeTruthy();

    const btBtn = wrapper.find("button[aria-label='Bluetooth connection']");
    await btBtn.trigger("click");
    expect(wrapper.emitted("toggleBluetooth")).toBeTruthy();
  });
});
