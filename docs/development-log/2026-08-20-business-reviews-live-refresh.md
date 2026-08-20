# Business Reviews Live Refresh — 2026-08-20

## Batch
Connected the business review workspace to the shared runtime refresh bus.

## Implemented
- Review workspace refreshes after location activity/intelligence updates.
- Published review replies emit `kleenest:intelligence-updated` so downstream business intelligence surfaces can refresh.
- Added a transient Updated indicator for externally-triggered refreshes.
- Canonical business review RPCs remain authoritative.

## Commit
97e5b25f587f3d1b35d1ac98e1b39891a993ad1c
