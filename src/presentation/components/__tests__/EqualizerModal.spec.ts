import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import EqualizerModal from "../EqualizerModal.vue";
import { EQUALIZER_PRESETS } from "../../../domain/audio/EqualizerTypes";

describe("EqualizerModal", () => {
  const defaultProps = {
    bands: { ...EQUALIZER_PRESETS.Flat },
    activePreset: "Flat" as const,
    isBypassed: false,
  };

  it("renders 5-band vertical sliders and preset chips", () => {
    const wrapper = mount(EqualizerModal, { props: defaultProps });

    expect(wrapper.text()).toContain("Graphic Equalizer");
    expect(wrapper.text()).toContain("SUB");
    expect(wrapper.text()).toContain("BASS");
    expect(wrapper.text()).toContain("MID");
    expect(wrapper.text()).toContain("PRESENCE");
    expect(wrapper.text()).toContain("AIR");
    expect(wrapper.findAll(".eq-vertical-slider")).toHaveLength(5);
  });

  it("emits launchHardwareDsp when Open Hardware DSP button is clicked", async () => {
    const wrapper = mount(EqualizerModal, { props: defaultProps });
    const dspBtn = wrapper.find(".eq-hardware-dsp-btn");

    expect(dspBtn.exists()).toBe(true);
    await dspBtn.trigger("click");
    expect(wrapper.emitted("launchHardwareDsp")).toHaveLength(1);
  });

  it("emits toggleBypass and close events", async () => {
    const wrapper = mount(EqualizerModal, { props: defaultProps });

    await wrapper.find(".eq-bypass-btn").trigger("click");
    expect(wrapper.emitted("toggleBypass")).toHaveLength(1);

    await wrapper.find(".quick-close").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
