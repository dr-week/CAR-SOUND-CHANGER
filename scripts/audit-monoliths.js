#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const MAX_LINES = parseInt(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1] || '180', 10);
const includeCss = process.argv.includes('--include-css');
const targetExts = new Set(['.vue', '.ts', '.js', '.kt']);
if (includeCss) targetExts.add('.css');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.gradle', '.system_generated']);

const violators = [];
let totalScanned = 0;

function scanDir(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else {
      const ext = path.extname(entry.name);
      if (targetExts.has(ext) && !entry.name.endsWith('.d.ts')) {
        totalScanned++;
        const content = fs.readFileSync(fullPath, 'utf8');
        const lineCount = content.split('\n').length;
        if (lineCount > MAX_LINES) {
          violators.push({ path: path.relative(process.cwd(), fullPath), lines: lineCount });
        }
      }
    }
  }
}

['src', 'android/app/src/main/java', 'companion/app/src/main/java', 'scripts'].forEach((dir) => {
  if (fs.existsSync(dir)) scanDir(dir);
});

console.log(`\n🔍 Codebase Monolith Audit (Threshold: ≤ ${MAX_LINES} lines)`);
console.log(`Target Extensions: ${Array.from(targetExts).join(', ')}`);
console.log(`─────────────────────────────────────────────────────────────`);

if (violators.length === 0) {
  console.log(`✅ Passed! All ${totalScanned} code files are strictly modular and comply with ≤ ${MAX_LINES} lines.\n`);
  process.exit(0);
} else {
  console.error(`❌ Found ${violators.length} monolithic file(s) exceeding ${MAX_LINES} lines:`);
  for (const v of violators) {
    console.error(`  - ${v.path.padEnd(65)} : ${v.lines} lines`);
  }
  console.error(`\nPlease split these files into sub-modules, composables, or micro code files.\n`);
  process.exit(1);
}
