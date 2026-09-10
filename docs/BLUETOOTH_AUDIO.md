# Bluetooth Audio Integration Guide

Complete guide for implementing Bluetooth speaker support with NFS-style audio output.

## Overview

Route high-quality NFS-style engine sounds to Bluetooth speakers, car audio systems, or any Bluetooth audio device.

## Architecture

```
┌─────────────────────────────────────────────────┐
│         React Native Audio Layer                │
│  ┌──────────────┐      ┌──────────────┐        │
│  │ AudioService │─────►│ AudioRouter  │        │
│  └──────────────┘      └──────────────┘        │
│         │                      │                │
├─────────┼──────────────────────┼────────────────┤
│  React Native Bridge                           │
├─────────┼──────────────────────┼────────────────┤
│         ▼                      ▼                │
│  ┌──────────────┐      ┌──────────────┐        │
│  │AudioManager  │      │ Bluetooth    │        │
│  │(Android)     │◄────►│ Manager      │        │
│  └──────────────┘      └──────────────┘        │
└────────────┬───────────────────┬────────────────┘
             │                   │
             ▼                   ▼
     [Phone Speaker]     [Bluetooth Device]
```

## Implementation

### 1. Native Module Setup

**File**: `android/app/src/main/java/com/carsoundmod/BluetoothAudioModule.java`

```java
package com.carsoundmod;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioManager;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class BluetoothAudioModule extends ReactContextBaseJavaModule {
    // Implementation details in NATIVE_MODULES.md
}
```

### 2. React Native Service

**File**: `src/services/BluetoothService.ts`

```typescript
class BluetoothService {
  private audioManager: any;
  private connectedDevice: BluetoothDevice | null = null;
  private eventEmitter: NativeEventEmitter;

  async getAvailableDevices(): Promise<BluetoothDevice[]>;
  async connectToDevice(deviceId: string): Promise<void>;
  async disconnectDevice(): Promise<void>;
  async routeAudioToBluetooth(): Promise<void>;
  onDeviceConnected(callback: (device: BluetoothDevice) => void): void;
  onDeviceDisconnected(callback: () => void): void;
}
```

### 3. Audio Routing Logic

```typescript
// Automatic routing priority
const AUDIO_ROUTING_PRIORITY = [
  "BLUETOOTH_A2DP", // Bluetooth speakers/headphones
  "BLUETOOTH_SCO", // Bluetooth car kits
  "WIRED_HEADSET", // Wired headphones
  "USB_DEVICE", // USB audio
  "SPEAKER", // Phone speaker (fallback)
];

async function routeAudioToPreferredDevice() {
  const devices = await getAvailableAudioDevices();

  for (const priority of AUDIO_ROUTING_PRIORITY) {
    const device = devices.find((d) => d.type === priority);
    if (device && device.isConnected) {
      await setAudioOutput(device);
      return;
    }
  }
}
```

## Audio Quality Settings

### For Bluetooth Speakers

```typescript
const BLUETOOTH_AUDIO_CONFIG = {
  sampleRate: 44100, // CD quality
  bitDepth: 16, // 16-bit audio
  channels: 2, // Stereo
  codec: "AAC", // AAC or SBC
  bufferSize: 2048, // Balance latency/quality
  latencyMode: "LOW", // Minimize delay
};
```

### For Car Audio Systems

```typescript
const CAR_AUDIO_CONFIG = {
  sampleRate: 48000, // Higher quality for car systems
  bitDepth: 24, // 24-bit for better dynamics
  channels: 2, // Stereo
  codec: "APTX", // Lower latency if supported
  bufferSize: 1024, // Lower latency
  latencyMode: "ULTRA_LOW", // Critical for sync
};
```

## Connection Flow

```
┌─────────────┐
│  App Start  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Check BT Permission │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Scan Paired Devices │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Auto-connect Last   │
│ Used Device?        │
└──────┬──────────────┘
       │
       ├─Yes──► Connect & Route Audio
       │
       └─No───► Show Device Selector
                       │
                       ▼
              User Selects Device
                       │
                       ▼
              Connect & Route Audio
                       │
                       ▼
              Save Preference
```

## Latency Optimization

### Problem: Audio Lag

Bluetooth introduces ~150-300ms latency, which is noticeable with GPS speed changes.

### Solutions

1. **Predictive Audio Pre-loading**

   ```typescript
   // Pre-load next likely gear sound
   async function preloadNextGear(currentGear: number, acceleration: number) {
     if (acceleration > 0 && currentGear < 5) {
       await audioService.preload(currentGear + 1);
     }
   }
   ```

2. **Latency Compensation**

   ```typescript
   const BLUETOOTH_LATENCY_MS = 200;

   function compensateLatency(speed: number): number {
     // Predict speed 200ms in future
     const acceleration = calculateAcceleration();
     return speed + (acceleration * BLUETOOTH_LATENCY_MS) / 1000;
   }
   ```

3. **Use aptX Low Latency Codec**
   - Reduces latency to ~40ms
   - Check device support
   - Enable in Android developer options

## Device Management UI

### Audio Device Selector Component

```typescript
// src/components/AudioDeviceSelector.tsx
export const AudioDeviceSelector = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connected, setConnected] = useState<string | null>(null);

  return (
    <View>
      <Text>Available Audio Devices</Text>
      {devices.map(device => (
        <DeviceCard
          key={device.id}
          device={device}
          isConnected={device.id === connected}
          onConnect={() => connectDevice(device)}
        />
      ))}
    </View>
  );
};
```

## Permissions Required

### AndroidManifest.xml

```xml
<!-- Bluetooth Classic -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />

<!-- Android 12+ (API 31+) -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />

<!-- Audio Routing -->
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Optional: Check connection state -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Runtime Permission Handling

```typescript
async function requestBluetoothPermissions() {
  if (Platform.Version >= 31) {
    // Android 12+
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);
    return granted["android.permission.BLUETOOTH_CONNECT"] === "granted";
  }
  return true; // Below Android 12, granted at install time
}
```

## Testing Bluetooth Audio

### Test Checklist

- [ ] Connect to Bluetooth speaker
- [ ] Audio plays through Bluetooth
- [ ] Auto-reconnect after disconnect
- [ ] Smooth transition between phone/Bluetooth
- [ ] Volume control works
- [ ] No audio crackling or stuttering
- [ ] Latency is acceptable (< 200ms)
- [ ] Multiple device switching works
- [ ] Background mode continues playback

### Test Devices

Recommended test devices:

- JBL Flip/Charge speakers
- Car Bluetooth systems
- Bluetooth headphones
- Portable Bluetooth speakers

## Troubleshooting

### Audio Not Playing Through Bluetooth

1. Check Bluetooth is connected
2. Verify "Media Audio" profile is enabled
3. Check volume on both phone and speaker
4. Try disconnecting and reconnecting
5. Restart app

### Poor Audio Quality

1. Check codec being used (AAC > SBC)
2. Increase buffer size (reduces quality slightly)
3. Check signal strength
4. Reduce distance to speaker
5. Update Bluetooth firmware

### High Latency

1. Enable aptX Low Latency if available
2. Reduce buffer size
3. Use wired connection for critical sync
4. Implement predictive audio

## Related Documentation

- [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md) - Overall audio architecture
- [PERFORMANCE.md](./PERFORMANCE.md) - Audio optimization
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [NATIVE_MODULES.md](./NATIVE_MODULES.md) - Native implementation details

---

**Next**: See [AUDIO_SYSTEM.md](./AUDIO_SYSTEM.md) for NFS-style sound implementation.
