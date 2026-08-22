# Route inventory and wiring gate — 2026-08-22

The current runtime is a transitional architecture. `CanonicalAppRuntime` still contains pathname conditionals while the canonical workspace shell is being introduced. This document prevents the redesign from inventing destinations that do not exist.

## Verified current destinations

- `/` — canonical consumer runtime
- `/discover` — canonical consumer runtime
- `/place/:id` — canonical consumer runtime
- `/profile` — canonical consumer runtime
- `/check-in` — canonical consumer runtime
- `/business` — canonical consumer runtime
- `/map` — canonical Map workspace
- `/route` — Route Planner workspace
- `/fleet-operations` — Fleet Operations workspace
- `/capabilities` — Admin-only Capability Center

## Transitional rule

Do not expose a navigation item until its destination is implemented and reachable. Workspace names such as Fleet Goals, Enterprise Campaigns, Business Intelligence, Admin Data, etc. are product destinations, not yet verified route contracts.

## Target route/workspace model

Consumer:
- `/` Explore
- `/routes` Routes
- `/activity` Activity
- `/play` Play
- `/community` Community

Business:
- `/business` Overview
- `/business/locations`
- `/business/engage`
- `/business/intelligence`
- `/business/analytics`

Fleet:
- `/fleet` Operations
- `/fleet/routes`
- `/fleet/performance`
- `/fleet/opportunities`
- `/fleet/goals`

Enterprise:
- `/enterprise` Command
- `/enterprise/partners`
- `/enterprise/campaigns`
- `/enterprise/performance`
- `/enterprise/fleet`

Admin:
- `/admin`
- `/admin/users`
- `/admin/businesses`
- `/admin/content`
- `/admin/data`
- `/admin/analytics`
- `/admin/preview`
- `/capabilities`

## Migration rule

Existing verified routes remain valid during migration. New target routes are introduced only with a real component, route registration, entitlement/authorization guard where required, loading/error/empty states, and a working action path. Legacy destinations receive explicit redirects/aliases before removal.

## UI gate

Every destination must use the canonical workspace shell and preserve global branding, membership/workspace identity, notifications, responsive behavior, and action routing. Capability-center navigation remains admin-only; the existing runtime already protects `/capabilities` with `CAPABILITIES.ADMIN`. 

## Next batch

Implement the consumer workspace route group first because it is the broadest shared surface. Move existing Map/Route/Place/Profile/Check-in functionality into organic destinations without duplicating services. Then Business/Fleet/Enterprise/Admin groups can follow the same contract.
