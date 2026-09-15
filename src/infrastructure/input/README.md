# infrastructure/input

Keyboard input adapter. Maps `keydown`/`keyup` events to `DriveAction` and gear-shift commands.

## Files

| File | Purpose |
|---|---|
| `KeyboardInput.ts` | Event listener registration and key binding |
| `index.ts` | Barrel export |

## Key Bindings

| Key | Action |
|---|---|
| W | Accelerate (hold) |
| S | Brake (hold) |
| 1 / Numpad1 | Upshift |
| 2 / Numpad2 | Downshift |
| Window blur | Release all controls |

## Safety

- Ignores `event.repeat` (no held-key flooding)
- Ignores events from form elements (input, select, textarea)
- Ignores modifier-key combinations (Ctrl, Alt, Meta)

## Usage

```ts
import { KeyboardInput } from '@/infrastructure/input';

const kb = new KeyboardInput(
  (action, active) => session.setControl(action, active),
  (delta) => session.shift(delta),
);
const stop = kb.start();
// later:
stop(); // removes all event listeners
```
