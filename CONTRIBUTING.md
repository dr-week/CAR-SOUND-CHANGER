# Contributing

## Before changing code

1. Read [Architecture](./docs/ARCHITECTURE.md) and [Development](./docs/DEVELOPMENT.md).
2. For UI work, also read [UI Design](./docs/UI_DESIGN.md).
3. Keep the domain independent from Vue, browser APIs, and Android APIs.
4. Do not present simulated values as live device state.

## Workflow

```bash
npm install
npm run check
npm run lint
npm run test
npm run build
```

Use focused commits. Do not reformat or rewrite unrelated files. Preserve user changes in dirty worktrees.

## Code rules

- TypeScript strict mode remains enabled.
- Domain logic stays pure and unit tested.
- Browser and device behavior belongs in infrastructure adapters.
- Vue components own presentation, not audio or vehicle rules.
- Prefer small modules and explicit types over generic abstractions.
- Never commit API keys, recordings without clear rights, or personal location data.

## UI rules

- Home contains destination, map, and media only.
- The brand mark is the only Home control.
- Do not duplicate pinned apps inside the static app drawer.
- Engine controls remain in the Engine app.
- Primary touch targets are at least 64 px; secondary targets are at least 44 px.
- Validate 100%, 110%, and 130% interface scales.
- Design loading, empty, denied, offline, and error states.

## Verification

Match verification to risk:

- Domain changes: relevant unit tests plus the full test suite.
- UI changes: type check, build, and landscape visual inspection.
- Audio changes: automated tests plus a real listening check.
- Android bridge changes: emulator and physical head-unit testing.

Document only durable behavior. Update an existing canonical document instead of creating a new planning or summary file.
