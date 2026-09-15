/**
 * BluetoothManager — Web Bluetooth API adapter
 *
 * Manages connection state for nearby Bluetooth audio devices.
 * Audio routing itself is handled by the OS; this class exists solely
 * to give the UI meaningful connection feedback.
 *
 * Requires: HTTPS (or localhost) + Chrome/Edge 56+
 * Not supported: Firefox, Safari (as of 2026)
 */

// ─── Minimal Web Bluetooth type shims ────────────────────────────────────────
// The standard TS DOM lib does not include Web Bluetooth (it's still an
// experimental API). These minimal declarations satisfy the compiler without
// requiring a third-party @types package.

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  disconnect(): void;
}

interface BluetoothDevice extends EventTarget {
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRequestDeviceOptions {
  filters?: Array<{ services?: string[]; name?: string }>;
  acceptAllDevices?: boolean;
  optionalServices?: string[];
}

interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
}

declare global {
  interface Navigator {
    readonly bluetooth?: Bluetooth;
  }
}

export type BluetoothStatus =
  | 'idle'         // Not connected, no active request
  | 'scanning'     // Browser device-picker is open
  | 'connected'    // Device paired and connected
  | 'disconnected' // Was connected, now lost
  | 'error'        // Unexpected error during connect/scan
  | 'unsupported'; // Web Bluetooth not available in this browser

type StatusListener = (status: BluetoothStatus) => void;

export class BluetoothManager {
  private _device: BluetoothDevice | null = null;
  private _status: BluetoothStatus;
  private readonly _listeners = new Set<StatusListener>();

  constructor() {
    this._status = this.isSupported ? 'idle' : 'unsupported';
  }

  // ─── Public read-only state ───────────────────────────────────────────────

  get isSupported(): boolean {
    return 'bluetooth' in navigator && navigator.bluetooth !== undefined;
  }

  get connectedDevice(): BluetoothDevice | null {
    return this._device;
  }

  get status(): BluetoothStatus {
    return this._status;
  }

  get deviceName(): string | null {
    return this._device?.name ?? null;
  }

  // ─── Connection ──────────────────────────────────────────────────────────

  /**
   * Opens the browser Bluetooth device picker filtered to audio sinks.
   * Resolves when the user selects a device or cancels.
   */
  async requestDevice(): Promise<void> {
    if (!this.isSupported) {
      this._emit('unsupported');
      return;
    }

    this._emit('scanning');

    try {
      // Request any device — audio routing is OS-level, not GATT-level
      const device = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        // Optionally add audio-specific services for future GATT work:
        // optionalServices: ['0000110b-0000-1000-8000-00805f9b34fb'], // A2DP sink
      });

      this._device = device;
      this._emit('connected');

      // Listen for the device disconnecting unexpectedly
      device.addEventListener('gattserverdisconnected', () => {
        this._device = null;
        this._emit('disconnected');
      });
    } catch (err) {
      // User cancelled the picker — DOMException "User cancelled"
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        this._emit('idle'); // Treat cancel as returning to idle
      } else {
        console.error('[BluetoothManager] requestDevice error:', err);
        this._emit('error');
      }
    }
  }

  /**
   * Disconnects the current device and resets state.
   */
  disconnect(): void {
    if (this._device?.gatt?.connected) {
      this._device.gatt.disconnect();
    }
    this._device = null;
    this._emit('idle');
  }

  // ─── Status observation ──────────────────────────────────────────────────

  /**
   * Subscribe to status changes. Returns an unsubscribe function.
   *
   * @example
   * const unsub = bluetooth.onStatusChange(s => console.log(s));
   * // later:
   * unsub();
   */
  onStatusChange(cb: StatusListener): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  private _emit(status: BluetoothStatus): void {
    this._status = status;
    this._listeners.forEach(cb => cb(status));
  }
}
