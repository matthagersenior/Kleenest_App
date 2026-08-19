export const BUSINESS_PLANS = Object.freeze({
  standard: Object.freeze({
    key: 'standard',
    label: 'Standard',
    features: ['profile', 'locations', 'reviews', 'basic_analytics'],
  }),
  growth: Object.freeze({
    key: 'growth',
    label: 'Growth',
    features: ['profile', 'locations', 'reviews', 'basic_analytics', 'qr', 'campaigns', 'promotions', 'events', 'contests', 'advanced_analytics'],
  }),
  enterprise: Object.freeze({
    key: 'enterprise',
    label: 'Enterprise',
    features: ['profile', 'locations', 'reviews', 'basic_analytics', 'qr', 'campaigns', 'promotions', 'events', 'contests', 'advanced_analytics', 'multi_location', 'priority_support'],
  }),
});

export function normalizeBusinessPlan(value) {
  const key = String(value || 'standard').toLowerCase();
  return BUSINESS_PLANS[key] || BUSINESS_PLANS.standard;
}

export function hasBusinessFeature(plan, feature) {
  return normalizeBusinessPlan(plan).features.includes(feature);
}

export function requireBusinessFeature(plan, feature) {
  const normalized = normalizeBusinessPlan(plan);
  if (!normalized.features.includes(feature)) {
    const error = new Error(`${normalized.label} plan does not include ${feature}.`);
    error.code = 'FEATURE_NOT_ENTITLED';
    error.feature = feature;
    error.plan = normalized.key;
    throw error;
  }
  return true;
}

export function businessPlanSummary(plan) {
  const normalized = normalizeBusinessPlan(plan);
  return {
    key: normalized.key,
    label: normalized.label,
    features: [...normalized.features],
  };
}
