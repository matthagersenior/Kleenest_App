# Intelligence Runtime Surfaces — 2026-08-20

## Batch
Connected Business Intelligence and Fleet Review to the shared runtime activity and Live Network refresh paths.

## Implemented
- Business Intelligence refreshes on relevant live location/user/business/fleet events.
- Business Intelligence responds to local location/intelligence refresh signals.
- Fleet Review refreshes on location activity and intelligence updates.
- Fleet Review continues subscribing to live fleet events.
- Fleet recommendations remain derived from the canonical intelligence service.
- No duplicate persistence layer was introduced.

## Verification
CI #112 exposed a workflow-cache configuration failure before the application build ran. The npm cache dependency was removed in commit 38469671d459326cf1d73325138620328a56f15e. This batch should be verified by the next Actions run.

## Commits
66d604888a778935ab5c7e2e32c8da8bf3a10987
5e6e68935fe0f196aa72a1b87c252da5f2d8798a
