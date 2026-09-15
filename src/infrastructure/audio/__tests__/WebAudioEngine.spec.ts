import { afterEach, describe, expect, it, vi } from "vitest";
import { WebAudioEngine } from "../WebAudioEngine";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";

describe("WebAudioEngine lifecycle", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("starts silently and disconnects every replaced voice", async () => {
    const oscillators: ReturnType<typeof oscillator>[] = [];
    const gains: ReturnType<typeof gain>[] = [];

    function gain() {
      return { gain: { value: 1 }, connect: vi.fn().mockReturnThis(), disconnect: vi.fn() };
    }
    function oscillator() {
      return {
        frequency: { value: 440 },
        type: "sine",
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
      };
    }

    const close = vi.fn();
    vi.stubGlobal(
      "AudioContext",
      class {
        destination = {};
        resume = vi.fn();
        close = close;
        createGain() {
          const node = gain();
          gains.push(node);
          return node;
        }
        createOscillator() {
          const node = oscillator();
          oscillators.push(node);
          return node;
        }
        createBiquadFilter() {
          return {
            type: "",
            Q: { value: 0 },
            frequency: { value: 0 },
            connect: vi.fn().mockReturnThis(),
          };
        }
      },
    );

    const engine = new WebAudioEngine();
    await engine.resume();
    // output gain node is index 0; initial value should be 0
    expect(gains[0].gain.value).toBe(0);

    engine.setProfile(CAR_PROFILES.brezza);
    // First oscillator frequency should reflect Brezza idle RPM
    expect(oscillators[0].frequency.value).toBeCloseTo(800 / 30);

    engine.setProfile(CAR_PROFILES.mustang);
    // First 4 oscillators (Brezza) should be stopped and disconnected
    for (let i = 0; i < 4; i++) {
      expect(oscillators[i].stop).toHaveBeenCalledOnce();
      expect(oscillators[i].disconnect).toHaveBeenCalledOnce();
      expect(gains[i + 1].disconnect).toHaveBeenCalledOnce();
    }

    await engine.dispose();
    expect(close).toHaveBeenCalledOnce();
    expect(oscillators[7].disconnect).toHaveBeenCalledOnce();
  });
});
