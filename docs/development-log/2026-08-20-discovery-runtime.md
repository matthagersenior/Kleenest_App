# Discovery Runtime — 2026-08-20

## Batch
Wired the active discovery surface in `AppRuntime.jsx` to the canonical search telemetry service.

## Implemented
- Map category/filter result loads now emit canonical search activity.
- Discover result loads now emit canonical search activity.
- Result IDs and result counts are passed into `recordSearch`.
- Recommended home-restroom hydration is excluded from search telemetry to avoid treating passive home loading as an explicit discovery action.
- No second event persistence path was introduced.

## Commit
1f25785ab9c5124b58fb96ac0506ac6e604ecde7
