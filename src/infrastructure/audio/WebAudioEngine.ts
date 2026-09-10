import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { EngineSoundOutput } from "../../application/ports/EngineSoundOutput";
type Voice = { oscillator: OscillatorNode; harmonic: number };

export class WebAudioEngine implements EngineSoundOutput {
  private context: AudioContext | null = null;
  private voices: Voice[] = [];
  private output: GainNode | null = null;
  async resume(): Promise<void> { if (!this.context) this.createGraph(); await this.context?.resume(); }
  setProfile(profile: VehicleProfile): void {
    void profile;
    if (!this.context || !this.output) return;
    this.voices.forEach(({ oscillator }) => oscillator.stop()); this.voices = [];
    [1, 2, 3].forEach((harmonic, index) => {
      const oscillator = this.context!.createOscillator(); const gain = this.context!.createGain();
      oscillator.type = index === 0 ? "sawtooth" : "square"; gain.gain.value = 1 / (harmonic * 4);
      oscillator.connect(gain).connect(this.output!); oscillator.start(); this.voices.push({ oscillator, harmonic });
    });
  }
  update(state: VehicleState): void {
    if (!this.context || this.context.state !== "running" || !this.output) return;
    const frequency = state.profile.baseTone * (state.rpm / state.profile.idleRpm) * (state.profile.cylinders / 4);
    this.voices.forEach(({ oscillator, harmonic }) => oscillator.frequency.setTargetAtTime(frequency * harmonic, this.context!.currentTime, 0.04));
    this.output.gain.setTargetAtTime(0.025 + state.throttle * 0.11, this.context.currentTime, 0.05);
  }
  private createGraph(): void { this.context = new AudioContext(); this.output = this.context.createGain(); this.output.gain.value = 0.08; this.output.connect(this.context.destination); }
}
