/** Small amplitude-only idle unevenness; no detune/warble of RPM-derived pitch. */
export function combustionTexture(time: number, cylinders: number, load: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(load)) return 1;
  const depth = (cylinders === 8 ? 0.045 : 0.025) * (1 - Math.max(0, Math.min(1, load)));
  return 1 - depth + depth * (0.65 * Math.sin(time * 2 * Math.PI * 7) + 0.35 * Math.sin(time * 2 * Math.PI * 11.3));
}
