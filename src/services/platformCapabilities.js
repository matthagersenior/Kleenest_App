import { supabase } from '../lib/supabase';
import { getCurrentUser } from './auth';

async function call(name, args = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error('Sign in to continue.');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

export const consumer = {
  entitlements: () => call('get_current_user_product_entitlements'),
  tier: async () => {
    const user = await getCurrentUser();
    return user ? call('get_effective_consumer_tier', { p_user_id: user.id }) : null;
  },
  progression: () => call('get_progression_summary'),
  gamification: () => call('gamification_dashboard'),
  leaderboard: (limit = 25) => call('get_user_leaderboard', { p_limit: limit }),
  favorites: () => call('my_favorite_locations'),
  notifications: (limit = 50) => call('user_notifications', { p_limit: limit }),
  nearby: args => call('nearby_locations_enriched', args),
  location: locationId => call('get_location_details', { p_location_id: locationId }),
  intelligence: locationId => call('get_public_restroom_intelligence', { p_place_id: locationId }),
  occupancy: (locationId, windowMinutes = 30) => call('get_location_occupancy', { p_location_id: locationId, p_window_minutes: windowMinutes })
};

export const evidence = {
  locationConfidence: locationId => call('kleenest_location_confidence', { p_location_id: locationId }),
  verification: locationId => call('get_location_bathroom_verification', { p_location_id: locationId }),
  observation: args => call('record_location_observation', args),
  amenityObservation: args => call('submit_amenity_observation', args),
  photo: args => call('submit_location_photo_record', args),
  qualityObservation: args => call('submit_location_quality_observation', args),
  restroomObservation: args => call('submit_restroom_observation', args),
  refreshFeatureSummary: locationId => call('refresh_location_feature_summary', { p_location_id: locationId })
};

export const routing = {
  prepareDiscovery: args => call('prepare_route_discovery', args),
  createPlan: args => call('create_route_plan', args),
  completeRoute: args => call('complete_route', args),
  recordRouteEvent: args => call('record_location_route_event', args),
  recordFavoriteRoute: args => call('record_favorite_route_event', args),
  metrics: locationId => call('location_favorite_route_metrics', { p_location_id: locationId })
};

export const liveNetwork = {
  publishLocation: args => call('publish_intelligence_location_event', args),
  publishNotification: args => call('publish_location_notification', args),
  publishFleetRoute: args => call('publish_fleet_route_notification', args),
  nearbyRecipients: args => call('resolve_nearby_notification_recipients', args),
  createGeofence: args => call('create_gps_geofence_notification', args),
  notifications: limit => call('user_notifications', { p_limit: limit ?? 50 }),
  markRead: id => call('mark_notification_read', { p_notification_id: id })
};

export const gamification = {
  dashboard: () => call('gamification_dashboard'),
  progression: () => call('get_progression_summary'),
  leaderboard: (limit = 25) => call('get_user_leaderboard', { p_limit: limit }),
  recordActivity: args => call('record_gamification_activity', args),
  recordResult: args => call('record_game_result', args),
  completeChallenge: id => call('complete_progression_challenge', { p_challenge_id: id }),
  joinContest: id => call('join_contest', { p_contest_id: id }),
  submitContestEntry: args => call('submit_contest_entry', args),
  evaluateBadges: userId => call('evaluate_user_badges', { p_user_id: userId })
};

export const qr = {
  redeem: code => call('redeem_qr_code', { p_code: code }),
  verifyCheckin: args => call('verify_checkin', args),
  consumeSingleUse: (code, userId) => call('consume_single_use_qr', { p_code: code, p_user_id: userId }),
  recordAttribution: args => call('record_qr_attribution', args),
  resolveAction: code => call('resolve_custom_qr_action', { p_qr_code: code })
};

export const enterprise = {
  network: args => call('get_enterprise_partner_network', args),
  memberships: () => call('list_my_partner_memberships'),
  programs: () => call('list_my_demo_programs'),
  enableFleetService: userId => call('enable_enterprise_fleet_service', { p_user_id: userId }),
  partnerAnalytics: args => call('get_partner_network_benchmark', args),
  campaignRoi: args => call('get_partner_campaign_roi', args),
  allocationRoi: args => call('get_partner_allocation_roi', args),
  createNetwork: args => call('create_enterprise_partner_network', args),
  createCampaign: args => call('create_enterprise_partner_campaign', args),
  recordMetric: args => call('record_enterprise_partner_metric', args),
  recordOutcome: args => call('record_enterprise_partner_campaign_outcome', args)
};

export const fleet = {
  dashboard: businessId => call('fleet_dashboard_summary_v2', { p_business_id: businessId }),
  opportunities: businessId => call('fleet_service_opportunities_for_business', { p_business_id: businessId }),
  setVehicleStatus: args => call('fleet_set_vehicle_status', args),
  setDriverStatus: args => call('fleet_set_driver_status', args),
  setRouteStatus: args => call('fleet_set_route_status', args),
  completeMaintenance: args => call('fleet_complete_maintenance', args),
  resolveAlert: args => call('fleet_resolve_alert', args),
  hasAccess: businessId => call('has_fleet_access', { p_business_id: businessId })
};

export const business = {
  productAccess: businessId => call('get_business_product_access', { p_business_id: businessId }),
  managementContext: businessId => call('business_management_context', { p_business_id: businessId }),
  dashboard: (businessId, start, end) => call('business_dashboard_secure_summary', { p_business_id: businessId, p_start: start, p_end: end }),
  engagement: (businessId, start, end) => call('business_engagement_analytics', { p_business_id: businessId, p_start: start, p_end: end }),
  roi: (businessId, start, end) => call('business_roi_analytics', { p_business_id: businessId, p_start: start, p_end: end }),
  occupancy: (businessId, start, end) => call('business_occupancy_analytics', { p_business_id: businessId, p_start: start, p_end: end }),
  preferred: () => call('business_preferred_location_summary'),
  partner: (businessId, start, end) => call('business_partner_analytics', { p_business_id: businessId, p_start: start, p_end: end })
};

export const admin = {
  overview: () => call('admin_get_overview'),
  integrity: () => call('admin_data_integrity_summary'),
  reports: () => call('admin_list_reports'),
  pendingBusinesses: () => call('admin_list_pending_businesses'),
  users: query => call('admin_user_search', { p_query: query })
};

export const capabilityContracts = {
  maps: ['map_network_nearby_v1', 'get_location_details', 'kleenest_location_confidence'],
  evidence: ['record_location_observation', 'submit_amenity_observation', 'submit_restroom_observation', 'submit_location_quality_observation', 'submit_location_photo_record'],
  checkin: ['record_gps_checkin', 'kleenest_map_check_in', 'create_check_in', 'verify_checkin'],
  routing: ['create_route_plan', 'prepare_route_discovery', 'complete_route', 'record_location_route_event', 'record_favorite_route_event'],
  notifications: ['user_notifications', 'mark_notification_read', 'create_gps_geofence_notification', 'publish_intelligence_location_event'],
  gamification: ['gamification_dashboard', 'get_progression_summary', 'get_user_leaderboard', 'evaluate_user_badges', 'complete_progression_challenge'],
  business: ['business_dashboard_secure_summary', 'business_engagement_analytics', 'business_roi_analytics', 'business_occupancy_analytics'],
  enterprise: ['get_enterprise_partner_network', 'get_partner_network_benchmark', 'get_partner_campaign_roi', 'get_partner_allocation_roi'],
  fleet: ['fleet_dashboard_summary_v2', 'fleet_service_opportunities_for_business', 'fleet_set_vehicle_status', 'fleet_set_driver_status', 'fleet_set_route_status', 'fleet_complete_maintenance', 'fleet_resolve_alert'],
  qr: ['redeem_qr_code', 'verify_checkin', 'consume_single_use_qr', 'resolve_custom_qr_action'],
  admin: ['admin_get_overview', 'admin_data_integrity_summary', 'admin_list_reports', 'admin_list_pending_businesses', 'admin_user_search']
};

export const getCapabilityContract = code => capabilityContracts[code] || [];
