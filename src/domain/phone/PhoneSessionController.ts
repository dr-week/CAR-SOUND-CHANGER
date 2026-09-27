/**
 * PhoneSessionController
 *
 * Domain controller for managing connected phone call states,
 * incoming call alerts, live call timers, and automotive audio focus ducking.
 */
import type { ActiveCallState } from "../../presentation/views/home/callTypes";

export interface PhoneSessionEvents {
  onCallStateChanged?: (call: ActiveCallState | null) => void;
  onAudioFocusChanged?: (isDucked: boolean, isPaused: boolean) => void;
}

export class PhoneSessionController {
  private call: ActiveCallState | null = null;
  private timer: number | undefined;

  constructor(private readonly events: PhoneSessionEvents = {}) {}

  public get currentCall(): ActiveCallState | null {
    return this.call;
  }

  public get isRinging(): boolean {
    return this.call !== null && this.call.isIncoming;
  }

  public get isInCall(): boolean {
    return this.call !== null && !this.call.isIncoming;
  }

  public startIncomingCall(callerName: string, callerNumber: string): void {
    this.stopTimer();
    this.call = {
      callerName: callerName.trim() || "Unknown Caller",
      callerNumber: callerNumber.trim() || "+1 (555) 019-2834",
      isIncoming: true,
      durationSeconds: 0,
    };

    this.events.onCallStateChanged?.(this.call);
    // Pause background media while phone is ringing
    this.events.onAudioFocusChanged?.(false, true);
  }

  public answerCall(): void {
    if (!this.call) return;

    this.call = {
      ...this.call,
      isIncoming: false,
      durationSeconds: 0,
    };

    this.events.onCallStateChanged?.(this.call);
    this.startTimer();
  }

  public endCall(): void {
    if (!this.call) return;

    this.stopTimer();
    this.call = null;

    this.events.onCallStateChanged?.(null);
    // Restore full audio focus
    this.events.onAudioFocusChanged?.(false, false);
  }

  private startTimer(): void {
    this.stopTimer();
    if (typeof window === "undefined") return;

    this.timer = window.setInterval(() => {
      if (!this.call || this.call.isIncoming) return;
      this.call = {
        ...this.call,
        durationSeconds: this.call.durationSeconds + 1,
      };
      this.events.onCallStateChanged?.(this.call);
    }, 1000);
  }

  private stopTimer(): void {
    if (typeof window !== "undefined" && this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public destroy(): void {
    this.stopTimer();
    this.call = null;
  }
}
