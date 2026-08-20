# Search Activity — 2026-08-20

## Batch
Connected search/discovery telemetry to the canonical data-feature event pipeline and runtime activity bus.

## Implemented
- `recordSearch` now emits `kleenest:search-activity` after the canonical event is recorded.
- Search telemetry remains persisted through `record_data_feature_event`.
- Search activity is now available to intelligence/runtime consumers without introducing a second persistence system.
- Existing `LocationActivityBridge` remains registered through FeatureIntegration.

## Commits
f9a66c928120ea20444e0f527c798d69d6f186fc
0508586197c77d93a0b69da45ec62d5b3e09ce4a
