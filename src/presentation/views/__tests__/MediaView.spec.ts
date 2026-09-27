import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MediaView from "../MediaView.vue";

describe("MediaView", () => {
  it("renders media header controls and equalizer button", async () => {
    const wrapper = mount(MediaView, {
      props: {
        playing: true,
        audioSource: "FM Radio",
      },
    });

    expect(wrapper.text()).toContain("Media Studio");
    expect(wrapper.find(".media-eq-btn").exists()).toBe(true);
    expect(wrapper.find(".media-bt-music-btn").exists()).toBe(false);

    await wrapper.find(".media-eq-btn").trigger("click");
    expect(wrapper.emitted("openEqualizer")).toHaveLength(1);
  });

  it("renders BT Music button when Bluetooth source is active and emits launchBluetoothMusic", async () => {
    const wrapper = mount(MediaView, {
      props: {
        playing: true,
        audioSource: "Bluetooth",
      },
    });

    const btMusicBtn = wrapper.find(".media-bt-music-btn");
    expect(btMusicBtn.exists()).toBe(true);

    await btMusicBtn.trigger("click");
    expect(wrapper.emitted("launchBluetoothMusic")).toHaveLength(1);
  });
});
