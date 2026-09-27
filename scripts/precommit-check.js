#!/usr/bin/env node
import { execSync } from 'node:child_process';

const stages = [
  { name: '1. Line Budget Guard (Monolith Prevention)', cmd: 'node scripts/audit-monoliths.js' },
  { name: '2. TypeScript Compilation Check', cmd: 'npm run check' },
  { name: '3. Audio Engine Synthesis & Clipping Audit', cmd: 'node --experimental-strip-types scripts/benchmark-audio.js' },
  { name: '4. Vitest Automated Unit Test Suite', cmd: 'npm test' },
];

console.log(`\n🛡️  Running Complete Quality & CI Gate`);
console.log(`─────────────────────────────────────────────────────────────`);

const startTime = Date.now();

for (const stage of stages) {
  process.stdout.write(`⏳ ${stage.name}... `);
  const stageStart = Date.now();
  try {
    execSync(stage.cmd, { stdio: 'pipe' });
    const elapsedSec = ((Date.now() - stageStart) / 1000).toFixed(1);
    console.log(`\x1b[32mPASSED\x1b[0m (${elapsedSec}s)`);
  } catch (err) {
    console.log(`\x1b[31mFAILED\x1b[0m`);
    console.error(`\n❌ Gate failed at stage: ${stage.name}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`─────────────────────────────────────────────────────────────`);
console.log(`🎉 All quality gates passed cleanly in ${totalSec}s! Ready for commit/deployment.\n`);
