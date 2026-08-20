# QR → Check-in → Rewards → Business Analytics — 2026-08-20

## Batch
Closed the consumer QR/check-in attribution loop into business analytics refresh.

## Implemented
- Canonical check-in RPC remains the sole check-in mutation path.
- QR check-ins now record canonical QR attribution when a token is present.
- Existing reward synchronization remains active.
- Business engagement attribution remains active and entitlement-gated.
- Check-ins emit `kleenest:business-analytics-updated`.
- Business Performance listens for QR/check-in analytics activity, location activity, and intelligence updates and refreshes automatically.
- Added a visible live-update state on Business Performance.

## Commits
1bd81584df4fa6c9095fbc56a47143740be74102
02a3840c6416af703a5a2e525125a8f30654b59d
