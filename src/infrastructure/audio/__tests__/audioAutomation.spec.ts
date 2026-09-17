import { describe, expect, it, vi } from "vitest";
import { fadeToSilence } from "../audioAutomation";

describe("audio fade automation", () => {
  it("captures the current value before cancellation in the fallback", () => {
    const param = {
      value: 0.4,
      cancelScheduledValues: vi.fn(() => {
        param.value = 1;
      }),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    };
    fadeToSilence(param as unknown as AudioParam, 2, 0.03);
    expect(param.setValueAtTime).toHaveBeenCalledWith(0.4, 2);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2.03);
  });
  it("holds in-flight automation when supported", () => {
    const param = { value: 0.4, cancelAndHoldAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() };
    fadeToSilence(param as unknown as AudioParam, 1, 0.03);
    expect(param.cancelAndHoldAtTime).toHaveBeenCalledWith(1);
  });
});
