import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SwipeSurface from "../home/SwipeSurface.vue";

describe("Widget swipe isolation", () => {
  it("switches on horizontal gestures, not taps or vertical travel", async () => {
    const view = mount(SwipeSurface);
    const pointer = { isPrimary: true, button: 0, pointerId: 1 };
    await view.trigger("pointerdown", { ...pointer, clientX: 150, clientY: 50 });
    await view.trigger("pointerup", { ...pointer, clientX: 50, clientY: 55 });
    expect(view.emitted("swipe")).toEqual([[1]]);
    await view.trigger("pointerdown", { ...pointer, clientX: 150, clientY: 50 });
    await view.trigger("pointerup", { ...pointer, clientX: 145, clientY: 150 });
    expect(view.emitted("swipe")).toHaveLength(1);
  });
  it("leaves embedded control gestures alone", async () => {
    const view = mount(SwipeSurface, { slots: { default: '<button>Play</button>' } });
    const pointer = { isPrimary: true, button: 0, pointerId: 1 };
    await view.get("button").trigger("pointerdown", { ...pointer, clientX: 150, clientY: 50 });
    await view.trigger("pointerup", { ...pointer, clientX: 0, clientY: 50 });
    expect(view.emitted("swipe")).toBeUndefined();
  });
});
