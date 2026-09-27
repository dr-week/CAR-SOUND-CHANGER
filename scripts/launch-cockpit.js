/**
 * Launch Cockpit in Dedicated Automotive Display Window
 *
 * Opens the launcher in standalone App Mode (no address bar, no tabs)
 * locked to standard automotive head unit aspect ratio (1280x720).
 *
 * Usage:
 *   npm run cockpit        -> 1280x720 borderless automotive window
 *   npm run cockpit:kiosk  -> 100% fullscreen kiosk (like in-dash screen)
 */
import { spawn } from "node:child_process";
import os from "node:os";

const isKiosk = process.argv.includes("--kiosk");
const url = "http://localhost:5173";

const args = isKiosk
  ? [`--app=${url}`, "--kiosk", "--start-fullscreen"]
  : [`--app=${url}`, "--window-size=1280,720", "--window-position=100,100"];

const isWin = os.platform() === "win32";

if (isWin) {
  // Try Microsoft Edge first (preinstalled on all Windows), then Google Chrome
  const edge = spawn("msedge", args, { detached: true, stdio: "ignore" });
  edge.on("error", () => {
    spawn("chrome", args, { detached: true, stdio: "ignore" });
  });
} else {
  // Linux / macOS fallback
  spawn("google-chrome", args, { detached: true, stdio: "ignore" });
}

console.log(
  isKiosk
    ? "[Cockpit] Launched in Fullscreen In-Dash Kiosk Mode."
    : "[Cockpit] Launched in 1280x720 Dedicated Automotive Window."
);
