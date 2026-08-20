const ROLE_CAPABILITIES = {
  consumer: ['consumer'],
  user: ['consumer'],
  premium: ['consumer', 'premium'],
  business: ['consumer', 'business'],
  owner: ['consumer', 'business'],
  fleet: ['consumer', 'fleet'],
  admin: ['consumer', 'admin', 'business', 'fleet'],
  platform_admin: ['consumer', 'admin', 'business', 'fleet'],
  super_admin: ['consumer', 'admin', 'business', 'fleet'],
};

export function normalizeCapabilities(profile) {
  const role = String(profile?.role || '').trim().toLowerCase();
  const capabilities = new Set(ROLE_CAPABILITIES[role] || ['consumer']);
  if (profile?.subscription_tier && String(profile.subscription_tier).toLowerCase() !== 'free') capabilities.add('premium');
  if (profile?.is_business_user) capabilities.add('business');
  if (profile?.is_admin) {
    capabilities.add('admin');
    capabilities.add('business');
    capabilities.add('fleet');
  }
  return Object.freeze([...capabilities]);
}

export function hasCapability(capabilities, capability) {
  return Array.isArray(capabilities) && capabilities.includes(capability);
}

export function hasAnyCapability(capabilities, required = []) {
  return required.length === 0 || required.some(capability => hasCapability(capabilities, capability));
}
