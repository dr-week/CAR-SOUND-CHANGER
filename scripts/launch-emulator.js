/**
 * Launch Android Virtual Machine (Infotainment Tablet)
 *
 * Starts the official Google Android Emulator with the 'medium_tablet' AVD
 * directly on your Windows desktop.
 *
 * Usage:
 *   npm run emulator
 */
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";

const homeDir = os.homedir();
const emulatorPath = path.join(
  homeDir,
  "AppData",
  "Local",
  "Android",
  "Sdk",
  "emulator",
  "emulator.exe"
);

console.log("[Android Emulator] Launching 'medium_tablet' Virtual Machine...");

const child = spawn(emulatorPath, ["-avd", "medium_tablet", "-no-snapshot-load"], {
  detached: true,
  stdio: "ignore",
});

child.unref();

console.log("[Android Emulator] Virtual Machine launched in dedicated window.");
