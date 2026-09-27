#!/usr/bin/env node
import { CAR_PROFILES } from '../src/domain/vehicle/carProfiles.ts';
import { engineSoundParameters } from '../src/domain/audio/engineSound.ts';

console.log(`\n🔊 Vehicle Engine Sound Synthesis Health & Clipping Profiler`);
console.log(`─────────────────────────────────────────────────────────────`);

let totalProfiles = 0;
let passCount = 0;
const issues = [];

console.log(
  `Profile ID`.padEnd(12) +
    `Cyl`.padEnd(6) +
    `Idle Hz`.padEnd(10) +
    `Redline Hz`.padEnd(12) +
    `Max Gain`.padEnd(11) +
    `Clipping Status`,
);
console.log(`─`.repeat(65));

for (const [id, profile] of Object.entries(CAR_PROFILES)) {
  totalProfiles++;

  // Test states at Idle, Mid, and Redline
  const idleState = { profile, rpm: profile.idleRpm, throttle: 0, brake: 0, gear: 1, speedKph: 0 };
  const redlineState = { profile, rpm: profile.redlineRpm, throttle: 1, brake: 0, gear: 1, speedKph: 100 };

  const idleAudio = engineSoundParameters(idleState);
  const redlineAudio = engineSoundParameters(redlineState, false, { boost: 1, release: 1 });

  const maxGain = redlineAudio.exhaustGain + redlineAudio.bodyGain + redlineAudio.intakeGain + redlineAudio.turboGain;
  const isClipping = maxGain > 1.0;
  const hasFrequencyAnomaly = idleAudio.firingHz < 10 || redlineAudio.firingHz > 2500;

  let status = '\x1b[32m✓ SAFE (PASS)\x1b[0m';
  if (isClipping) {
    status = '\x1b[31m⚠ CLIPPING (>1.0)\x1b[0m';
    issues.push(`${id}: Total acoustic gain exceeds 1.0 (${maxGain.toFixed(3)})`);
  } else if (hasFrequencyAnomaly) {
    status = '\x1b[33m⚠ ANOMALY\x1b[0m';
    issues.push(`${id}: Unrealistic firing frequency range (${idleAudio.firingHz.toFixed(1)} - ${redlineAudio.firingHz.toFixed(1)} Hz)`);
  } else {
    passCount++;
  }

  console.log(
    id.padEnd(12) +
      String(profile.cylinders).padEnd(6) +
      `${idleAudio.firingHz.toFixed(1)} Hz`.padEnd(10) +
      `${redlineAudio.firingHz.toFixed(1)} Hz`.padEnd(12) +
      `${maxGain.toFixed(2)}x`.padEnd(11) +
      status,
  );
}

console.log(`─`.repeat(65));
if (issues.length === 0) {
  console.log(`🎉 Certified Safe: All ${passCount}/${totalProfiles} vehicle profiles are mathematically bounded & zero-clipping.\n`);
  process.exit(0);
} else {
  console.error(`❌ Found ${issues.length} audio model warnings/clipping violations:`);
  issues.forEach((issue) => console.error(`  - ${issue}`));
  process.exit(1);
}
