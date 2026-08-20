# Check-in + Review Runtime Wiring

## Completed
- Check-ins now emit `kleenest:checkin-created` after the canonical `create_check_in` RPC succeeds.
- Successful check-ins emit `kleenest:rewards-updated` so rewards surfaces can refresh without polling.
- Existing canonical check-in event, business engagement, and reward synchronization contracts remain authoritative.
- Review creation emits `kleenest:review-created` and `kleenest:rewards-updated` after the canonical review RPC succeeds.
- Restroom observations emit `kleenest:observation-created` after persistence.
- Review replies, likes, photo changes, deletion, and favorites emit lightweight runtime refresh events.
- No alternate persistence path or parallel event model was introduced.

## Source of truth
`src/services/checkins.js` and `src/services/community.js` continue to use the existing Supabase RPCs and canonical event services.

## Commits
- Check-in runtime wiring: `b2f966966def9554fb18b601625a2b68e40cdd8a`
- Review/community runtime wiring: `b083a14772ee0a4d913b8e5f52053a9ed2f5cc8f`

## Verification
GitHub write operations succeeded. CI/build status was not asserted because no fresh workflow result was available during this batch.

## Next
Complete the final cross-surface refresh wiring and production route/action consistency sweep.
