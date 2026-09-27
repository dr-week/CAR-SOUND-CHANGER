#!/usr/bin/env node
import http from 'node:http';

const host = process.env.BRIDGE_HOST || '127.0.0.1';
const port = parseInt(process.env.BRIDGE_PORT || '8088', 10);
const runOnce = process.argv.includes('--once');

function postJson(path, data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        host,
        port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 1000,
      },
      (res) => resolve(res.statusCode === 200),
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

const mockMessages = [
  { app: 'WhatsApp', sender: 'Elena Rostova', text: 'Arrived at the supercharger station. Bay #4 is free.' },
  { app: 'WhatsApp', sender: 'Service Center', text: 'Scheduled tire rotation reminder for tomorrow at 10 AM.' },
  { app: 'Telegram', sender: 'Navigation Bot', text: 'Traffic cleared on Highway 101 Northbound. Route updated.' },
  { app: 'Spotify', sender: 'Now Playing', text: 'Cyberpunk 2077 - The Rebel Path (Synthesizer Remix)' },
];

let cycle = 0;
let rpm = 850;
let speed = 0;
let gear = 1;
let accelerating = true;

async function sendStep() {
  cycle++;

  // 1. Drivetrain physics simulation
  if (accelerating) {
    rpm += 350;
    speed += 3;
    if (rpm >= 5800) {
      if (gear < 5) {
        gear++;
        rpm = 2400;
      } else {
        accelerating = false;
      }
    }
  } else {
    rpm -= 250;
    speed -= 2;
    if (rpm <= 1200) {
      if (gear > 1) {
        gear--;
        rpm = 3800;
      } else {
        accelerating = true;
      }
    }
  }

  // 2. Telemetry packet
  const batteryPct = Math.max(15, 95 - Math.floor(cycle / 5));
  const telemetryOk = await postJson('/api/telemetry', {
    batteryPct,
    isCharging: cycle % 8 === 0,
    networkType: '5G UW',
    wifiSsid: 'Cockpit-Hotspot',
    connected: true,
  });

  // 3. Periodic Simulated Notifications
  let eventLog = '';
  if (cycle % 6 === 0) {
    const msg = mockMessages[(cycle / 6) % mockMessages.length];
    await postJson('/api/notification', msg);
    eventLog = `💬 Notification: [${msg.app}] ${msg.sender}`;
  } else if (cycle % 15 === 0) {
    await postJson('/api/call', { callerName: 'Marcus Vance', callerNumber: '+1 (555) 902-1834' });
    eventLog = `📞 Incoming Call: Marcus Vance`;
  }

  const statusMarker = telemetryOk ? '🟢 Connected' : '⚪ Standalone (Bridge Offline)';
  console.log(
    `[Sim ${String(cycle).padStart(3, '0')}] Gear: ${gear} | RPM: ${String(rpm).padStart(4)} | Speed: ${String(Math.round(speed)).padStart(3)} km/h | Bat: ${batteryPct}% | ${statusMarker} ${eventLog}`,
  );
}

console.log(`\n🏎️  Cockpit Telemetry & Hardware Simulator`);
console.log(`Targeting Bridge: http://${host}:${port}`);
console.log(`Press Ctrl+C to stop simulation.\n`);

if (runOnce) {
  await sendStep();
  console.log('✓ Single test packet dispatched successfully.');
  process.exit(0);
} else {
  sendStep();
  setInterval(sendStep, 600);
}
