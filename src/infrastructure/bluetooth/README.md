# infrastructure/bluetooth

Web Bluetooth API adapter. Manages device connection state for UI feedback.  
**Audio routing is handled by the OS** — this module does not move audio bytes.

## Files

| File | Purpose |
|---|---|
| `BluetoothManager.ts` | Connection state machine + device picker |
| `index.ts` | Barrel export |

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge 56+ | ✅ Full (HTTPS or localhost required) |
| Firefox | ❌ Not supported |
| Safari | ❌ Not supported |

`isSupported` returns `false` gracefully; UI hides the button automatically.

## Status Machine

```
idle → scanning → connected → disconnected → idle
              ↘ idle (user cancelled)
              ↘ error (unexpected failure)
```

## Usage

```ts
import { BluetoothManager } from '@/infrastructure/bluetooth';

const bt = new BluetoothManager();
const unsub = bt.onStatusChange(status => console.log(status));
await bt.requestDevice(); // opens OS picker
bt.disconnect();
unsub();
```
