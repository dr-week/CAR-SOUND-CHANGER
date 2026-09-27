/**
 * Discovery Beacon Service
 *
 * Broadcasts UDP beacon packets over the local subnet (Wi-Fi / Car Hotspot)
 * so handheld mobile phones can discover and connect to the car infotainment system
 * with 100% zero manual typing on either device.
 */
import dgram from "node:dgram";

const BEACON_PORT = 8089;

export function startDiscoveryBeacon(ip, port = 8088) {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

  socket.on("error", (err) => {
    console.warn(`[Discovery Beacon] UDP warning: ${err.message}`);
  });

  socket.bind(BEACON_PORT, () => {
    try {
      socket.setBroadcast(true);
    } catch {}

    const beaconData = JSON.stringify({
      service: "cockpit-car",
      name: "In-Dash Cockpit Launcher",
      ip,
      port,
      timestamp: Date.now(),
    });

    const msgBuffer = Buffer.from(beaconData);

    // Periodically broadcast beacon to subnet
    const timer = setInterval(() => {
      socket.send(msgBuffer, 0, msgBuffer.length, BEACON_PORT, "255.255.255.255", () => {});
    }, 2500);

    // Respond to direct unicast discovery probes from companion phones
    socket.on("message", (msg, rinfo) => {
      try {
        const query = JSON.parse(msg.toString());
        if (query.action === "discover_cockpit") {
          socket.send(msgBuffer, 0, msgBuffer.length, rinfo.port, rinfo.address, () => {});
        }
      } catch {}
    });

    console.log(`[Discovery Beacon] Zero-typing beacon broadcasting on UDP ${BEACON_PORT}`);
  });

  return socket;
}
