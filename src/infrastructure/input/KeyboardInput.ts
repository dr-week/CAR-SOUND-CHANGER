import type { DriveAction } from "../../domain/vehicle/controls";
export type { DriveAction } from "../../domain/vehicle/controls";

const CONTROL_BINDINGS: Record<string, DriveAction> = {
  // Accelerate bindings
  KeyW: "accelerate",
  ArrowUp: "accelerate",
  w: "accelerate",
  W: "accelerate",

  // Brake bindings
  KeyS: "brake",
  ArrowDown: "brake",
  Space: "brake",
  s: "brake",
  S: "brake",
  " ": "brake",
};

export class KeyboardInput {
  private readonly target: EventTarget;

  constructor(
    private readonly onControl: (action: DriveAction, active: boolean) => void,
    private readonly onShift: (delta: number) => void,
    target?: EventTarget,
  ) {
    this.target = target ?? (typeof window !== "undefined" ? window : new EventTarget());
  }

  start(): () => void {
    const down = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (
        typeof HTMLElement !== "undefined" &&
        event.target instanceof HTMLElement &&
        event.target.closest('input, select, textarea, [contenteditable="true"]')
      ) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const code = event.code;
      const key = event.key;

      // Upshift: Digit1, Numpad1, KeyQ, '1', 'q', 'Q'
      if (
        code === "Digit1" ||
        code === "Numpad1" ||
        code === "KeyQ" ||
        key === "1" ||
        key === "q" ||
        key === "Q"
      ) {
        event.preventDefault();
        this.onShift(1);
        return;
      }

      // Downshift: Digit2, Numpad2, KeyE, '2', 'e', 'E'
      if (
        code === "Digit2" ||
        code === "Numpad2" ||
        code === "KeyE" ||
        key === "2" ||
        key === "e" ||
        key === "E"
      ) {
        event.preventDefault();
        this.onShift(-1);
        return;
      }

      const action = CONTROL_BINDINGS[code] || CONTROL_BINDINGS[key];
      if (action) {
        event.preventDefault();
        this.onControl(action, true);
      }
    };

    const up = (event: KeyboardEvent) => {
      const code = event.code;
      const key = event.key;
      const action = CONTROL_BINDINGS[code] || CONTROL_BINDINGS[key];
      if (action) {
        this.onControl(action, false);
      }
    };

    const blur = () => {
      this.onControl("accelerate", false);
      this.onControl("brake", false);
    };

    const target = this.target;
    target.addEventListener("keydown", down as EventListener);
    target.addEventListener("keyup", up as EventListener);
    target.addEventListener("blur", blur as EventListener);

    return () => {
      target.removeEventListener("keydown", down as EventListener);
      target.removeEventListener("keyup", up as EventListener);
      target.removeEventListener("blur", blur as EventListener);
    };
  }
}

