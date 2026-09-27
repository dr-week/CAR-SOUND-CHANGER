/**
 * SonicPairingEmitter
 *
 * Emits an inaudible ultrasonic chirp (19.2 kHz - 20.0 kHz) through car speakers
 * using the Web Audio API. Encodes the car receiver's network IP so the companion
 * mobile phone can pair with zero typing, zero camera scanning, and zero Bluetooth.
 */
export class SonicPairingEmitter {
  private ctx: AudioContext | null = null;
  private isEmitting = false;

  private static readonly FREQ_SPACE = 19200; // 19.2 kHz (Bit 0)
  private static readonly FREQ_MARK = 20000;  // 20.0 kHz (Bit 1)
  private static readonly BIT_DURATION = 0.05; // 50ms per bit

  constructor() {
    // AudioContext will be initialized upon user gesture or launch
  }

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Emits an inaudible ultrasonic chirp encoding the last octet of the IP (or token).
   * E.g. for 192.168.0.111, encodes 111 (8 bits) preceded by a 100ms sync tone.
   */
  async emitChirp(ipLastOctet = 111): Promise<void> {
    if (this.isEmitting) return;
    this.isEmitting = true;

    try {
      const ctx = this.initContext();
      let startTime = ctx.currentTime + 0.05;

      // 1. Sync Tone: 100ms at Mark frequency
      this.playTone(ctx, SonicPairingEmitter.FREQ_MARK, startTime, 0.1);
      startTime += 0.12;

      // 2. FSK Data Bits (8 bits)
      for (let i = 7; i >= 0; i--) {
        const bit = (ipLastOctet >> i) & 1;
        const freq = bit === 1 ? SonicPairingEmitter.FREQ_MARK : SonicPairingEmitter.FREQ_SPACE;
        this.playTone(ctx, freq, startTime, SonicPairingEmitter.BIT_DURATION);
        startTime += SonicPairingEmitter.BIT_DURATION + 0.005;
      }
    } finally {
      setTimeout(() => {
        this.isEmitting = false;
      }, 1000);
    }
  }

  private playTone(ctx: AudioContext, frequency: number, start: number, duration: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, start);

    // Smooth envelope to prevent audible clicks at start/end
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.005); // Low gain, inaudible
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.01);
  }
}

export const sonicPairing = new SonicPairingEmitter();
