import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import QuickControlsDrawer from "../QuickControlsDrawer.vue";

describe("QuickControlsDrawer UI Component", () => {
  it("renders brightness and volume steppers and emits stepped values", async () => {
    const wrapper = mount(QuickControlsDrawer, {
      props: {
        brightness: 70,
        masterVolume: 80,
      },
    });

    const steppers = wrapper.findAll(".stepper-btn");
    // Brightness minus (0), Brightness plus (1), Volume minus (2), Volume plus (3)
    expect(steppers.length).toBe(4);

    // Click Volume Minus
    await steppers[2].trigger("click");
    expect(wrapper.emitted("update:masterVolume")?.[0]).toEqual([75]);

    // Click Volume Plus
    await steppers[3].trigger("click");
    expect(wrapper.emitted("update:masterVolume")?.[1]).toEqual([85]);

    // Click Brightness Minus
    await steppers[0].trigger("click");
    expect(wrapper.emitted("update:brightness")?.[0]).toEqual([65]);

    // Click Brightness Plus
    await steppers[1].trigger("click");
    expect(wrapper.emitted("update:brightness")?.[1]).toEqual([75]);
  });

  it("emits close event on close button click", async () => {
    const wrapper = mount(QuickControlsDrawer, {
      props: {
        brightness: 70,
        masterVolume: 80,
      },
    });

    const closeBtn = wrapper.find(".quick-close");
    await closeBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });
});
