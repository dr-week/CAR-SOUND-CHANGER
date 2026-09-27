import type { VehicleProfile, VehicleState } from "../../domain/vehicle/types";
import type { EngineSoundOutput } from "../../application/ports/EngineSoundOutput";
import { bodyTimbre, engineSoundParameters, engineTimbre } from "../../domain/audio/engineSound";
import { TurboEnvelope } from "../../domain/audio/TurboEnvelope";
import { combustionTexture } from "../../domain/audio/combustionTexture";
import { fadeToSilence } from "./audioAutomation";
import { buildAudioGraph, type Voice } from "./WebAudioGraphBuilder";
import { disposeAudioGraph } from "./WebAudioDisposer";
import { applyPeriodicWaveform } from "./WebAudioWaveform";
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
  private analyser: AnalyserNode | null = null;
  private previousUpdate: number | null = null;
  private changeAt: number | null = null;
  private targets = new WeakMap<AudioParam, number>();
  get isSupported(): boolean {
    return typeof AudioContext !== "undefined";
  }
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.context || this.context.state !== "running") return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
  setVolume(value: number): void {
    if (!Number.isFinite(value)) return;
    this.volume = Math.max(0, Math.min(1, value));
    if (this.context && this.master) this.target(this.master.gain, this.volume * 0.7);
  }
  async resume(): Promise<void> {
    if (!this.isSupported) throw new Error("Web Audio is unavailable.");
    if (!this.context) {
      try {
        this.createGraph();
      } catch (error) {
        await this.dispose();
        throw error;
      }
    }
    const context = this.context!;
    // The next simulation update supplies fresh RPM/load; never replay old gains.
    if (context.state !== "running") {
      this.targets = new WeakMap();
      this.previousGear = null;
      this.shiftUntil = 0;
      for (const gain of [this.exhaust?.gain, this.body?.gain, this.intake, this.turboGain]) {
        if (!gain) continue;
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0, context.currentTime);
      }
      this.previousUpdate = null;
      this.turboEnvelope.reset();
    }
    await context.resume();
    if (this.context !== context || context.state !== "running")
      throw new Error("Audio did not start. Retry from a user gesture.");
  }
  async suspend(): Promise<void> {
    await this.context?.suspend();
  }
  setProfile(profile: VehicleProfile): void {
    this.targets = new WeakMap();
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
      applyPeriodicWaveform(this.context, this.exhaust, this.body, state, now);
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
    const ctx = this.context;
    await disposeAudioGraph(ctx, this.exhaust, this.body, this.noise, this.nodes);
    this.nodes = [];
    this.context = null;
    this.exhaust = this.body = null;
    this.noise = null;
    this.intake = null;
    this.filter = null;
    this.master = null;
    this.turboGain = null;
    this.turboFilter = null;
    this.analyser = null;
    this.turboEnvelope.reset();
    this.previousUpdate = null;
    this.changeAt = null;
    this.targets = new WeakMap();
  }
  private target(param: AudioParam, value: number): void {
    if (this.targets.get(param) === value) return;
    this.targets.set(param, value);
    const now = this.context!.currentTime;
    param.setTargetAtTime(value, now, 0.035);
  }
  private createGraph(): void {
    const graph = buildAudioGraph(
      this.volume,
      (ctx) => {
        this.context = ctx;
      },
      (node) => {
        this.nodes.push(node);
      },
    );
    this.master = graph.master;
    this.analyser = graph.analyser;
    this.filter = graph.filter;
    this.exhaust = graph.exhaust;
    this.body = graph.body;
    this.noise = graph.noise;
    this.intake = graph.intake;
    this.turboFilter = graph.turboFilter;
    this.turboGain = graph.turboGain;
    this.nodes = graph.nodes;
    if (this.profile) this.setProfile(this.profile);
  }
}
