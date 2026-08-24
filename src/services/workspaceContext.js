import { consumer, business, fleet, admin } from './platformCapabilities';
import { normalizeMembership, getWorkspaceForMembership, getWorkspaceModel } from '../domain/workspaces';

const rows = value => Array.isArray(value) ? value : value ? [value] : [];
const hasEnterprise = value => rows(value).some(row => row?.enterprise_enabled === true || row?.enterprise_fleet_enabled === true || String(row?.service_tier || row?.tier || '').toLowerCase().includes('enterprise'));

export async function resolveWorkspaceContext({ user, profile = null, entitlements = [], businessId = null, requestedWorkspace = null } = {}) {
  if (!user) return getWorkspaceModel();
  const [resolvedEntitlements, consumerTier] = await Promise.all([
    entitlements?.length ? Promise.resolve(entitlements) : consumer.entitlements().catch(() => []),
    consumer.tier().catch(() => null)
  ]);
  const membership = normalizeMembership(consumerTier || resolvedEntitlements || profile);
  const resolvedBusinessId = businessId || profile?.business_id || null;
  let businessAccess = null;
  let fleetAccess = false;
  let enterpriseAccess = hasEnterprise(resolvedEntitlements);
  if (resolvedBusinessId) {
    [businessAccess, fleetAccess] = await Promise.all([
      business.productAccess(resolvedBusinessId).catch(() => null),
      fleet.hasAccess(resolvedBusinessId).catch(() => false)
    ]);
    enterpriseAccess = enterpriseAccess || hasEnterprise(businessAccess);
  }
  const adminState = await admin.overview().catch(() => null);
  const isAdmin = Boolean(user.app_metadata?.role === 'admin' || profile?.role === 'admin' || adminState?.is_admin === true || adminState?.user?.is_admin === true);
  const capabilities = ['consumer'];
  if (businessAccess) capabilities.push('business');
  if (fleetAccess || membership === 'fleet') capabilities.push('fleet');
  if (enterpriseAccess || membership === 'enterprise' || membership === 'business_enterprise') capabilities.push('enterprise');
  if (isAdmin) capabilities.push('admin');
  const availableWorkspaces = [...new Set(capabilities)];
  const requestedAllowed = requestedWorkspace && availableWorkspaces.includes(requestedWorkspace);
  const membershipWorkspace = getWorkspaceForMembership(membership);
  const workspace = requestedAllowed ? requestedWorkspace : (availableWorkspaces.includes(membershipWorkspace) ? membershipWorkspace : 'consumer');
  return Object.freeze({
    ...getWorkspaceModel({ membership, workspace, businessId: resolvedBusinessId, capabilities }),
    userId: user.id, profile, entitlements: resolvedEntitlements, consumerTier, businessAccess,
    fleetAccess, enterpriseAccess, availableWorkspaces, requestedWorkspace, isAdmin,
    contextVersion: '2026-08-22.2'
  });
}

export function canUseWorkspace(context, workspace) { return Boolean(context?.availableWorkspaces?.includes(workspace)); }
