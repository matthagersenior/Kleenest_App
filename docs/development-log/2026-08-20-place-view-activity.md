# Place View Activity — 2026-08-20

## Batch
Connected the consumer Place Details route to the canonical location-view event pipeline without modifying the existing large AppRuntime surface.

## Implemented
- Added `LocationActivityBridge` as a global runtime component.
- Detects `/place/:id` navigation.
- Records `location_view` through the existing events service.
- Publishes the existing Live Network/runtime activity signal through that service.
- Uses a 30-second session guard to avoid duplicate StrictMode/navigation emissions.

## Architecture
The bridge is observational only. It does not create a second persistence system and does not replace canonical community/place services.

## Commits
070e909a434bbb8d2f357845db3ed52ac0f0a887
530f636fbe219b71c1c7cbdb394999a55581fa09
