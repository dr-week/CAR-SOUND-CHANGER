import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SettingsView from "../SettingsView.vue";

describe("SettingsView", () => {
  const defaultProps = {
    brightness: 70,
    uiScale: 110,
    bluetoothName: "OnePlus 12",
    bluetoothStatus: "connected",
    muteOnReverse: true,
    defaultNavApp: "internal",
    defaultMusicApp: "internal",
    installedApps: [
      { label: "Google Maps", packageName: "com.google.android.apps.maps", icon: "car", category: "navigation" as const },
      { label: "Spotify", packageName: "com.spotify.music", icon: "equalizer", category: "media" as const },
    ],
  };

  it("renders display, reverse safety, default apps, and bluetooth sections", () => {
    const wrapper = mount(SettingsView, { props: defaultProps });

    expect(wrapper.text()).toContain("Display preference");
    expect(wrapper.text()).toContain("Reverse gear audio attenuation");
    expect(wrapper.text()).toContain("Default navigation");
    expect(wrapper.text()).toContain("Default music app");
    expect(wrapper.text()).toContain("OnePlus 12");
  });

  it("emits update:muteOnReverse on toggle click", async () => {
    const wrapper = mount(SettingsView, { props: defaultProps });
    const toggleBtn = wrapper.find(".toggle-switch-btn");

    await toggleBtn.trigger("click");
    expect(wrapper.emitted("update:muteOnReverse")?.[0]).toEqual([false]);
  });

  it("emits openHardwareDsp, openBluetoothMusic, openPhone, and openSystemSettings on button clicks", async () => {
    const wrapper = mount(SettingsView, { props: defaultProps });

    await wrapper.find(".dsp-settings-btn").trigger("click");
    expect(wrapper.emitted("openHardwareDsp")).toHaveLength(1);

    await wrapper.find(".bt-music-settings-btn").trigger("click");
    expect(wrapper.emitted("openBluetoothMusic")).toHaveLength(1);

    await wrapper.find(".phone-settings-btn").trigger("click");
    expect(wrapper.emitted("openPhone")).toHaveLength(1);

    await wrapper.find(".system-settings-btn").trigger("click");
    expect(wrapper.emitted("openSystemSettings")).toHaveLength(1);
  });

  it("emits update:themeId when a theme chip is clicked", async () => {
    const wrapper = mount(SettingsView, { props: defaultProps });
    const chips = wrapper.findAll(".theme-chip");
    expect(chips.length).toBeGreaterThanOrEqual(5);

    await chips[1].trigger("click");
    expect(wrapper.emitted("update:themeId")?.[0]).toEqual(["highway-heritage"]);
  });
});
