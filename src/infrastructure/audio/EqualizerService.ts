import {
  type EqualizerBands,
  type EqualizerPresetName,
  EQUALIZER_PRESETS,
} from "../../domain/audio/EqualizerTypes";

export class EqualizerService {
  private context: AudioContext | null = null;
  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private bands: EqualizerBands = { ...EQUALIZER_PRESETS.Flat };
  private activePreset: EqualizerPresetName = "Flat";
  private isBypassed = false;

  private filterSub: BiquadFilterNode | null = null;
  private filterBass: BiquadFilterNode | null = null;
  private filterMid: BiquadFilterNode | null = null;
  private filterPresence: BiquadFilterNode | null = null;
  private filterTreble: BiquadFilterNode | null = null;

  constructor(context?: AudioContext) {
    if (context) {
      this.attachContext(context);
    }
  }

  public attachContext(context: AudioContext): void {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();

    // 60 Hz: Lowshelf
    this.filterSub = context.createBiquadFilter();
    this.filterSub.type = "lowshelf";
    this.filterSub.frequency.value = 60;

    // 250 Hz: Peaking
    this.filterBass = context.createBiquadFilter();
    this.filterBass.type = "peaking";
    this.filterBass.frequency.value = 250;
    this.filterBass.Q.value = 1.0;

    // 1000 Hz: Peaking
    this.filterMid = context.createBiquadFilter();
    this.filterMid.type = "peaking";
    this.filterMid.frequency.value = 1000;
    this.filterMid.Q.value = 1.0;

    // 4000 Hz: Peaking
    this.filterPresence = context.createBiquadFilter();
    this.filterPresence.type = "peaking";
    this.filterPresence.frequency.value = 4000;
    this.filterPresence.Q.value = 1.0;

    // 16000 Hz: Highshelf
    this.filterTreble = context.createBiquadFilter();
    this.filterTreble.type = "highshelf";
    this.filterTreble.frequency.value = 16000;

    // Chain: input -> sub -> bass -> mid -> presence -> treble -> output
    this.inputNode.connect(this.filterSub);
    this.filterSub.connect(this.filterBass);
    this.filterBass.connect(this.filterMid);
    this.filterMid.connect(this.filterPresence);
    this.filterPresence.connect(this.filterTreble);
    this.filterTreble.connect(this.outputNode);

    this.applyBands();
  }

  public getInputNode(): GainNode | null {
    return this.inputNode;
  }

  public getOutputNode(): GainNode | null {
    return this.outputNode;
  }

  public getBands(): EqualizerBands {
    return { ...this.bands };
  }

  public getActivePreset(): EqualizerPresetName {
    return this.activePreset;
  }

  public getIsBypassed(): boolean {
    return this.isBypassed;
  }

  public setBand(band: keyof EqualizerBands, gainDb: number): void {
    const clampedGain = Math.max(-12, Math.min(12, gainDb));
    this.bands[band] = clampedGain;
    this.applyBands();
  }

  public setPreset(preset: EqualizerPresetName): void {
    const values = EQUALIZER_PRESETS[preset];
    if (values) {
      this.bands = { ...values };
      this.activePreset = preset;
      this.applyBands();
    }
  }

  public setBypass(bypassed: boolean): void {
    this.isBypassed = bypassed;
    this.applyBands();
  }

  private applyBands(): void {
    if (!this.filterSub || !this.filterBass || !this.filterMid || !this.filterPresence || !this.filterTreble) {
      return;
    }

    const sub = this.isBypassed ? 0 : this.bands.sub60;
    const bass = this.isBypassed ? 0 : this.bands.bass250;
    const mid = this.isBypassed ? 0 : this.bands.mid1k;
    const presence = this.isBypassed ? 0 : this.bands.presence4k;
    const treble = this.isBypassed ? 0 : this.bands.treble16k;

    this.filterSub.gain.value = sub;
    this.filterBass.gain.value = bass;
    this.filterMid.gain.value = mid;
    this.filterPresence.gain.value = presence;
    this.filterTreble.gain.value = treble;
  }
}
