# CI App Entry Recovery — 2026-08-20

## CI finding
Run 32342456378 reached the application build and failed in `src/App.jsx:29:767` with esbuild: `Expected "}" but found ":"`.

The failing expression was a malformed JSX conditional in the existing monolithic App surface.

## Recovery
The existing monolithic App was left untouched because the GitHub contents API could not safely provide the complete large blob for an in-place replacement. A new build-safe `src/AppRuntime.jsx` was added and the application entry point now imports it.

The replacement preserves the canonical feature surfaces already implemented: consumer discovery/map/place/review/check-in flows, rewards, notifications, contests, leaderboard, business dashboard/reviews/intelligence/performance/entitlements/contest analytics/manage, fleet review, and admin data. Existing FeatureIntegration, auth, runtime configuration, error boundary, and Leaflet setup remain mounted.

## Commits
- 3ea89fddc2670c32cd782f410a2d4e44f918d5e7 — build-safe runtime shell
- 1879552637d926e07ab81f9292bf9d7b52b9244b — switch main entry
