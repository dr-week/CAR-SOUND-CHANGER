/**
 * Phone Bridge Server
 *
 * Lightweight local bridge connecting your real handheld phone to the
 * automotive cockpit launcher over Wi-Fi / LAN with zero external dependencies.
 */
import http from "node:http";
import os from "node:os";
import fs from "node:fs";
import { startDiscoveryBeacon } from "./discovery-beacon.js";

const PORT = 8088;
const clients = new Set();
const mobileHtml = fs.readFileSync(new URL("./companion/mobile-companion.html", import.meta.url), "utf8");

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(payload);
}

const parseJson = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { resolve({}); }
    });
  });

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/phone")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(mobileHtml);
    return;
  }

  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ ip: localIp, port: PORT })}\n\n`);
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (req.method === "POST" && req.url === "/api/notify") {
    const data = await parseJson(req);
    broadcast("notification", {
      app: data.app || "Android Phone",
      sender: data.sender || "Handheld Device",
      message: data.message || "New notification",
      category: data.category || "message",
    });
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "delivered" }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/telemetry") {
    const data = await parseJson(req);
    broadcast("telemetry", {
      battery: typeof data.battery === "number" ? data.battery : 85,
      charging: Boolean(data.charging),
      network: data.network || "5G",
      phoneName: data.phoneName || "Handheld Device",
    });
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "telemetry_received" }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/media") {
    const data = await parseJson(req);
    broadcast("media", {
      title: data.title || "No Track",
      artist: data.artist || "Unknown Artist",
      album: data.album || "",
      duration: data.duration || 0,
      position: data.position || 0,
      isPlaying: Boolean(data.isPlaying),
      albumArt: data.albumArt || null,
    });
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "media_synced" }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/media-control") {
    const data = await parseJson(req);
    broadcast("media_control", { action: data.action || "toggle" });
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "dispatched" }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/call") {
    const data = await parseJson(req);
    broadcast("call", {
      callerName: data.callerName || "Unknown Caller",
      callerNumber: data.callerNumber || "+1 (555) 019-2834",
    });
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "calling" }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/end-call") {
    broadcast("end-call", {});
    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "call_ended" }));
    return;
  }

  res.writeHead(404).end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Cockpit Phone Bridge] Running on port ${PORT}`);
  console.log(`[Cockpit Phone Bridge] Open on your handheld phone: http://${localIp}:${PORT}`);
  startDiscoveryBeacon(localIp, PORT);
});
