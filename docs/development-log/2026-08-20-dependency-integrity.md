# Dependency Integrity — 2026-08-20

## Batch
Removed a stale Business Performance component dependency that was not present in the current repository tree.

## Implemented
- Removed the missing `BusinessLifecycleAnalytics` import.
- Removed the stale child component render.
- Kept the authoritative `getBusinessLifecycleAnalytics` service as the data source.
- Preserved live refresh from business analytics, location activity, and intelligence events.
- Preserved visible live-update status.

## Commit
`d8cfe64565ceb0fabef129dec541b27561706e27`
