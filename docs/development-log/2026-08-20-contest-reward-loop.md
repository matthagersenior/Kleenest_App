# Contest + Reward Loop

## Completed
- Contest participation now restores joined state from canonical contest scores after reload.
- Contest submissions now send a structured entry payload (`description`) to the canonical `submit_contest_entry` contract instead of passing a raw string.
- Successful contest submissions trigger the existing `kleenest:rewards-updated` event so the Rewards surface can refresh immediately.
- Existing contest service progression recording remains the canonical reward/intelligence bridge.

## Verification
- Reviewed `src/services/contests.js` and `src/pages/ContestsPage.jsx` against the current main revision.
- Change committed directly to `main`.
- GitHub Actions status was not available during this batch, so no build-pass claim is made.

## Commit
`dbde5d9991378106271b82d07e77a2a520c97e76`

## Next
Continue the lifecycle sweep across business contest management, rewards, reviews, check-ins, and remaining route/action gaps.
