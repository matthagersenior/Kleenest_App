# Intelligence Contract Fix — 2026-08-20

Corrected the Business Intelligence action to use the canonical `BUSINESS_OFFER_STARTED` Live Network event type already defined by `liveNetwork.js`. Removed the unsupported `businessId` argument from `publishLiveEvent` and set the actor type to `business`.

Commit: afcd26a5521aee7e6d2fbd2fd2a1a6d74609135f