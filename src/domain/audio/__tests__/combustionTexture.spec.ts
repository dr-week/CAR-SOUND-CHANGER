import { describe, expect, it } from "vitest";
import { combustionTexture } from "../combustionTexture";

describe("combustion texture", () => {
  it("adds bounded idle variation without gain boost", () => {
    const values = Array.from({ length: 1000 }, (_, i) => combustionTexture(i / 100, 8, 0));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0.91);
    expect(Math.max(...values)).toBeLessThanOrEqual(1);
    expect(new Set(values).size).toBeGreaterThan(900);
  });
  it("settles at full load and tolerates invalid input", () => {
    expect(combustionTexture(12, 8, 1)).toBe(1);
    expect(combustionTexture(NaN, 8, 0)).toBe(1);
    expect(combustionTexture(0, 8, NaN)).toBe(1);
  });
});
