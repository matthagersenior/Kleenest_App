export const WORKSPACE_ORDER = ['consumer', 'business', 'fleet', 'enterprise', 'admin'];

export const WORKSPACES = {
  consumer: { id: 'consumer', label: 'Kleenest', shortLabel: 'You', navigation: [
    { id: 'explore', label: 'Explore', path: '/map' }, { id: 'routes', label: 'Routes', path: '/routes' },
    { id: 'activity', label: 'Activity', path: '/profile' }, { id: 'play', label: 'Play', path: '/games' },
    { id: 'community', label: 'Community', path: '/social' }
  ]},
  business: { id: 'business', label: 'Business', shortLabel: 'Business', navigation: [
    { id: 'overview', label: 'Overview', path: '/business/dashboard' }, { id: 'locations', label: 'Locations', path: '/business/manage' },
    { id: 'engage', label: 'Engage', path: '/business/reviews' }, { id: 'intelligence', label: 'Intelligence', path: '/business/intelligence' },
    { id: 'analytics', label: 'Analytics', path: '/business/performance' }
  ]},
  fleet: { id: 'fleet', label: 'Fleet', shortLabel: 'Fleet', navigation: [
    { id: 'operations', label: 'Operations', path: '/fleet' }, { id: 'routes', label: 'Routes', path: '/routes' },
    { id: 'performance', label: 'Performance', path: '/fleet/performance' }, { id: 'opportunities', label: 'Opportunities', path: '/fleet/opportunities' },
    { id: 'goals', label: 'Goals', path: '/fleet/goals' }
  ]},
  enterprise: { id: 'enterprise', label: 'Enterprise', shortLabel: 'Enterprise', navigation: [
    { id: 'command', label: 'Command', path: '/enterprise' }, { id: 'partners', label: 'Partners', path: '/enterprise/partners' },
    { id: 'campaigns', label: 'Campaigns', path: '/enterprise/campaigns' }, { id: 'performance', label: 'Performance', path: '/enterprise/performance' },
    { id: 'fleet', label: 'Fleet', path: '/fleet' }
  ]},
  admin: { id: 'admin', label: 'Admin', shortLabel: 'Admin', navigation: [
    { id: 'control', label: 'Control Room', path: '/admin' }, { id: 'access', label: 'Users & Access', path: '/admin/users' },
    { id: 'trust', label: 'Content & Trust', path: '/admin/content' }, { id: 'data', label: 'Data', path: '/admin/data' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics' }, { id: 'preview', label: 'Tier Preview', path: '/admin/preview' }
  ]}
};

export const MEMBERSHIP_UI = {
  free: { label: 'Free', ads: true, workspace: 'consumer' }, premium: { label: 'Premium', ads: false, workspace: 'consumer' },
  family: { label: 'Family', ads: false, workspace: 'consumer' }, business_standard: { label: 'Business Standard', ads: false, workspace: 'business' },
  business_growth: { label: 'Business Growth', ads: false, workspace: 'business' }, business_enterprise: { label: 'Business Enterprise', ads: false, workspace: 'enterprise' },
  enterprise: { label: 'Enterprise', ads: false, workspace: 'enterprise' }, fleet: { label: 'Fleet', ads: false, workspace: 'fleet' },
  admin: { label: 'Admin', ads: false, workspace: 'admin' }
};

const first = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

export function normalizeMembership(raw = {}) {
  const source = raw?.data || raw?.entitlement || raw?.entitlements || raw;
  const tier = String(first(source?.membership_tier, source?.product_tier, source?.tier, source?.service_tier, source?.plan, 'free')).toLowerCase().replace(/[-\s]/g, '_');
  if (tier.includes('admin')) return 'admin'; if (tier.includes('enterprise')) return tier.includes('business') ? 'business_enterprise' : 'enterprise';
  if (tier.includes('fleet')) return 'fleet'; if (tier.includes('growth')) return 'business_growth';
  if (tier.includes('standard') && tier.includes('business')) return 'business_standard'; if (tier.includes('family')) return 'family';
  if (tier.includes('premium') || tier.includes('pro')) return 'premium'; return 'free';
}

export function getWorkspaceForMembership(membership) { return MEMBERSHIP_UI[membership]?.workspace || 'consumer'; }
export function getWorkspace(id) { return WORKSPACES[id] || WORKSPACES.consumer; }
export function getWorkspaceModel({ membership = 'free', workspace, businessId = null, isAdmin = false } = {}) {
  const resolvedMembership = normalizeMembership({ tier: membership }); const resolvedWorkspace = workspace || getWorkspaceForMembership(resolvedMembership);
  return { membership: resolvedMembership, membershipLabel: MEMBERSHIP_UI[resolvedMembership]?.label || 'Free', adsEnabled: MEMBERSHIP_UI[resolvedMembership]?.ads ?? true, workspace: getWorkspace(resolvedWorkspace), businessId, isAdmin, canPreviewTiers: isAdmin };
}
