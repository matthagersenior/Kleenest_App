# Contest lifecycle wiring — 2026-08-20

## Batch
Business contest analytics ↔ consumer contest surface.

## Changes
- Added a direct `Consumer contests` action to Business Contest Analytics.
- Kept business analytics on the existing `businessLifecycle` and entitlement contracts.
- Preserved the consumer contest page as the canonical participation surface.
- This makes the business measurement surface and consumer action surface navigable as one lifecycle.

## Canonical flow
Business publishes/manages contests → consumers join and submit entries → contest/reward data accumulates → business analytics reads the lifecycle → business can jump back to the consumer contest experience.

## Commit
1f4c94cb5739c19d7fac0c733797e32d5e450e10

## Verification
The GitHub write succeeded. CI/build status was not asserted because no fresh workflow result was available from this operation.

## Next
Continue the large lifecycle sweep across QR/check-in, reviews, rewards, and intelligence event emission, then run a final route/action consistency pass.
