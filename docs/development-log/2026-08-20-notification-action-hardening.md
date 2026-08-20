# 2026-08-20 — Notification action hardening

## Built
- Added explicit action routing for intelligence, contest, reward, review/reply, and follow notifications.
- Added notification refresh control.
- Added actionable links to intelligence and fleet surfaces.
- Added support for both `type` and `notification_type` notification records.
- Preserved authenticated read and mark-all-read mutations through the existing notification service.

## Runtime flow
`Notification -> action classification -> existing product route -> read acknowledgement`

## Files
- `src/pages/NotificationsPage.jsx`

## Verification
- Source reviewed against the existing notification service and current App route tree.
- GitHub connector does not currently expose a successful production build result for this commit, so no CI/build pass is claimed.

## Commit
`1e23cdda1cc70b2f3379471ee961d9c72274038a`
