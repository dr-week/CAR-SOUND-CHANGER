# Documentation

These are the only maintained project documents. Update them in place; do not add status reports, duplicate plans, or one-off summaries.

| Document                           | Purpose                                                   |
| ---------------------------------- | --------------------------------------------------------- |
| [README](../README.md)             | Product overview, setup, Maps configuration, and status   |
| [ARCHITECTURE](./ARCHITECTURE.md)  | Runtime boundaries and data flow                          |
| [DEVELOPMENT](./DEVELOPMENT.md)    | Commands, workflow, tests, and release checks             |
| [UI_DESIGN](./UI_DESIGN.md)        | Active launcher information architecture and visual rules |
| [UX_AUDIT](./UX_AUDIT.md)          | Resolved mistakes and remaining release risks             |
| [AUDIO_SYSTEM](./AUDIO_SYSTEM.md)  | Engine synthesis, lifecycle, ducking, and routing limits  |
| [ANDROID](./ANDROID.md)            | Native launcher and head-unit integration plan            |
| [CONTRIBUTING](../CONTRIBUTING.md) | Contribution rules                                        |

## Source-level documentation

Use code comments only for non-obvious constraints. Public TypeScript types are the API reference. Tests document domain examples. Avoid manually duplicating signatures or directory trees in Markdown.
