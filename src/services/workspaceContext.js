import { supabase } from '../lib/supabase';
import { getCurrentUser } from './auth';
import { consumer, business, enterprise, fleet, admin } from './platformCapabilities';
import { normalizeMembership, getWorkspaceForMembership, getWorkspaceModel } from '../domain/workspaces';

const rpc = async (name, args = {}) => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
};

const rows = value => Array.isArray(value) ? value : value ? [value] : [];
const hasFleet = value => rows(value).some(row => row?.fleet_enabled === true || row?.has_fleet_access === true || row?.service === 'fleet');
const hasEnterprise = value => rows(value).some(row => row?.enterprise_fleet_enabled === true || row?.enterprise_enabled === true || String(row?.tier || '').toLowerCase().includes('enterprise'));

export async function resolveWorkspaceContext({ businessId = null, requestedWorkspace = null } = {}) {
  const user = await getCurrentUser();
  if (!user) return getWorkspaceModel();

  const [entitlements, consumerTier] = await Promise.all([
    consumer.entitlements().catch(() => null),
    consumer.tier().catch(() => null)
  ]);

  const membership = normalizeMembership(consumerTier || entitlements);
  let resolvedBusinessId = businessId;
  let businessAccess = null;
  let fleetAccess = false;
  let enterpriseAccess = false;

  if (resolvedBusinessId) {
    businessAccess = await business.productAccess(resolvedBusinessId).catch(() => null);
    fleetAccess = await fleet.hasAccess(resolvedBusinessId).catch(() => false);
    enterpriseAccess = hasEnterprise(businessAccess) || hasEnterprise(entitlements);
  }

  const adminState = await admin.overview().catch(() => null);
  const isAdmin = Boolean(user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin' || adminState?.is_admin === true || adminState?.user?.is_admin === true);

  const available = ['consumer'];
  if (businessAccess) available.push('business');
  if (fleetAccess || membership === 'fleet') available.push('fleet');
  if (enterpriseAccess || membership === 'enterprise' || membership === 'business_enterprise') available.push('enterprise');
  if (isAdmin) available.push('admin');

  const requestedAllowed = requestedWorkspace && available.includes(requestedWorkspace);
  const workspace = requestedAllowed ? requestedWorkspace : getWorkspaceForMembership(membership);
  const fallbackWorkspace = available.includes(workspace) ? workspace : 'consumer';

  return {
    ...getWorkspaceModel({ membership, workspace: fallbackWorkspace, businessId: resolvedBusinessId, isAdmin }),
    userId: user.id,
    profile: user,
    entitlements,
    consumerTier,
    businessAccess,
    availableWorkspaces: [...new Set(available)],
    fleetAccess,
    enterpriseAccess,
    requestedWorkspace,
    contextVersion: '2026-08-22.1'
  };
}

export async function resolveBusinessWorkspaces() {
  const data = await rpc('business_management_context').catch(() => null);
  return rows(data);
}

export function canUseWorkspace(context, workspace) {
  return Boolean(context?.availableWorkspaces?.includes(workspace));
}
