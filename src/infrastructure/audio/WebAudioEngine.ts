import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { EngineSoundOutput } from "../../application/ports/EngineSoundOutput";
type Voice = { oscillator: OscillatorNode; gain: GainNode; harmonic: number };

export class WebAudioEngine implements EngineSoundOutput {
  private context: AudioContext | null = null;
  private voices: Voice[] = [];
  private output: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private volume = 0.5;
  setVolume(value: number): void {
    if (Number.isFinite(value)) this.volume = Math.max(0, Math.min(1, value));
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
    if (!this.context) this.createGraph();
    await this.context?.resume();
  }
  setProfile(profile: VehicleProfile): void {
    if (!this.context || !this.output) return;
    this.clearVoices();
    [1, 2, 4, 6].forEach((harmonic, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      oscillator.type = index === 0 ? "triangle" : "sine";
      oscillator.frequency.value =
        Math.max(18, (profile.idleRpm / 60) * (profile.cylinders / 2) * (profile.baseTone / 58)) * harmonic;
      gain.gain.value = index === 0 ? 0.42 : index === 1 ? 0.24 : index === 2 ? 0.11 : 0.05;
      oscillator.connect(gain).connect(this.output!);
      oscillator.start();
      this.voices.push({ oscillator, gain, harmonic });
    });
  }
  update(state: VehicleState): void {
    if (!this.context || this.context.state !== "running" || !this.output) return;
    const firingFrequency = (state.rpm / 60) * (state.profile.cylinders / 2);
    const profilePitch = state.profile.baseTone / 58;
    const frequency = Math.max(18, firingFrequency * profilePitch);
    this.voices.forEach(({ oscillator, harmonic }) =>
      oscillator.frequency.setTargetAtTime(frequency * harmonic, this.context!.currentTime, 0.04),
    );
    this.output.gain.setTargetAtTime((0.18 + state.throttle * 0.12) * this.volume, this.context.currentTime, 0.05);
    this.filter?.frequency.setTargetAtTime(650 + normalizedRpm(state) * 1_200, this.context.currentTime, 0.08);
  }
  private clearVoices(): void {
    this.voices.forEach(({ oscillator, gain }) => {
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
    });
    this.voices = [];
  }
  private createGraph(): void {
    this.context = new AudioContext();
    this.output = this.context.createGain();
    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 0.7;
    this.filter.frequency.value = 700;
    this.output.gain.value = 0;
    this.output.connect(this.filter).connect(this.context.destination);
  }
}

function normalizedRpm(state: VehicleState): number {
  return Math.min(1, Math.max(0, state.rpm / state.profile.redlineRpm));
}
