import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HomeShortcuts from "../home/HomeShortcuts.vue";

describe("Persistent audio tray", () => {
  it("contains audio actions only", () => {
    const view = mount(HomeShortcuts, { props: { volume: 65 } });
    expect(view.findAll("button")).toHaveLength(3);
    expect(view.text()).not.toMatch(/Navigate|Phone/);
  });
  it("restores the previous audible value after mute", async () => {
    const view = mount(HomeShortcuts, { props: { volume: 65 } });
    await view.get('[aria-label="Mute volume"]').trigger("click");
    expect(view.emitted("volume")?.[0]).toEqual([0]);
    await view.setProps({ volume: 0 });
    await view.get('[aria-label="Restore volume"]').trigger("click");
    expect(view.emitted("volume")?.[1]).toEqual([65]);
  });
  it("disables steps at their respective limits", async () => {
    const view = mount(HomeShortcuts, { props: { volume: 0 } });
    expect(view.get('[aria-label="Decrease volume"]').attributes("disabled")).toBeDefined();
    await view.setProps({ volume: 100 });
    expect(view.get('[aria-label="Increase volume"]').attributes("disabled")).toBeDefined();
  });
});
