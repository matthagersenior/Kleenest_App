# Workspace wiring status — 2026-08-22

The membership/workspace foundation is now implemented as additive architecture primitives.

## Added

- `src/domain/workspaces.js` — canonical workspace taxonomy, membership UI identity, ad state, and navigation contracts.
- `src/services/workspaceContext.js` — server-authoritative context resolver using existing Supabase entitlement, business access, Fleet access, Enterprise signals, and admin capabilities.
- `src/components/WorkspaceNavigation.jsx` — membership-aware navigation component with branding, membership identity, workspace switching, and global notifications.

## Current product model

Consumer: Explore / Routes / Activity / Play / Community
Business: Overview / Locations / Engage / Intelligence / Analytics
Fleet: Operations / Routes / Performance / Opportunities / Goals
Enterprise: Command / Partners / Campaigns / Performance / Fleet
Admin: Control Room / Users & Access / Content & Trust / Data / Analytics / Tier Preview

## Important implementation rule

These files are intentionally additive. The existing AppRuntime remains the canonical route owner until the navigation migration is applied. No existing route was deleted or renamed in this batch.

The next wiring pass should mount `WorkspaceNavigation` at the shell level and replace legacy navigation presentation only after every existing destination has a canonical route or redirect. This prevents broken links while the product taxonomy changes.

## Security

Workspace availability is derived from server-side Supabase capability boundaries. The UI may hide unavailable workspaces but is never the authorization boundary. Existing RouteGuard/domain capability checks remain authoritative.

## Membership UX

Free and Premium/Family remain Consumer workspaces. Business/Fleet/Enterprise workspace access is additive and capability-gated. Admin receives a dedicated preview workspace rather than impersonating another user's permissions.

Ads are represented as membership presentation state (`adsEnabled`) and should be implemented through the existing ad capability/configuration system rather than hardcoded into individual pages.
