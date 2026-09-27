#!/usr/bin/env node
import { execSync } from 'node:child_process';

const event = process.argv[2]?.toLowerCase() || '';

const EVENT_MAP = {
  wheel_next: { type: 'key', code: 'KEYCODE_MEDIA_NEXT', desc: 'Steering Wheel Next Track' },
  wheel_prev: { type: 'key', code: 'KEYCODE_MEDIA_PREVIOUS', desc: 'Steering Wheel Previous Track' },
  wheel_play: { type: 'key', code: 'KEYCODE_MEDIA_PLAY_PAUSE', desc: 'Steering Wheel Play/Pause' },
  wheel_mode: { type: 'key', code: 'KEYCODE_APP_SWITCH', desc: 'Steering Wheel Mode Switch' },
  wheel_vol_up: { type: 'key', code: 'KEYCODE_VOLUME_UP', desc: 'Steering Wheel Volume +' },
  wheel_vol_down: { type: 'key', code: 'KEYCODE_VOLUME_DOWN', desc: 'Steering Wheel Volume -' },
  wheel_mute: { type: 'key', code: 'KEYCODE_VOLUME_MUTE', desc: 'Steering Wheel Mute' },
  wheel_call: { type: 'key', code: 'KEYCODE_CALL', desc: 'Steering Wheel Answer Call' },
  wheel_end_call: { type: 'key', code: 'KEYCODE_ENDCALL', desc: 'Steering Wheel Reject Call' },
  wheel_voice: { type: 'key', code: 'KEYCODE_VOICE_ASSIST', desc: 'Steering Wheel Voice Assist' },
  wheel_back: { type: 'key', code: 'KEYCODE_BACK', desc: 'Hardware Back Button' },

  reverse_on: {
    type: 'broadcast',
    action: 'android.intent.action.REVERSE_GEAR',
    extra: '--ez reverse true',
    desc: 'CANbus Reverse Gear ENGAGED',
  },
  reverse_off: {
    type: 'broadcast',
    action: 'android.intent.action.REVERSE_GEAR',
    extra: '--ez reverse false',
    desc: 'CANbus Reverse Gear DISENGAGED',
  },
  headlights_on: {
    type: 'broadcast',
    action: 'android.intent.action.HEADLIGHT_ON',
    extra: '--ez illum true',
    desc: 'CANbus Headlights ON (Night Mode)',
  },
  headlights_off: {
    type: 'broadcast',
    action: 'android.intent.action.HEADLIGHT_ON',
    extra: '--ez illum false',
    desc: 'CANbus Headlights OFF (Day Mode)',
  },
  meta_music: {
    type: 'broadcast',
    action: 'com.android.music.metachanged',
    extra: '--es track "Synthwave Drift" --es artist "Kavinsky" --es album "Outrun" --ez playing true',
    desc: 'External Music Metadata Broadcast',
  },
};

if (!event || !EVENT_MAP[event]) {
  console.log(`\n🎮 Android Head Unit Hardware & CANbus Event Injector`);
  console.log(`Usage: node scripts/hw-event-injector.js <event_name>\n`);
  console.log(`Available Events:`);
  for (const [k, v] of Object.entries(EVENT_MAP)) {
    console.log(`  - ${k.padEnd(16)} : ${v.desc}`);
  }
  console.log(`\nExample: npm run hw:event -- reverse_on\n`);
  process.exit(event ? 1 : 0);
}

const target = EVENT_MAP[event];
console.log(`\n⚡ Injecting Hardware Event: ${target.desc}`);

try {
  let cmd = '';
  if (target.type === 'key') {
    cmd = `adb shell input keyevent ${target.code}`;
  } else if (target.type === 'broadcast') {
    cmd = `adb shell am broadcast -a ${target.action} ${target.extra}`;
  }

  console.log(`> ${cmd}`);
  const out = execSync(cmd, { stdio: 'pipe' }).toString();
  if (out.trim()) console.log(out.trim());
  console.log(`✓ Event injected successfully into connected Android device.\n`);
} catch (err) {
  console.error(`\n❌ Failed to inject event via ADB:`);
  console.error(`  Ensure an Android head unit or emulator is connected (check 'adb devices').`);
  console.error(`  Error: ${err.message}\n`);
  process.exit(1);
}
