import { afterEach, describe, expect, it, vi } from "vitest";
import { BluetoothManager } from "../BluetoothManager";

function mockBluetooth(shouldReject = false, errorName = "NotFoundError") {
  const listeners: Record<string, EventListener> = {};
  const mockDevice = {
    name: "Blaupunkt BT Audio",
    gatt: {
      connected: true,
      disconnect: vi.fn(() => {
        if (listeners["gattserverdisconnected"]) {
          listeners["gattserverdisconnected"](new Event("gattserverdisconnected"));
        }
      }),
    },
    addEventListener: vi.fn((event: string, cb: EventListener) => {
      listeners[event] = cb;
    }),
    removeEventListener: vi.fn((event: string, cb: EventListener) => {
      if (listeners[event] === cb) delete listeners[event];
    }),
  };

  const bluetoothObj = {
    requestDevice: vi.fn(async () => {
      if (shouldReject) {
        const err = new DOMException("User cancelled", errorName);
        throw err;
      }
      return mockDevice;
    }),
  };

  vi.stubGlobal("navigator", { bluetooth: bluetoothObj });
  return { mockDevice, bluetoothObj };
}

describe("BluetoothManager", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles successful device pairing and clean disconnect", async () => {
    const { mockDevice } = mockBluetooth();
    const manager = new BluetoothManager();
    const statuses: string[] = [];
    manager.onStatusChange((s) => statuses.push(s));

    await manager.requestDevice();
    expect(manager.status).toBe("connected");
    expect(manager.deviceName).toBe("Blaupunkt BT Audio");

    manager.disconnect();
    expect(manager.status).toBe("idle");
    expect(manager.connectedDevice).toBeNull();
    expect(mockDevice.gatt.disconnect).toHaveBeenCalledOnce();
  });

  it("handles user cancellation (NotFoundError or AbortError) gracefully", async () => {
    mockBluetooth(true, "AbortError");
    const manager = new BluetoothManager();
    const statuses: string[] = [];
    manager.onStatusChange((s) => statuses.push(s));

    await manager.requestDevice();
    expect(manager.status).toBe("idle");
    expect(statuses).toEqual(["scanning", "idle"]);
  });
});
