import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import MediaPlayer from "../MediaPlayer.vue";

describe("MediaPlayer UI Component", () => {
  it("renders compact mode for Home dashboard", async () => {
    const wrapper = mount(MediaPlayer, {
      props: {
        variant: "compact",
        playing: true,
        audioSource: "Bluetooth",
      },
    });

    expect(wrapper.find(".media-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Midnight City");
    expect(wrapper.text()).toContain("M83");

    // Click play/pause button
    const playBtn = wrapper.find(".play");
    await playBtn.trigger("click");
    expect(wrapper.emitted("update:playing")?.[0]).toEqual([false]);

    // Click next track
    const controls = wrapper.findAll(".controls button");
    // Next track is the 3rd button
    await controls[2].trigger("click");
    expect(wrapper.text()).toContain("Nightcall");
  });

  it("renders studio mode with interactive queue for Media page", async () => {
    const wrapper = mount(MediaPlayer, {
      props: {
        variant: "studio",
        playing: true,
        audioSource: "FM Radio",
      },
    });

    expect(wrapper.find(".media-studio").exists()).toBe(true);
    expect(wrapper.find(".studio-queue").exists()).toBe(true);
    expect(wrapper.text()).toContain("FM RADIO · LOCAL PREVIEW");

    // Select track from queue
    const queueItems = wrapper.findAll(".queue-item");
    expect(queueItems.length).toBeGreaterThanOrEqual(3);

    await queueItems[2].trigger("click");
    expect(wrapper.text()).toContain("Genesis");
  });

  it("renders music-system-first launcher hero variant for Home screen", async () => {
    const wrapper = mount(MediaPlayer, {
      props: {
        variant: "launcher",
        playing: true,
        audioSource: "Bluetooth",
      },
    });

    expect(wrapper.find(".launcher-media").exists()).toBe(true);
    expect(wrapper.find(".vinyl-disc--spinning").exists()).toBe(true);
    expect(wrapper.find(".hires-badge").exists()).toBe(false);
    expect(wrapper.text()).toContain("Midnight City");
    expect(wrapper.text()).toContain("M83");
    expect(wrapper.text()).toContain("Media preview");
    // Hidden legacy controls must be absent, not merely hidden by CSS.
    expect(wrapper.findAll("button")).toHaveLength(3);
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);

    // Test play/pause toggle
    const playBtn = wrapper.find(".launcher-btn-play");
    await playBtn.trigger("click");
    expect(wrapper.emitted("update:playing")?.[0]).toEqual([false]);

    // Test skip track
    const nextBtn = wrapper.find(".launcher-btn-next");
    await nextBtn.trigger("click");
    expect(wrapper.text()).toContain("Nightcall");
  });

  it("supports keyboard scrubber seeking with arrow keys, Home, and End", async () => {
    const wrapper = mount(MediaPlayer, {
      props: {
        variant: "studio",
        playing: true,
        audioSource: "Bluetooth",
      },
    });

    const scrubber = wrapper.find('.scrubber-wrap[role="slider"]');
    expect(scrubber.exists()).toBe(true);

    // Initial position is 42s
    expect(scrubber.attributes("aria-valuenow")).toBe("42");

    // Press ArrowRight to seek +5s
    await scrubber.trigger("keydown", { key: "ArrowRight" });
    expect(scrubber.attributes("aria-valuenow")).toBe("47");

    // Press ArrowLeft to seek -5s
    await scrubber.trigger("keydown", { key: "ArrowLeft" });
    expect(scrubber.attributes("aria-valuenow")).toBe("42");

    // Press Home to seek to start (0)
    await scrubber.trigger("keydown", { key: "Home" });
    expect(scrubber.attributes("aria-valuenow")).toBe("0");

    // Press End to seek to duration (243)
    await scrubber.trigger("keydown", { key: "End" });
    expect(scrubber.attributes("aria-valuenow")).toBe("243");
  });
});
