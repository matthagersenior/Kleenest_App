# Kleenest wiring ledger — 2026-08-22

Purpose: convert the completed architecture/interoperability audit into implementation order. This is a planning/traceability artifact; it does not replace existing feature contracts.

## Canonical wiring order

1. Shell + membership/workspace resolution
2. Consumer core: Map / Discover / Routes / Activity / Play / Community
3. Business workspace: Overview / Locations / Engage / Intelligence / Analytics
4. Fleet workspace: Operations / Routes / Performance / Opportunities / Goals
5. Enterprise workspace: Command / Partners / Campaigns / Performance / Fleet
6. Admin Control Room + membership-tier preview
7. Global notification/inbox/action routing
8. Realtime/offline/recovery behavior
9. Security/entitlement enforcement and CRUD test matrix

## Existing commit-to-capability ledger

| Commit | Capability | Existing implementation | Wiring destination | Action |
|---|---|---|---|---|
| `0d6f6e2c5760477dbda1740151885f70feb1725c` | Supabase capability parity center | `CapabilityCenterPage`, canonical runtime route | Admin/advanced diagnostics only | remove from ordinary consumer navigation; retain admin/dev utility |
| `a04c54dae22af18a762761b1b00095cdf6d29113` | Fleet + Enterprise RPC bridge | Fleet/enterprise service boundary | Fleet + Enterprise workspaces | preserve; expose through role-specific dashboards |
| `fe5384ac7066e6e...` | Fleet operational controls | service/action surface | Fleet Operations | preserve; make action results visible in live state |
| `dbe9dbee33aa455e0205d2ef0921cb9e2dfaa2bd` | route-stop intelligence | canonical route-event bridge | Fleet Routes + consumer Routes | preserve; shared route action model |
| `6332fbfa753c951cdb7e5d71d9af9c3821c1ea0f` | live notification producers | notification RPC consumers | global inbox + contextual alerts | preserve; contextualize by workspace |
| `69363b965b002cc71dacec54b0e1290b2ef92f2d` | live notification capability | contracts | global notification layer | preserve |
| `2e3cf6f02e3305bc591af78f31ffae01f3a6a166` | progression RPCs | action service | Consumer Play / Business Contests / Fleet Goals when explicitly configured | preserve; no direct Fleet auto-reward |
| `3be7e9d574ac9e5cf57b7e68b03b039e789e37e4` | badges/challenges | canonical rewards UI | Consumer Play | preserve |
| `bf438997f1bbec833cfaa9cb7d3c2f59aaf29ca9` | contribution evidence → reputation/milestones | evidence service | Consumer Activity / Community | preserve |
| `64a5fa6bcedca47e3ef827cfff1b33ed31eb8160` | location evidence visit | canonical visit RPC | Place detail / Evidence | preserve |
| `dbf12ba38146b1066f27baa9ddafda9396bfedef` | QR scanner | canonical check-in | Consumer Place / Activity | preserve |
| `8bcfa291146bb748e99a4910ef0e3fb172addbf6` | favorite route intelligence | canonical route-event bridge | Map / Place / Routes | preserve |
| `2621b9efdcea416371d176da1f742d3b0f7d052b` | parity updates | feature registry | architecture validation only | retain as audit artifact, not user nav |
| `3f6b7df49dc21b52aece4958a031b1a93fdc671c` | Fleet metric configuration service | `fleetMetricConfig` | Fleet Goals | extend with capability discovery + measurement + score/read model |

## Membership UI model

- Free: discovery, maps, routes, evidence, community, basic play; ads.
- Premium User ($5 one-time): consumer experience without ads + expanded convenience/engagement.
- Family ($20 one-time): Premium-style consumer experience with family-specific controls/visibility.
- Business Standard ($20/mo): growth/location basics + engagement.
- Business Growth ($50/mo): growth + campaigns/contests/analytics/intelligence.
- Enterprise: command center + partner networks + advanced data/campaigns/fleet.
- Fleet ($75/mo): concise operations, routes, performance, opportunities, goals.
- Admin: full CRUD/analytics/security controls + tier-preview mode for each membership/workspace.

## UI rules

- Branding is global and persistent.
- No generic feature-dump navigation.
- No capability center in consumer nav.
- Avoid banner boxes and oversized text blocks where an action/result card is more useful.
- Every visible button must map to a canonical action or navigation destination.
- Membership/workspace identity is visible without making permissions the UI itself.
- Consumer navigation is task-oriented and playful; Fleet is dense/concise; Business emphasizes growth/engagement; Enterprise emphasizes data/partnerships/campaigns; Admin emphasizes control/observability.
- Global notifications are contextual action cards that deep-link into the owning workspace.

## Fleet metric wiring contract

`fleetMetricConfig` should not read arbitrary tables directly from UI. The intended path is:

`get_fleet_metric_capabilities`
→ controller selects an authoritative capability
→ `create/update_fleet_metric_definition`
→ `assign_fleet_metric`
→ existing Fleet measurement/read-model functions
→ score/goal state
→ contextual notification/action when configured
→ optional Enterprise/Live Network/Feedback/Progression consumers

Progression is opt-in; operational facts do not automatically become user rewards.

## Next implementation batch

Build the shell/workspace resolver and canonical navigation model first. Then wire existing capability services into the appropriate workspace pages. Do not create replacement services for capabilities already listed above.
