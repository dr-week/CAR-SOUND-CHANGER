import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DriverPanel from "../home/DriverPanel.vue";
import PhoneWidget from "../home/PhoneWidget.vue";
import SpeedometerGauge from "../../components/SpeedometerGauge.vue";

describe("Home provider states", () => {
  it.each(["inactive", "denied", "stale", "error", "unavailable"])("hides unverified speed when %s", (status) => {
    const view = mount(DriverPanel, {
      props: { speedKph: 72, telemetryStatus: status },
      global: { stubs: { GoogleMap: true, SpeedometerGauge: true } },
    });
    expect(view.text()).not.toContain("GPS speed unavailable");
    expect(view.getComponent(SpeedometerGauge).props("readingAvailable")).toBe(false);
    expect(view.find(".stats-row").exists()).toBe(false);
  });
  it("distinguishes confirmed zero from missing speed", () => {
    const view = mount(DriverPanel, {
      props: { speedKph: 0, telemetryStatus: "active" },
      global: { stubs: { GoogleMap: true, SpeedometerGauge: true } },
    });
    expect(view.find("speedometer-gauge-stub").exists()).toBe(true);
    expect(view.getComponent(SpeedometerGauge).props("readingAvailable")).toBe(true);
    expect(view.find(".speed-empty").exists()).toBe(false);
  });
  it("keeps the dial visible without presenting a stale needle or numeric speed", async () => {
    const view = mount(SpeedometerGauge, { props: { speedKph: 72, source: "GPS", readingAvailable: false } });
    expect(view.find(".speedo-svg").exists()).toBe(true);
    expect(view.get(".speed-num-svg").text()).toBe("—");
    expect(view.find(".needle-rotator").exists()).toBe(false);
    expect(view.attributes("aria-label")).toBe("GPS speed unavailable");
    await view.setProps({ speedKph: 0, readingAvailable: true });
    expect(view.get(".speed-num-svg").text()).toBe("0");
    expect(view.find(".needle-rotator").exists()).toBe(true);
  });
  it("does not invent a phone connection or emergency shortcut", () => {
    const view = mount(PhoneWidget, { props: { activeCall: null } });
    expect(view.text()).toContain("Connection not verified");
    expect(view.findAll("button")).toHaveLength(1);
    expect(view.text()).not.toContain("SOS");
  });
  it("only offers Answer for an incoming call", async () => {
    const call = { callerName: "Caller", callerNumber: "123", isIncoming: true, durationSeconds: 0 };
    const view = mount(PhoneWidget, { props: { activeCall: call } });
    await view.get(".call-action-btn--answer").trigger("click");
    expect(view.emitted("answerCall")).toHaveLength(1);
    await view.setProps({ activeCall: { ...call, isIncoming: false, durationSeconds: 65 } });
    expect(view.find(".call-action-btn--answer").exists()).toBe(false);
    expect(view.text()).toContain("01:05");
  });
  it("integrates revolving North beacon and cardinal telemetry into SpeedometerGauge", async () => {
    const view = mount(SpeedometerGauge, {
      props: { speedKph: 80, source: "GPS", readingAvailable: true, headingDegrees: 315 },
    });
    expect(view.find(".compass-orbit-ticks").exists()).toBe(true);
    const beacon = view.find(".compass-beacon-rotator");
    expect(beacon.exists()).toBe(true);
    expect(view.find(".compass-orbit").attributes("style")).toContain("rotate(-315deg)");
    expect(view.findAll('.compass-orbit-ticks circle[r="2.3"]')).toHaveLength(4);
    expect(view.findAll('.compass-orbit-ticks circle[r="1.3"]')).toHaveLength(4);
    expect(view.text()).toContain("NW · 315°");

    await view.setProps({ headingDegrees: 359 });
    await view.setProps({ headingDegrees: 1 });
    expect(view.find(".compass-orbit").attributes("style")).toContain("rotate(-361deg)");
    await view.setProps({ headingDegrees: 359 });
    expect(view.find(".compass-orbit").attributes("style")).toContain("rotate(-359deg)");

    await view.setProps({ headingDegrees: null });
    expect(view.find(".compass-beacon-rotator").exists()).toBe(false);
    expect(view.text()).not.toContain("NW · 315°");
  });
});
