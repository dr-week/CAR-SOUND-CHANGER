import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HomeView from "../HomeView.vue";
import SpeedometerGauge from "../../components/SpeedometerGauge.vue";

describe("HomeView Dual Modular Cockpit", () => {
  const defaultProps = {
    playing: false,
    audioSource: "Bluetooth" as const,
    masterVolume: 65,
    speedKph: 72,
    gear: 3,
    batteryLevel: 94,
    telemetryStatus: "active",
  };

  it("renders two major sections and does NOT contain Sound Mod on Home", () => {
    const wrapper = mount(HomeView, {
      props: defaultProps,
      global: { stubs: { MediaPlayer: true, GoogleMap: true, SpeedometerGauge: true } },
    });

    const leftPanel = wrapper.find(".home-panel--left");
    const rightPanel = wrapper.find(".home-panel--right");

    expect(leftPanel.exists()).toBe(true);
    expect(rightPanel.exists()).toBe(true);

    // Sound Mod must NOT exist on Home
    expect(wrapper.text()).not.toContain("Sound Studio");
    expect(wrapper.find(".sound-card").exists()).toBe(false);
  });

  it("passes verified speed to the gauge and switches to navigation", async () => {
    const wrapper = mount(HomeView, {
      props: defaultProps,
      global: { stubs: { MediaPlayer: true, GoogleMap: true, SpeedometerGauge: true } },
    });

    // Default: Speedometer view
    expect(wrapper.getComponent(SpeedometerGauge).props("speedKph")).toBe(72);
    expect(wrapper.find(".stats-row").exists()).toBe(false);

    // Flip left panel to 3D Map
    const mapTab = wrapper.findAll(".home-panel--left .panel-tab-btn")[1];
    await mapTab.trigger("click");

    expect(wrapper.find(".panel-content--map").exists()).toBe(true);
    expect(wrapper.find(".panel-content--speed").exists()).toBe(false);

    // Click map handoff button
    const handoffBtn = wrapper.find(".map-handoff-btn");
    await handoffBtn.trigger("click");
    expect(wrapper.emitted("openNavigate")).toHaveLength(1);
  });

  it("renders music player and volume steppers on right panel and flips to call HUD and apps", async () => {
    const wrapper = mount(HomeView, {
      props: defaultProps,
      global: { stubs: { MediaPlayer: true, GoogleMap: true, SpeedometerGauge: true } },
    });

    // Default: Music view with volume buttons
    expect(wrapper.find(".panel-content--music").exists()).toBe(true);
    const volDown = wrapper.find('[aria-label="Decrease volume"]');
    const volUp = wrapper.find('[aria-label="Increase volume"]');

    await volDown.trigger("click");
    expect(wrapper.emitted("update:masterVolume")?.[0]).toEqual([60]);

    await volUp.trigger("click");
    expect(wrapper.emitted("update:masterVolume")?.[1]).toEqual([70]);
    expect(wrapper.find(".home-panel--right .volume-dock-bar").exists()).toBe(false);

    // Flip right panel to Call HUD
    const callTab = wrapper.findAll(".home-panel--right .panel-tab-btn")[1];
    await callTab.trigger("click");

    expect(wrapper.find(".panel-content--call").exists()).toBe(true);
    expect(wrapper.find('[aria-label="Increase volume"]').exists()).toBe(true);
    expect(wrapper.find(".panel-content--music").exists()).toBe(false);

    // Trigger speed dial / open phone
    const speedDial = wrapper.find(".speed-dial-chip");
    await speedDial.trigger("click");
    expect(wrapper.emitted("openPhone")).toHaveLength(1);

    // Flip right panel to Messages/Notifications
    const messagesTab = wrapper.findAll(".home-panel--right .panel-tab-btn")[2];
    await messagesTab.trigger("click");
    expect(wrapper.find(".panel-content--notifications").exists()).toBe(true);

    // Right panel has 3 tabs: music, call, messages
    expect(wrapper.findAll(".home-panel--right .panel-tab-btn")).toHaveLength(3);
    expect(wrapper.find(".panel-content--apps").exists()).toBe(false);
  });

  it("guarantees mutual exclusion between left and right panels", async () => {
    const wrapper = mount(HomeView, {
      props: defaultProps,
      global: { stubs: { MediaPlayer: true, GoogleMap: true, SpeedometerGauge: true } },
    });

    // Left panel must never have volume steppers or media player
    expect(wrapper.find(".home-panel--left .volume-buttons").exists()).toBe(false);
    expect(wrapper.find(".home-panel--left .panel-content--music").exists()).toBe(false);

    // Right panel must never have speedometer or map
    expect(wrapper.find(".home-panel--right .panel-content--speed").exists()).toBe(false);
    expect(wrapper.find(".home-panel--right .panel-content--map").exists()).toBe(false);
  });
});
