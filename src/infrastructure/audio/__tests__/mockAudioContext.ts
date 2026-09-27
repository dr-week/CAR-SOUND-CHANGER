import { vi } from "vitest";

export function mockAudio(failBuffer = false) {
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
      fftSize: 64,
      frequencyBinCount: 32,
      getByteFrequencyData: vi.fn(),
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
    createAnalyser = node;
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
