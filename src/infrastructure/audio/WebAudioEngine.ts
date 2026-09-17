import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { EngineSoundOutput } from "../../application/ports/EngineSoundOutput";
import { bodyTimbre, engineSoundParameters, engineTimbre } from "../../domain/audio/engineSound";
import { TurboEnvelope } from "../../domain/audio/TurboEnvelope";
import { combustionTexture } from "../../domain/audio/combustionTexture";
import { fadeToSilence } from "./audioAutomation";

type Voice = { source: OscillatorNode; gain: GainNode };

/** Browser adapter: persistent combustion/body voices plus filtered intake noise. */
export class WebAudioEngine implements EngineSoundOutput {
  private context: AudioContext | null = null;
  private exhaust: Voice | null = null;
  private body: Voice | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private intake: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private master: GainNode | null = null;
  private nodes: AudioNode[] = [];
  private profile: VehicleProfile | null = null;
  private volume = 0.5;
  private previousGear: number | null = null;
  private shiftUntil = 0;
  private readonly turboEnvelope = new TurboEnvelope();
  private turboGain: GainNode | null = null;
  private turboFilter: BiquadFilterNode | null = null;
  private previousUpdate: number | null = null;
  private changeAt: number | null = null;

  get isSupported(): boolean {
    return typeof AudioContext !== "undefined";
  }

  setVolume(value: number): void {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    if (this.context && this.master) this.target(this.master.gain, this.volume * 0.7);
  }

  async resume(): Promise<void> {
    if (!this.isSupported) throw new Error("Web Audio is unavailable.");
    if (!this.context) {
      try { this.createGraph(); }
      catch (error) { await this.dispose(); throw error; }
    }
    const context = this.context!;
    // The next simulation update supplies fresh RPM/load; never replay old gains.
    if (context.state !== "running") {
      for (const gain of [this.exhaust?.gain, this.body?.gain, this.intake, this.turboGain]) {
        if (!gain) continue;
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0, context.currentTime);
      }
      this.previousUpdate = null;
      this.turboEnvelope.reset();
    }
    await context.resume();
    if (this.context !== context || context.state !== "running") throw new Error("Audio did not start. Retry from a user gesture.");
  }

  async suspend(): Promise<void> {
    await this.context?.suspend();
  }

  setProfile(profile: VehicleProfile): void {
    this.profile = profile;
    this.previousGear = null;
    this.shiftUntil = 0;
    this.turboEnvelope.reset();
    this.previousUpdate = null;
    // Choosing a car must not open an AudioContext before the user's audio gesture.
    if (!this.context || !this.exhaust) return;
    // Fade before changing either waveform; apply the latest selection in update.
    const now = this.context.currentTime;
    this.changeAt = now + 0.03;
    for (const gain of [this.exhaust.gain, this.body?.gain, this.intake, this.turboGain]) {
      if (!gain) continue;
      fadeToSilence(gain.gain, now, 0.03);
    }
  }

  update(state: VehicleState): void {
    if (this.profile?.id !== state.profile.id) this.setProfile(state.profile);
    if (
      !this.context ||
      this.context.state !== "running" ||
      !this.exhaust ||
      !this.body ||
      !this.intake ||
      !this.filter
    )
      return;
    const now = this.context.currentTime;
    if (this.changeAt !== null) {
      if (now < this.changeAt) return;
      for (const [voice, harmonics] of [
        [this.exhaust, engineTimbre(state.profile.cylinders)],
        [this.body, bodyTimbre(state.profile.cylinders)],
      ] as const) {
        const coefficients = new Float32Array(harmonics);
        voice.source.setPeriodicWave(
          this.context.createPeriodicWave(new Float32Array(coefficients.length), coefficients),
        );
      }
      // Switch pitch while silent instead of sliding across unrelated engines.
      const initial = engineSoundParameters(state);
      for (const [voice, hz] of [[this.exhaust, initial.firingHz], [this.body, initial.bodyHz]] as const) {
        voice.source.frequency.cancelScheduledValues(now);
        voice.source.frequency.setValueAtTime(hz, now);
      }
      this.changeAt = null;
    }
    if (this.previousGear !== null && state.gear !== this.previousGear) this.shiftUntil = now + 0.12;
    this.previousGear = state.gear;
    const turbo = this.turboEnvelope.update(
      state,
      this.previousUpdate === null ? 0 : now - this.previousUpdate,
      now < this.shiftUntil,
    );
    this.previousUpdate = now;
    const sound = engineSoundParameters(state, now < this.shiftUntil, turbo);
    this.target(this.exhaust.source.frequency, sound.firingHz);
    this.target(this.body.source.frequency, sound.bodyHz);
    const texture = combustionTexture(now, state.profile.cylinders, state.throttle);
    this.target(this.exhaust.gain.gain, sound.exhaustGain * texture);
    this.target(this.body.gain.gain, sound.bodyGain);
    this.target(this.intake.gain, sound.intakeGain);
    this.target(this.filter.frequency, Math.min(sound.cutoffHz, this.context.sampleRate * 0.4));
    if (this.turboGain && this.turboFilter) {
      this.target(this.turboGain.gain, sound.turboGain);
      this.target(this.turboFilter.frequency, sound.turboCutoffHz);
    }
  }

  async dispose(): Promise<void> {
    this.exhaust?.source.stop();
    this.body?.source.stop();
    this.noise?.stop();
    this.nodes.forEach((node) => node.disconnect());
    this.nodes = [];
    const context = this.context;
    this.context = null;
    this.exhaust = this.body = null;
    this.noise = null;
    this.intake = null;
    this.filter = null;
    this.master = null;
    this.turboGain = null;
    this.turboFilter = null;
    this.turboEnvelope.reset();
    this.previousUpdate = null;
    this.changeAt = null;
    await context?.close();
  }

  private target(param: AudioParam, value: number): void {
    const now = this.context!.currentTime;
    param.cancelScheduledValues(now);
    param.setTargetAtTime(value, now, 0.035);
  }

  private createGraph(): void {
    const context = new AudioContext();
    this.context = context;
    const master = context.createGain();
    master.gain.value = this.volume * 0.7;
    this.master = master;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    filter.Q.value = 0.5;
    this.filter = filter;
    filter.connect(master).connect(context.destination);
    this.nodes.push(filter, master);
    const bodyFilter = context.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = 320;
    bodyFilter.Q.value = 0.5;
    bodyFilter.connect(master);
    this.nodes.push(bodyFilter);
    const voice = (destination: AudioNode): Voice => {
      const source = context.createOscillator();
      const gain = context.createGain();
      gain.gain.value = 0;
      source.frequency.value = 30;
      source.connect(gain).connect(destination);
      this.nodes.push(source, gain);
      source.start();
      return { source, gain };
    };
    this.exhaust = voice(filter);
    this.body = voice(bodyFilter);
    // Rounded bass pulses with restrained overtones, rather than a thin tone.
    const bodyHarmonics = new Float32Array([0, 1, 0.45, 0.2, 0.08, 0.025]);
    this.body.source.setPeriodicWave(context.createPeriodicWave(new Float32Array(bodyHarmonics.length), bodyHarmonics));
    const noise = context.createBufferSource();
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let seed = 17;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      samples[i] = seed / 2147483648 - 1;
    }
    noise.buffer = buffer;
    noise.loop = true;
    const intake = context.createGain();
    intake.gain.value = 0;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 180;
    band.Q.value = 0.6;
    noise.connect(band).connect(intake).connect(filter);
    this.noise = noise;
    this.intake = intake;
    this.nodes.push(noise, band, intake);
    // Separate quiet air layer; keep it out of the bass-only exhaust filter.
    const turboFilter = context.createBiquadFilter();
    turboFilter.type = "bandpass";
    turboFilter.frequency.value = 700;
    turboFilter.Q.value = 0.6;
    const turboGain = context.createGain();
    turboGain.gain.value = 0;
    noise.connect(turboFilter).connect(turboGain).connect(master);
    this.turboFilter = turboFilter;
    this.turboGain = turboGain;
    this.nodes.push(turboFilter, turboGain);
    noise.start();
    if (this.profile) this.setProfile(this.profile);
  }
}
