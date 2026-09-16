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
    [1, 2, 3, 4].forEach((harmonic, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();

      // Rich engine timbres: Sawtooth for cylinder pulses, Triangle for intake rumble, Sine for bass
      oscillator.type = index === 0 ? "sawtooth" : index === 1 ? "triangle" : index === 2 ? "sawtooth" : "sine";
      
      // Fundamental firing frequency: (RPM / 60) * (cylinders / 2)
      const baseFreq = (profile.idleRpm / 60) * (profile.cylinders / 2) * (profile.baseTone / 58);
      oscillator.frequency.value = Math.max(20, baseFreq * harmonic);

      const harmonicVolume = index === 0 ? 0.60 : index === 1 ? 0.35 : index === 2 ? 0.20 : 0.12;
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

    // Authentic engine firing frequency spectrum (25Hz - 800Hz)
    const firingFrequency = (state.rpm / 60) * (state.profile.cylinders / 2);
    const profilePitch = state.profile.baseTone / 58;
    const frequency = Math.max(20, firingFrequency * profilePitch);

    const now = this.context.currentTime;
    this.voices.forEach(({ oscillator, harmonic }) => {
      oscillator.frequency.setTargetAtTime(frequency * harmonic, now, 0.03);
    });

    const targetGain = (0.35 + state.throttle * 0.55) * this.volume;
    this.output.gain.setTargetAtTime(targetGain, now, 0.04);

    // Warm low-pass acoustic filter (250Hz - 1800Hz) to eliminate piercing high pitches
    const cutoff = 250 + normalizedRpm(state) * 1200 + state.throttle * 500;
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
