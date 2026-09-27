# Development

## Setup

Use Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Optional Maps configuration is documented in the root README and `.env.example`.

## Commands

| Command           | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Local development server                          |
| `npm run dev:lan` | Development server available on the local network |
| `npm run check`   | Vue and TypeScript validation                     |
| `npm run lint`    | ESLint checks                                     |
| `npm run test`    | Run all Vitest tests                              |
| `npm run build`   | Production PWA build                              |
| `npm run preview` | Preview the production build                      |

## Working rules

- Search with `rg` and keep changes scoped.
- Use `apply_patch` for manual edits.
- Do not overwrite unrelated worktree changes.
- Keep secrets in `.env.local`.
- Add dependencies only when they replace meaningful custom code.
- Update an existing canonical document instead of adding a new report.

## Verification

Minimum completion gate:

```bash
npm run check
npm run test
npm run build
```

Run lint and resolve new errors. Existing warnings in inactive legacy components are non-blocking but should not increase.

For UI changes, visually inspect Home and the affected surface in landscape. Changes to layout or typography must be checked at 100% and 130% interface scale. For audio changes, add automated tests and perform a listening test.

## Release

`npm run build` creates `dist/`. The service worker is generated during the build. Validate a clean install, offline fallback, Maps failure state, audio activation, and preference persistence before publishing.

### Android APK Build

The native shell lives in `android/`. Use JDK 17, Gradle wrapper 8.13, and Android SDK platform/build-tools 35. Machine paths belong in ignored `android/local.properties` (`sdk.dir`) and `android/toolchain.local.json` (`javaHome`, `adb`), not global Windows settings.

```bash
npm run android:build
npm run android:run
```

`android:build` packages fresh UI assets into `android/app/build/outputs/apk/debug/app-debug.apk`. Gradle runs the web build automatically, including from Android Studio. The APK loads bundled content without Chrome or Vite.

`android:run` builds, updates with `adb install -r`, and restarts only this app on existing `emulator-5554`. It never creates a VM or clears app data. Override the target with `npm run android:run -- -Serial <serial>`.

Source edits require rerunning this command; this is not hot reload. Android Studio Apply Changes still builds updates and does not support every change. A future debug-only live-server mode must remain separate from standalone APK verification. Head-unit validation follows [Android integration](./ANDROID_INTEGRATION.md).
