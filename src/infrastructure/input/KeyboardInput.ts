import type { DriveAction } from "../../domain/vehicle/controls";
export type { DriveAction } from "../../domain/vehicle/controls";
const BINDINGS: Record<string, DriveAction> = { KeyW: "accelerate", KeyS: "brake" };
export class KeyboardInput {
  constructor(
    private readonly onControl: (action: DriveAction, active: boolean) => void,
    private readonly onShift: (delta: number) => void,
  ) {}
  start(): () => void {
    const down = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === "Digit1" || event.code === "Numpad1") this.onShift(1);
      if (event.code === "Digit2" || event.code === "Numpad2") this.onShift(-1);
      const action = BINDINGS[event.code];
      if (action) {
        event.preventDefault();
        this.onControl(action, true);
      }
    };
    const up = (event: KeyboardEvent) => {
      const action = BINDINGS[event.code];
      if (action) this.onControl(action, false);
    };
    const blur = () => {
      this.onControl("accelerate", false);
      this.onControl("brake", false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }
}
