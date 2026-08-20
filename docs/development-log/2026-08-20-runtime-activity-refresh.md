# Runtime Activity Refresh — 2026-08-20

## Batch
Wired canonical consumer activity events into the client runtime refresh bus.

## Implemented
- Location views publish `kleenest:location-activity`.
- Directions requests publish activity refreshes.
- Route starts publish activity refreshes.
- Approaching/arrival events publish activity refreshes.
- QR/check-ins publish activity refreshes with check-in identity.
- Check-outs publish activity refreshes.
- Review submissions publish activity refreshes.
- Favorite changes publish activity refreshes.

## Architecture
The Supabase RPC/event pipeline remains authoritative. Runtime events are only UI synchronization signals; they do not replace persistence or Live Network publication.

## Commit
799c0b660aaa7b54f999e83490648b068da9cbaa
