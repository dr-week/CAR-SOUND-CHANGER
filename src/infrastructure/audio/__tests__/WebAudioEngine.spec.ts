import { afterEach, describe, expect, it, vi } from "vitest";
import { WebAudioEngine } from "../WebAudioEngine";
import { CAR_PROFILES } from "../../../domain/vehicle/carProfiles";
import { createVehicleState } from "../../../domain/vehicle/vehiclePhysics";

function mockAudio(failBuffer = false) {
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
    createBuffer = vi.fn(() => {
      if (failBuffer) {
        failBuffer = false;
        throw new Error("buffer allocation failed");
      }
      return { getChannelData: () => new Float32Array(100) };
    });
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
  it("does not reschedule unchanged pitch each frame, but reapplies it after resume", async () => {
    const { nodes, instances } = mockAudio();
    const engine = new WebAudioEngine();
    await engine.resume();
    const state = createVehicleState(CAR_PROFILES.brezza);
    engine.update(state);
    instances[0].currentTime = 0.04;
    engine.update(state);
    const count = nodes.reduce((sum, node) => sum + node.frequency.setTargetAtTime.mock.calls.length, 0);
    instances[0].currentTime = 0.06;
    engine.update(state);
    expect(nodes.reduce((sum, node) => sum + node.frequency.setTargetAtTime.mock.calls.length, 0)).toBe(count);
    await engine.suspend();
    await engine.resume();
    engine.update(state);
    expect(nodes.reduce((sum, node) => sum + node.frequency.setTargetAtTime.mock.calls.length, 0)).toBeGreaterThan(
      count,
    );
    await engine.dispose();
  });
  it("rolls back a failed graph and permits a clean retry", async () => {
    const { instances, nodes } = mockAudio(true);
    const engine = new WebAudioEngine();
    await expect(engine.resume()).rejects.toThrow("buffer allocation failed");
    expect(instances[0].close).toHaveBeenCalledOnce();
    // A buffer source allocated before the failure is unconnected; context.close releases it.
    nodes.filter((n) => n.connect.mock.calls.length > 0).forEach((n) => expect(n.disconnect).toHaveBeenCalled());
    await engine.resume();
    expect(instances).toHaveLength(2);
    await engine.dispose();
  });
  it("handles disposal while resume is awaiting browser permission", async () => {
    const { instances } = mockAudio();
    const engine = new WebAudioEngine();
    await engine.resume();
    await engine.suspend();
    let finish!: () => void;
    instances[0].resume.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const pending = engine.resume();
    await engine.dispose();
    finish();
    await expect(pending).rejects.toThrow("Audio did not start");
  });
  it("silences stale gains before resuming and filters bass independently", async () => {
    const { instances, nodes } = mockAudio();
    const engine = new WebAudioEngine();
    await engine.resume();
    await engine.suspend();
    nodes.forEach((n) => n.gain.setValueAtTime.mockClear());
    await engine.resume();
    expect(nodes.filter((n) => n.gain.setValueAtTime.mock.calls.length > 0)).toHaveLength(4);
    expect(nodes.filter((n) => n.type === "lowpass").map((n) => n.frequency.value)).toEqual([280, 320]);
    expect(instances).toHaveLength(1);
    await engine.dispose();
  });
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
    expect(nodes.some((n) => n.frequency.setValueAtTime.mock.calls.some(([hz]) => hz === 40))).toBe(true);
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
