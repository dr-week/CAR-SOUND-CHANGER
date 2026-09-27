# Contributing

## Before changing code

1. Read [Architecture](./docs/ARCHITECTURE.md) and [Development](./docs/DEVELOPMENT.md).
2. For UI work, also read [UI/UX Design](./docs/UI_UX_DESIGN.md).
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
- Aim for 100–250 lines per hand-written module. Above 250, review responsibilities; above 400, split before adding features unless a cohesive exception is documented. Line count is a signal, not a reason for arbitrary fragments.
- Group private components, styles, types, and tests by feature. Keep public entry points stable and dependencies one-way; avoid circular imports and catch-all utility files.
- Extract stateful behavior into named composables and device work into adapters. Keep component templates and styles focused on one surface.
- Never commit API keys, recordings without clear rights, or personal location data.

## UI rules

- Home contains two independent widget panels; preserve the right-side pill dock. Engine tuning stays outside Home.
- The right-side pill owns Home navigation; panel selectors only switch widgets.
- Do not duplicate pinned apps inside the static app drawer.
- Engine controls remain in the Engine app.
- Primary touch targets are at least 64 px; secondary targets are at least 48 px.
- Validate 100%, 110%, and 130% interface scales.
- Design loading, empty, denied, offline, and error states.

## Verification

Match verification to risk:

- Domain changes: relevant unit tests plus the full test suite.
- UI changes: type check, build, and landscape visual inspection.
- Audio changes: automated tests plus a real listening check.
- Android bridge changes: emulator and physical head-unit testing.

Document only durable behavior. Update an existing canonical document instead of creating a new planning or summary file.

## AI handoff contract

For every AI-assisted change, leave the repository understandable without relying on chat history:

1. Read `README.md`, `docs/ARCHITECTURE.md`, and the document owning the affected feature.
2. Preserve the boundaries between domain, application, infrastructure, and presentation.
3. Add a short code comment when behavior is safety-critical, hardware-dependent, intentionally limited, or surprising. Do not narrate obvious syntax.
4. Never invent installed apps, sensor readings, audio formats, camera distance, or hardware capability.
5. Put vendor-specific behavior behind a tested device adapter and document its fallback.
6. Update an existing canonical document when an invariant or public behavior changes.
7. Finish with the relevant tests plus `npm run check`, `npm run lint`, and `npm run build`.

Use this handoff format in change summaries:

```text
Outcome: what now works
Files: canonical implementation and documentation
Invariants: behavior that must remain true
Verification: commands and physical-device checks completed
Remaining: concrete blockers or hardware-dependent work
```
