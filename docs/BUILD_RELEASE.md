# Build & Deployment Guide

Instructions for building and deploying **Car Sound Changer & Infotainment Launcher**.

---

## 🛠️ Development Build

Run the local Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will launch on `http://localhost:5173`.

---

## 📦 Production Build

To build the optimized production web assets:

```bash
npm run build
```

This compiles TypeScript, bundles Vue components, minifies CSS/JS assets, and outputs the distribution files to `dist/`.

---

## 🔍 Previewing Production Build

To test the compiled production build locally before deployment:

```bash
npm run preview
```

---

## 🤖 Deployment to Android Head Units (Blaupunkt / Chinese Head Units)

1. Build the production app using `npm run build`.
2. Host the `dist/` directory on an internal web server, HTTPS web host, or PWA runner.
3. On your Blaupunkt or Chinese Android music system:
   - Open Chrome / Web Browser.
   - Navigate to your launcher URL.
   - Select **Add to Home Screen** or set as the default homepage/launcher application.
