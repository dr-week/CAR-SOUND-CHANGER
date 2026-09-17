# Troubleshooting Guide

Common issues and solutions for **Car Sound Changer & Infotainment Launcher**.

---

## 🔊 Audio & Sound Issues

### 1. No Sound Output
- **Cause**: Browsers require explicit user interaction before starting Web Audio.
- **Solution**: Click the **Enable Audio** button in the header or sidebar. Ensure your device volume is turned up and not muted.

### 2. Micro-Clicks or Crackling Audio
- **Cause**: Web Audio CPU overload or sample rate mismatch.
- **Solution**: Close background browser tabs. The engine uses 4-voice oscillator synthesis which requires minimal CPU, but background tab throttling can affect timing.

### 3. Audio Lags Behind Speed / Throttle
- **Cause**: AudioContext latency or high latency Bluetooth codecs (SBC).
- **Solution**: Use aptX Low Latency or AAC Bluetooth codecs on your Android head unit, or use a wired 3.5mm AUX connection for zero latency.

---

## 📍 GPS & Speed Issues

### 1. Speedometer Shows "0 Km/h" or "Inactive"
- **Cause**: Browser location permissions denied or GPS disabled on the device.
- **Solution**: Ensure Location services are enabled on your Android head unit or smartphone. Grant location access permissions to the browser.

### 2. Telemetry Status Shows "Stale"
- **Cause**: GPS signal lost (e.g. inside a tunnel, underground parking, or obscured sky view).
- **Solution**: Move to an open area with clear line of sight to the sky. The app will automatically resume tracking once fresh fixes arrive.

---

## 📻 Web Bluetooth Issues

### 1. "Bluetooth Unsupported" Message
- **Cause**: Browser does not support the Web Bluetooth API (e.g. Firefox or HTTP sites).
- **Solution**: Use Chrome, Edge, or an Android WebKit browser served over **HTTPS** or `localhost`.

### 2. Device Picker Cancels Return to Idle
- **Cause**: Dismissing the browser device picker prompt.
- **Solution**: Normal behavior. Select your Bluetooth receiver from the browser prompt to pair.

---

## 🗺️ Google Maps Integration

### 1. Map Displays Grey Box or "ApiNotActivatedMapError"
- **Cause**: Missing or invalid `VITE_GOOGLE_MAPS_API_KEY` in `.env.local` or Maps JavaScript API not enabled in Google Cloud Console.
- **Solution**: Enable the **Maps JavaScript API** in Google Cloud Console and set `VITE_GOOGLE_MAPS_API_KEY` in your `.env.local` file.
