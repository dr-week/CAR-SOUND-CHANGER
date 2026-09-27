/**
 * usePhoneCommunication
 *
 * Orchestrates phone calls, active call states, audio focus ducking,
 * and low-overhead message notifications for the right-hand cockpit panel.
 * Automatically listens to live handheld phone events via the local bridge.
 */
import { ref, readonly, onBeforeUnmount } from "vue";
import type { ActiveCallState } from "../../presentation/views/home/callTypes";
import type { AutomotiveNotification } from "../../domain/notification/types";
import { PhoneSessionController } from "../../domain/phone/PhoneSessionController";
import { sonicPairing } from "../../infrastructure/audio/SonicPairingEmitter";
import { connectPhoneBridge } from "./phone/phoneBridgeClient";

export interface PhoneCommunicationOptions {
  onAudioFocusChanged?: (isDucked: boolean, isPaused: boolean) => void;
  bridgeUrl?: string;
}

export interface PhoneTelemetry {
  battery: number;
  charging: boolean;
  network: string;
  phoneName: string;
}

export interface RemoteMediaState {
  title: string;
  artist: string;
  album: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  albumArt: string | null;
}

export function usePhoneCommunication(options: PhoneCommunicationOptions = {}) {
  const activeCall = ref<ActiveCallState | null>(null);
  const notifications = ref<AutomotiveNotification[]>([]);
  const bridgeConnected = ref(false);
  const phoneTelemetry = ref<PhoneTelemetry | null>(null);
  const remoteMedia = ref<RemoteMediaState | null>(null);
  const isAudioBroadcasting = ref(false);

  const session = new PhoneSessionController({
    onCallStateChanged: (call) => {
      activeCall.value = call;
    },
    onAudioFocusChanged: (isDucked, isPaused) => {
      options.onAudioFocusChanged?.(isDucked, isPaused);
    },
  });

  function simulateIncomingCall(callerName = "Sarah Connor", callerNumber = "+1 (555) 839-2041"): void {
    session.startIncomingCall(callerName, callerNumber);
  }

  function answerCall(): void {
    session.answerCall();
  }

  function endCall(): void {
    session.endCall();
  }

  function emitSonicChirp(lastOctet = 111): void {
    sonicPairing.emitChirp(lastOctet).catch(() => {});
  }

  function sendMediaAction(action: "play" | "pause" | "next" | "prev"): void {
    const bridgeUrl = options.bridgeUrl || "http://localhost:8088";
    const base = bridgeUrl.replace(/\/events$/, "");
    fetch(`${base}/api/media-control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }).catch(() => {});
  }

  function postNotification(
    app: string,
    sender: string,
    message: string,
    category: "message" | "system" | "navigation" | "call" = "message",
  ): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newNotif: AutomotiveNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      app,
      sender,
      message,
      time: timeStr,
      category,
    };

    notifications.value = [newNotif, ...notifications.value.slice(0, 14)];
  }

  function dismissNotification(id: string): void {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clearAllNotifications(): void {
    notifications.value = [];
  }

  const disconnectBridge = connectPhoneBridge({
    bridgeUrl: options.bridgeUrl,
    bridgeConnected,
    phoneTelemetry,
    remoteMedia,
    onNotification: postNotification,
    onIncomingCall: simulateIncomingCall,
    onEndCall: endCall,
  });

  if (typeof window !== "undefined") {
    (window as any).onAndroidAudioStreamChanged = (active: boolean) => {
      isAudioBroadcasting.value = active;
    };
  }

  onBeforeUnmount(() => {
    session.destroy();
    if (typeof window !== "undefined") {
      delete (window as any).onAndroidAudioStreamChanged;
    }
    disconnectBridge();
  });

  return {
    activeCall,
    notifications,
    bridgeConnected: readonly(bridgeConnected),
    phoneTelemetry: readonly(phoneTelemetry),
    remoteMedia: readonly(remoteMedia),
    isAudioBroadcasting: readonly(isAudioBroadcasting),
    emitSonicChirp,
    sendMediaAction,
    simulateIncomingCall,
    answerCall,
    endCall,
    postNotification,
    dismissNotification,
    clearAllNotifications,
  };
}
