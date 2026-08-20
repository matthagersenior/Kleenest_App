# Intelligence Actions — 2026-08-20

## Batch
Completed the Business Intelligence action loop.

## Implemented
- Demand opportunity creates a promotion through the canonical business service.
- Promotion creation emits a Live Network business-promotion event.
- Location attention emits the canonical location verification event.
- High-activity recommendations route directly to Fleet Review.
- Completed actions broadcast `kleenest:intelligence-updated` so Business Intelligence and Fleet surfaces refresh.
- Existing service contracts remain authoritative; no duplicate mutation layer was introduced.

## Commit
4b68af702c4fd8a01b69a46f48b25c25b5bff275
