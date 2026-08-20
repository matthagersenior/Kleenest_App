# 2026-08-19 — Consumer Intelligence Map

## Built
- Upgraded the live map popup from a basic location marker into a consumer-facing intelligence surface.
- Exposes trust signal, demand, activity, quality, and freshness when the canonical location intelligence snapshot provides those values.
- Preserves the existing place-details route as the deeper intelligence surface.
- Changed the primary map navigation action from a generic directions action to `Start route`.

## Wired
- Map route actions now record `directions_requested` and `route_started` through the existing event service before opening the external navigation handoff.
- Arrival continues to record the canonical arrival event.
- No duplicate intelligence store or competing event pipeline was introduced.

## Verification
- Code was updated against the current `main` revision of `src/components/MapSurface.jsx`.
- GitHub Actions reports no workflow run attached to this batch yet, so CI is not being represented as passed.

## Commits
- `ca05037391e16b9c215aba30e530af162c5e30aa` — consumer intelligence map wiring
- `b063e4b482e37c9a17e431f1696f4b78c569b117` — quality signal normalization

## Next
- Complete the fleet operational intelligence surface and then perform a cross-surface verification pass covering Business → Consumer → Fleet event flow.
