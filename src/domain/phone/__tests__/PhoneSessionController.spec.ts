import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PhoneSessionController } from "../PhoneSessionController";

describe("PhoneSessionController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes without an active call", () => {
    const controller = new PhoneSessionController();
    expect(controller.currentCall).toBeNull();
    expect(controller.isRinging).toBe(false);
    expect(controller.isInCall).toBe(false);
  });

  it("handles incoming call and triggers audio ducking/pause", () => {
    const onCallStateChanged = vi.fn();
    const onAudioFocusChanged = vi.fn();

    const controller = new PhoneSessionController({
      onCallStateChanged,
      onAudioFocusChanged,
    });

    controller.startIncomingCall("Alice", "+1 (555) 123-4567");

    expect(controller.isRinging).toBe(true);
    expect(controller.isInCall).toBe(false);
    expect(controller.currentCall?.callerName).toBe("Alice");
    expect(controller.currentCall?.callerNumber).toBe("+1 (555) 123-4567");
    expect(controller.currentCall?.isIncoming).toBe(true);
    expect(onCallStateChanged).toHaveBeenCalledWith(controller.currentCall);
    expect(onAudioFocusChanged).toHaveBeenCalledWith(false, true);
  });

  it("answers incoming call and increments duration timer", () => {
    const onCallStateChanged = vi.fn();
    const controller = new PhoneSessionController({ onCallStateChanged });

    controller.startIncomingCall("Bob", "+1 987");
    controller.answerCall();

    expect(controller.isRinging).toBe(false);
    expect(controller.isInCall).toBe(true);
    expect(controller.currentCall?.durationSeconds).toBe(0);

    vi.advanceTimersByTime(3000);
    expect(controller.currentCall?.durationSeconds).toBe(3);
  });

  it("ends active call and restores audio focus", () => {
    const onCallStateChanged = vi.fn();
    const onAudioFocusChanged = vi.fn();
    const controller = new PhoneSessionController({
      onCallStateChanged,
      onAudioFocusChanged,
    });

    controller.startIncomingCall("Charlie", "+1 456");
    controller.answerCall();
    controller.endCall();

    expect(controller.currentCall).toBeNull();
    expect(controller.isInCall).toBe(false);
    expect(controller.isRinging).toBe(false);
    expect(onAudioFocusChanged).toHaveBeenLastCalledWith(false, false);
  });
});
