/** Preserve the audible value before cancelling an in-flight automation. */
export function fadeToSilence(param: AudioParam, now: number, duration: number): void {
  const current = param.value;
  if (typeof param.cancelAndHoldAtTime === "function") param.cancelAndHoldAtTime(now);
  else {
    param.cancelScheduledValues(now);
    param.setValueAtTime(current, now);
  }
  param.linearRampToValueAtTime(0, now + duration);
}
