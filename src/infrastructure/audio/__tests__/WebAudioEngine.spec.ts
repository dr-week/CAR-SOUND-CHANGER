import { afterEach, describe, expect, it, vi } from "vitest";
import { WebAudioEngine } from "../WebAudioEngine";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";
import { createVehicleState } from "../../../domain/vehicle/vehiclePhysics";

function mockAudio() {
  const param = () => ({
    value: 0,
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  });
  function makeNode() {
    const value = {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      gain: param(),
      frequency: param(),
      Q: param(),
      setPeriodicWave: vi.fn(),
      buffer: null,
      loop: false,
      type: "",
    };
    return value;
  }
  const nodes: ReturnType<typeof makeNode>[] = [];
  function node() {
    const value = makeNode();
    nodes.push(value);
    return value;
  }
  class Context {
    state = "suspended";
    currentTime = 0;
    sampleRate = 44100;
    destination = {};
    resume = vi.fn(async () => {
      this.state = "running";
    });
    suspend = vi.fn(async () => {
      this.state = "suspended";
    });
    close = vi.fn(async () => {
      this.state = "closed";
    });
    createGain = node;
    createBiquadFilter = node;
    createOscillator = node;
    createBufferSource = node;
    createPeriodicWave = vi.fn(() => ({}));
    createBuffer = vi.fn(() => ({ getChannelData: () => new Float32Array(100) }));
  }
  const instances: Context[] = [];
  vi.stubGlobal(
    "AudioContext",
    class extends Context {
      constructor() {
        super();
        instances.push(this);
      }
    },
  );
  return { nodes, instances };
}

describe("Web Audio lifecycle", () => {
  it("fades profile changes before applying new waveforms", async () => {
    const { nodes, instances } = mockAudio();
    const engine = new WebAudioEngine();
    await engine.resume();
    const state = createVehicleState(CAR_PROFILES.supra);
    engine.setProfile(state.profile);
    const initial = instances[0].createPeriodicWave.mock.calls.length;
    engine.update(state);
    expect(instances[0].createPeriodicWave).toHaveBeenCalledTimes(initial);
    expect(nodes.some((node) => node.gain.linearRampToValueAtTime.mock.calls.length > 0)).toBe(true);
    instances[0].currentTime = 0.04;
    engine.update(state);
    expect(instances[0].createPeriodicWave).toHaveBeenCalledTimes(initial + 2);
    await engine.dispose();
  });
  afterEach(() => vi.unstubAllGlobals());
  it("does not create audio on profile selection, and reuses sources on profile changes", async () => {
    const { nodes, instances } = mockAudio();
    const engine = new WebAudioEngine();
    engine.setProfile(CAR_PROFILES.brezza);
    expect(instances).toHaveLength(0);
    await engine.resume();
    const count = nodes.length;
    engine.setProfile(CAR_PROFILES.mustang);
    engine.update(createVehicleState(CAR_PROFILES.mustang));
    expect(nodes).toHaveLength(count);
    expect(nodes.filter((n) => n.start.mock.calls.length)).toHaveLength(3);
    await engine.suspend();
    await engine.resume();
    expect(nodes).toHaveLength(count);
    await engine.dispose();
    nodes.forEach((n) => expect(n.disconnect).toHaveBeenCalledOnce());
    expect(instances[0].close).toHaveBeenCalledOnce();
    await engine.dispose();
  });
  it("keeps zero volume muted during updates and reports startup failure", async () => {
    const { nodes, instances } = mockAudio();
    const engine = new WebAudioEngine();
    engine.setVolume(0);
    await engine.resume();
    expect(nodes[0].gain.value).toBe(0);
    engine.update(createVehicleState(CAR_PROFILES.brezza));
    expect(nodes[0].gain.setTargetAtTime).not.toHaveBeenCalled();
    instances[0].resume.mockRejectedValueOnce(new Error("blocked"));
    await expect(engine.resume()).rejects.toThrow("blocked");
    await engine.dispose();
  });
});
