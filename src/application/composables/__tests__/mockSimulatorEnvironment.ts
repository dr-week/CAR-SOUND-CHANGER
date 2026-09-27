import { vi } from "vitest";

export function createMockAudio() {
  const param = () => ({
    value: 0,
    cancelScheduledValues: vi.fn(),
    setTargetAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  });
  function makeNode() {
    return {
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
  }
  class MockAudioContext {
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
    createGain = vi.fn(() => makeNode());
    createOscillator = vi.fn(() => makeNode());
    createBiquadFilter = vi.fn(() => makeNode());
    createBufferSource = vi.fn(() => makeNode());
    createAnalyser = vi.fn(() => makeNode());
    createBuffer = vi.fn(() => ({ getChannelData: () => new Float32Array(100) }));
    createPeriodicWave = vi.fn(() => ({}));
  }
  vi.stubGlobal("AudioContext", MockAudioContext);
}

export function createMockGeolocation() {
  let watchCb: ((pos: any) => void) | null = null;
  const mockWatch = vi.fn((success) => {
    watchCb = success;
    return 10;
  });
  const mockClear = vi.fn();
  vi.stubGlobal("navigator", {
    geolocation: {
      watchPosition: mockWatch,
      clearWatch: mockClear,
    },
    bluetooth: {
      requestDevice: vi.fn(async () => ({
        name: "Blaupunkt BT Headunit",
        gatt: {
          connected: true,
          disconnect: vi.fn(),
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    },
  });
  return {
    emitPosition: (speedKph: number) => {
      if (watchCb) {
        watchCb({
          coords: { latitude: 12.9, longitude: 77.5, speed: speedKph / 3.6 },
          timestamp: Date.now(),
        });
      }
    },
  };
}
