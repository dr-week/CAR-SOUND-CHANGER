import { beforeEach, describe, expect, it, vi } from "vitest";
import { EqualizerService } from "../EqualizerService";

describe("EqualizerService", () => {
  let mockContext: any;
  let filtersCreated: any[];

  beforeEach(() => {
    filtersCreated = [];
    mockContext = {
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { value: 1 },
      })),
      createBiquadFilter: vi.fn(() => {
        const filter = {
          type: "",
          frequency: { value: 0 },
          Q: { value: 1 },
          gain: { value: 0 },
          connect: vi.fn(),
        };
        filtersCreated.push(filter);
        return filter;
      }),
    };
  });

  it("initializes with Flat preset by default and creates 5 BiquadFilterNodes", () => {
    const eq = new EqualizerService(mockContext);
    expect(filtersCreated.length).toBe(5);
    expect(eq.getActivePreset()).toBe("Flat");
    expect(eq.getBands().sub60).toBe(0);
    expect(eq.getBands().treble16k).toBe(0);
  });

  it("applies presets correctly and updates filter gains", () => {
    const eq = new EqualizerService(mockContext);
    eq.setPreset("Bass Boost");
    expect(eq.getActivePreset()).toBe("Bass Boost");
    expect(eq.getBands().sub60).toBe(8);

    // sub filter is the first created
    expect(filtersCreated[0].gain.value).toBe(8);
  });

  it("clamps custom band adjustments to [-12, +12] dB", () => {
    const eq = new EqualizerService(mockContext);
    eq.setBand("sub60", 25);
    expect(eq.getBands().sub60).toBe(12);

    eq.setBand("mid1k", -30);
    expect(eq.getBands().mid1k).toBe(-12);
  });

  it("flattens filter gains when bypassed and restores on un-bypass", () => {
    const eq = new EqualizerService(mockContext);
    eq.setPreset("Rock");
    expect(filtersCreated[0].gain.value).toBe(4);

    eq.setBypass(true);
    expect(eq.getIsBypassed()).toBe(true);
    expect(filtersCreated[0].gain.value).toBe(0);

    eq.setBypass(false);
    expect(filtersCreated[0].gain.value).toBe(4);
  });
});
