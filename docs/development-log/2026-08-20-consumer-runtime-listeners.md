# Consumer Runtime Listeners — 2026-08-20

## Batch
Connected the Notifications surface to the runtime activity/reward/intelligence event bus.

## Implemented
- Refresh notifications after location activity.
- Refresh notifications after reward updates.
- Refresh notifications after intelligence updates.
- Preserve canonical notification persistence and read-state mutations.
- Keep action routing tied to existing product routes.

## Architecture
Runtime listeners are synchronization only. Supabase notification records remain authoritative.

## Commit
fb102e7a019a846dc4ab8c3c71889b3ff458e827
