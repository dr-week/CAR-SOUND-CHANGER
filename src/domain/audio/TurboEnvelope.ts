import type { VehicleState } from "../vehicle/types";

/** Local sound envelope, not a physical boost-pressure simulation. */
export class TurboEnvelope {
  private boost = 0;
  private release = 0;
  private loaded = false;

  reset(): void {
    this.boost = this.release = 0;
    this.loaded = false;
  }

  update(state: VehicleState, dt: number, shifting = false): { boost: number; release: number } {
    if (!Number.isFinite(dt) || dt <= 0) return { boost: this.boost, release: this.release };
    if (state.profile.induction !== "turbo") {
      this.reset();
      return { boost: 0, release: 0 };
    }
    const elapsed = Number.isFinite(dt) ? Math.max(0, Math.min(0.1, dt)) : 0;
    const loaded = !shifting && state.throttle > 0.5 && state.brake < 0.5 && state.rpm > state.profile.idleRpm * 1.2;
    if (this.loaded && !loaded && this.boost > 0.15) this.release = this.boost;
    else this.release = Math.max(0, this.release - elapsed / 0.28);
    this.boost = Math.max(0, Math.min(1, this.boost + elapsed * (loaded ? 1.4 : -4)));
    this.loaded = loaded;
    return { boost: this.boost, release: this.release };
  }
}
