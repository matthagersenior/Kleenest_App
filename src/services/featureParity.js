// Provenance map for the clean architecture. The reference snapshot is
// KleenestApp@a426c61348c5210b175ad9d62fcc0cf468cc6bfd.
// Keep this list aligned with the modular source; do not import the legacy
// global-script shell into the React application.
export const REFERENCE_SNAPSHOT = 'a426c61348c5210b175ad9d62fcc0cf468cc6bfd';

export const consumerParity = {
  mapDiscovery: 'existing',
  placeDetails: 'existing',
  categories: 'existing',
  checkIns: 'existing',
  rewards: 'existing',
  favorites: 'existing',
  notifications: 'existing',
  following: 'existing',
  amenities: 'existing',
  bathroomVerification: 'existing',
  routes: 'service-wired',
};

export const gamificationParity = {
  progression: 'existing-foundation',
  rewardHistory: 'existing',
  badges: 'next',
  challenges: 'next',
  leaderboards: 'existing',
};

export const businessParity = {
  locations: 'existing',
  reviews: 'existing',
  replies: 'existing',
  analytics: 'existing-foundation',
  qr: 'existing-foundation',
  promotions: 'existing',
  campaigns: 'existing',
  contests: 'existing',
  events: 'existing',
  engagementAttribution: 'existing-foundation',
  roi: 'next',
};

export const platformParity = {
  authentication: 'existing',
  routeAuthorization: 'existing',
  entitlements: 'existing',
  admin: 'existing-foundation',
  enterprise: 'next',
  commerce: 'next',
};
