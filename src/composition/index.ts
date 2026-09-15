// ── Composition Root ─────────────────────────────────────────────────────────
// The ONE file that wires infrastructure adapters to application use cases.
// Nothing outside this folder should instantiate infrastructure directly.
export { createSimulatorRuntime } from "./createSimulatorRuntime";
