# QR Check-in Runtime — 2026-08-20

## Batch
Closed the QR-token handoff between supported QR links and the canonical check-in service.

## Implemented
- `community.checkIn()` reads `qr`, `qr_token`, or `token` from the current URL when a token is not explicitly supplied.
- The canonical `create_check_in` RPC remains the only persistence/mutation path.
- Existing reward synchronization, business engagement, Live Network event, and runtime refresh hooks remain intact.
- QR links can hand the token into the existing `/check-in` surface without introducing another scanner/check-in implementation.

## Commit
9377517a9d638c5c2d14caf247d9a9a99d25f742
