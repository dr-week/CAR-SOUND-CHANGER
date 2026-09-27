#!/usr/bin/env node
import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';

const withSim = process.argv.includes('--sim');
const noWindow = process.argv.includes('--no-window');
const children = [];

function log(tag, msg) {
  console.log(`[\x1b[36m${tag}\x1b[0m] ${msg}`);
}

function cleanup() {
  log('Orchestrator', 'Terminating all spawned dev processes...');
  for (const child of children) {
    try {
      if (os.platform() === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { stdio: 'ignore' });
      } else if (child.pid) {
        child.kill('SIGTERM');
      }
    } catch (_) {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

function runProcess(tag, command, args) {
  const isWin = os.platform() === 'win32';
  const cmd = isWin && !command.endsWith('.cmd') && !command.endsWith('.exe') ? `${command}.cmd` : command;
  const proc = spawn(cmd, args, { stdio: ['inherit', 'pipe', 'pipe'] });
  children.push(proc);

  proc.stdout.on('data', (data) => {
    const text = data.toString().trim();
    if (text) log(tag, text);
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString().trim();
    if (text) console.error(`[\x1b[31m${tag}\x1b[0m] ${text}`);
  });

  proc.on('close', (code) => {
    log(tag, `Exited with code ${code}`);
  });

  return proc;
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => (res.statusCode ? resolve(true) : reject()));
        req.on('error', reject);
        req.setTimeout(500, reject);
      });
      return true;
    } catch (_) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

console.log(`\n🚗 Starting Integrated Cockpit Development Environment`);
console.log(`─────────────────────────────────────────────────────────────`);

// 1. Start Phone Bridge
log('Bridge', 'Starting Mobile Companion Bridge on port 8088...');
runProcess('Bridge', 'node', ['scripts/phone-bridge.js']);

// 2. Start Vite Dev Server
log('Vite', 'Starting Vite Dev Server on port 5173...');
runProcess('Vite', 'npx', ['vite', '--host']);

// 3. Optional Telemetry Simulator
if (withSim) {
  log('Sim', 'Starting Telemetry Simulator feeder...');
  runProcess('Sim', 'node', ['scripts/sim-telemetry.js']);
}

// 4. Open Automotive Window once Vite is healthy
if (!noWindow) {
  (async () => {
    log('Orchestrator', 'Waiting for Vite dev server readiness...');
    const isReady = await waitForServer('http://localhost:5173');
    if (isReady) {
      log('Window', 'Opening 1280x720 dedicated automotive display window...');
      const browserArgs = ['--app=http://localhost:5173', '--window-size=1280,720', '--window-position=100,100'];
      if (os.platform() === 'win32') {
        const edge = spawn('msedge', browserArgs, { detached: true, stdio: 'ignore' });
        edge.on('error', () => spawn('chrome', browserArgs, { detached: true, stdio: 'ignore' }));
      } else {
        spawn('google-chrome', browserArgs, { detached: true, stdio: 'ignore' });
      }
    } else {
      log('Window', 'Vite server startup timed out, skipping auto-launch window.');
    }
  })();
}

log('Orchestrator', 'Environment active! Press Ctrl+C to terminate all services.');
