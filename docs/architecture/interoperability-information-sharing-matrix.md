# Kleenest Interoperability & Information-Sharing Matrix

## Authority

- Product source: `matthagersenior/Kleenest_App` / `main`
- Backend capability authority: Production Supabase
- Canonical map ownership: `main.jsx` → `CanonicalAppRuntime` → `MapWorkspace` → `MapSurface`
- Capability/parity surface: `CapabilityCenterPage` + `platformCapabilities.js`
- Legacy/reference repositories and branches are not product authorities.

## Core information-sharing matrix

| Domain | Canonical producer | Shared information | Canonical consumers | Supabase contract families | UI termination |
|---|---|---|---|---|---|
| Locations | Universal discovery / location services | location identity, coordinates, category, brand, confidence | Map, Place, Route, Business, Fleet | nearby/location details/confidence | Map / Place |
| Evidence | Location evidence + contribution services | visits, observations, amenities, restroom quality, verification, photos | Place, Map intelligence, Reputation, Business evidence | record/submit/verification/photo RPCs | Evidence panels / contribution actions |
| Favorites | Favorites service | favorite state, route-event signals | Map, Place, Route, intelligence | favorite/location route RPCs | Favorite controls |
| Routing | Route plans + route discovery | route identity, stops, events, completion state | Map, Route Planner, Fleet | create/discovery/event/completion RPCs | Route actions |
| Offline | Offline packs / queues | cached locations, queued observations/arrivals | Map, Evidence, Route | offline pack/discovery contracts | Offline controls |
| Intelligence | Location intelligence / network services | confidence, quality, demand, occupancy, operational signals | Map, Place, Business, Fleet | intelligence/location analytics RPCs | Intelligence panels/actions |
| Live Network | Live network + notifications | network events, nearby recipients, notifications, delivery state | Notifications, Map, Business, Fleet | publish/geofence/queue/delivery RPCs | Notification actions |
| Gamification | Progression/rewards services | points, progression, streaks, badges, challenges, contest results | Profile, Rewards, Leaderboard, Challenges | progression/gamification RPCs | Progression actions |
| QR / Check-in | QR/check-in services | QR identity, attribution, verification, redemption | Place, Business, Campaigns, Rewards | redeem/verify/attribution/action RPCs | Scanner / check-in actions |
| Business | Business services | managed locations, campaigns, promotions, events, analytics, ROI | Business dashboard, intelligence actions | business analytics/action RPCs | Business controls |
| Enterprise | Enterprise services | networks, memberships, partner programs, allocations, outcomes | Enterprise command center, Business | partner/network/ROI RPCs | Enterprise actions |
| Fleet | Fleet bridge/services | vehicles, drivers, routes, maintenance, alerts, opportunities | Fleet Operations, Enterprise, location intelligence | fleet RPCs | Fleet controls |
| Admin | Admin services | users, businesses, reports, integrity, operational state | Admin surfaces, moderation | admin RPCs | Admin controls |

## Interoperability rules

1. A location record is the shared identity across consumer, evidence, routing, Business, Enterprise, and Fleet. Do not create parallel location identities for the same physical place.
2. Route events reference canonical location identity and feed both consumer route intelligence and Fleet/enterprise operational intelligence.
3. Evidence is shared intelligence, not a separate competing category system. Verification, quality, amenities, restroom observations, photos, and visits enrich the same location record.
4. Notifications consume network/intelligence events; they do not become a second source of location truth.
5. Gamification consumes verified user activity/results. It must not invent alternate contribution state.
6. Business and Enterprise analytics consume the same location/evidence/network facts used by consumer and Fleet surfaces.
7. Fleet consumes location and route intelligence; Fleet must not introduce a second map/runtime or competing location model.
8. Entitlements are enforced at the capability boundary and reflected in UI availability.
9. Every mutation exposed by UI must terminate in an authoritative Supabase mutation/RPC or an explicitly documented local/offline queue that replays into one.
10. Cached/offline data is transport/storage state, never a competing authority.

## Conflict audit

### Runtime

`CanonicalAppRuntime` is the production entry point. `App.jsx` is only a compatibility re-export, and `main.jsx` boots `CanonicalAppRuntime`. However, `CanonicalAppRuntime` still lazy-loads `AppRuntime.jsx` for non-canonical paths. This is an architectural interoperability risk: `AppRuntime.jsx` is a legacy runtime implementation and should be progressively absorbed into the canonical runtime, not treated as a second product runtime.

### Map

No competing `MapSurface`/`NetworkShell` implementation is currently exposed by the active branch search. The canonical map path remains `CanonicalAppRuntime` → `MapWorkspace` → `MapSurface`.

### Capability contract

`platformCapabilities.js` is the cross-domain RPC contract registry. It currently covers consumer, evidence, routing, live network, gamification, QR, enterprise, Fleet, Business, and Admin. New service modules should consume these canonical contracts where practical instead of creating duplicate RPC wrappers.

### Data interoperability

The highest-risk duplication points are location identity, route identity, evidence state, and notification state. These must remain keyed to Supabase canonical IDs and contracts. Do not normalize them into independent client-side domain stores that can drift.

## Parity checklist

For each Supabase capability:

`Supabase capability → existing canonical service → shared data identity → UI surface → working button/action → entitlement/identity → result/error → offline/realtime behavior → CI`

A capability is not considered complete merely because a service wrapper exists.
