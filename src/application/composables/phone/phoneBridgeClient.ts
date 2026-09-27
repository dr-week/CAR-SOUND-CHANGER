import type { Ref } from "vue";
import type { PhoneTelemetry, RemoteMediaState } from "../usePhoneCommunication";

export interface PhoneBridgeClientOptions {
  bridgeUrl?: string;
  bridgeConnected: Ref<boolean>;
  phoneTelemetry: Ref<PhoneTelemetry | null>;
  remoteMedia: Ref<RemoteMediaState | null>;
  onNotification: (app: string, sender: string, message: string, category: any) => void;
  onIncomingCall: (callerName: string, callerNumber: string) => void;
  onEndCall: () => void;
}

export function connectPhoneBridge(options: PhoneBridgeClientOptions): () => void {
  if (typeof window === "undefined" || !("EventSource" in window)) {
    return () => {};
  }

  const url = options.bridgeUrl || "http://localhost:8088/events";
  let eventSource: EventSource | null = null;

  try {
    eventSource = new EventSource(url);

    eventSource.addEventListener("connected", () => {
      options.bridgeConnected.value = true;
    });

    eventSource.addEventListener("notification", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        options.onNotification(data.app, data.sender, data.message, data.category || "message");
      } catch {}
    });

    eventSource.addEventListener("telemetry", (e: MessageEvent) => {
      try {
        options.phoneTelemetry.value = JSON.parse(e.data);
      } catch {}
    });

    eventSource.addEventListener("media", (e: MessageEvent) => {
      try {
        options.remoteMedia.value = JSON.parse(e.data);
      } catch {}
    });

    eventSource.addEventListener("call", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        options.onIncomingCall(data.callerName, data.callerNumber);
      } catch {}
    });

    eventSource.addEventListener("end-call", () => {
      options.onEndCall();
    });

    eventSource.onerror = () => {
      options.bridgeConnected.value = false;
    };
  } catch {}

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
