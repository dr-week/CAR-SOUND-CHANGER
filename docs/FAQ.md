# Frequently Asked Questions (FAQ)

Frequently Asked Questions for **Car Sound Changer & Infotainment Launcher**.

---

### Q: Can I install this on my Blaupunkt or Android car music system?
**A:** Yes! The launcher is designed specifically for landscape Android head units (1024x600, 1280x720, 1920x1080). You can run it via Chrome or any Android browser, or set it as a PWA / web launcher.

---

### Q: Does it require an internet connection?
**A:** No! All sound synthesis (engine audio, turbo spool, blow-off valve, combustion noise) runs 100% offline procedurally using the Web Audio API. Internet connection is only required if you use live Google Maps tiles.

---

### Q: Is there any Chinese text in the UI?
**A:** No. The entire UI/UX is 100% English and icon-first, designed specifically to replace Chinese default stock head unit launcher interfaces with an avant-garde dark aesthetic.

---

### Q: How does the engine sound track my car's speed?
**A:** The launcher uses the browser's **Web Geolocation API**. When driving, GPS speed is tracked in real-time and converted to engine RPM, firing frequency, and transmission pitch shifts.

---

### Q: Can I play audio over my car's Bluetooth speaker?
**A:** Yes! The Web Audio engine routes sound to whatever audio device your Android head unit or phone is connected to (Bluetooth A2DP, 3.5mm AUX, or internal speakers).
