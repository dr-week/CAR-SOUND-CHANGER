import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { EngineSoundOutput } from "../../application/ports/EngineSoundOutput";
type Voice = { oscillator: OscillatorNode; gain: GainNode; harmonic: number };

export class WebAudioEngine implements EngineSoundOutput {
  private context: AudioContext | null = null;
  private voices: Voice[] = [];
  private output: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private volume = 0.5;
  private currentProfile: VehicleProfile | null = null;

  setVolume(value: number): void {
    if (Number.isFinite(value)) {
      this.volume = Math.max(0, Math.min(1, value));
      if (this.context && this.output) {
        this.output.gain.setValueAtTime(this.volume * 0.35, this.context.currentTime);
      }
    }
  }

  async suspend(): Promise<void> {
    await this.context?.suspend();
  }

  async dispose(): Promise<void> {
    this.clearVoices();
    await this.context?.close();
    this.context = null;
    this.output = null;
    this.filter = null;
  }

  get isSupported(): boolean {
    return typeof AudioContext !== "undefined";
  }

  async resume(): Promise<void> {
    if (!this.isSupported) throw new Error("Web Audio is not supported by this browser.");
    if (!this.context) {
      this.createGraph();
    }
    if (this.context?.state === "suspended") {
      await this.context.resume();
    }
    if (this.currentProfile) {
      this.setProfile(this.currentProfile);
    }
  }

  setProfile(profile: VehicleProfile): void {
    this.currentProfile = profile;
    if (!this.context) {
      this.createGraph();
    }
    if (!this.context || !this.output) return;

    this.clearVoices();
    [1, 2, 4, 6].forEach((harmonic, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();

      oscillator.type = index === 0 ? "sawtooth" : index === 1 ? "triangle" : index === 2 ? "sawtooth" : "sine";
      
      // Scale base frequency so idle fundamental is in audible range (~90Hz) across all speakers
      const baseFreq = (profile.idleRpm / 60) * (profile.cylinders / 2) * (profile.baseTone / 58) * 3.5;
      oscillator.frequency.value = Math.max(40, baseFreq * harmonic);

      const harmonicVolume = index === 0 ? 0.50 : index === 1 ? 0.35 : index === 2 ? 0.20 : 0.10;
      gain.gain.value = harmonicVolume;

      oscillator.connect(gain).connect(this.output!);
      oscillator.start();
      this.voices.push({ oscillator, gain, harmonic });
    });
  }

  update(state: VehicleState): void {
    if (!this.currentProfile) {
      this.currentProfile = state.profile;
    }
    if (!this.context || this.context.state !== "running") {
      return;
    }
    if (this.voices.length === 0 && this.currentProfile) {
      this.setProfile(this.currentProfile);
    }
    if (!this.output || this.voices.length === 0) return;

    // Firing frequency scaled into rich audible engine roar spectrum (90Hz - 3500Hz)
    const firingFrequency = (state.rpm / 60) * (state.profile.cylinders / 2) * 3.5;
    const profilePitch = state.profile.baseTone / 58;
    const frequency = Math.max(40, firingFrequency * profilePitch);

    const now = this.context.currentTime;
    this.voices.forEach(({ oscillator, harmonic }) => {
      oscillator.frequency.setTargetAtTime(frequency * harmonic, now, 0.03);
    });

    const targetGain = (0.30 + state.throttle * 0.60) * this.volume;
    this.output.gain.setTargetAtTime(targetGain, now, 0.04);

    const cutoff = 600 + normalizedRpm(state) * 2800 + state.throttle * 900;
    this.filter?.frequency.setTargetAtTime(cutoff, now, 0.04);
  }

  private clearVoices(): void {
    this.voices.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
        oscillator.disconnect();
        gain.disconnect();
      } catch {
        // Safe disposal
      }
    });
    this.voices = [];
  }

  private createGraph(): void {
    try {
      const AudioCtx = typeof AudioContext !== "undefined"
        ? AudioContext
        : (globalThis as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioCtx();
      this.output = this.context.createGain();
      this.filter = this.context.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.Q.value = 1.2;
      this.filter.frequency.value = 650;
      this.output.gain.value = 0;
      this.output.connect(this.filter).connect(this.context.destination);
    } catch {
      // Non-browser or unsupported environment fallback
    }
  }
}

function normalizedRpm(state: VehicleState): number {
  return Math.min(1, Math.max(0, state.rpm / state.profile.redlineRpm));
}
