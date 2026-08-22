import { supabase } from '../lib/supabase';

async function rpc(name, args = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Sign in to continue.');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

const array = value => Array.isArray(value) ? value : (value && typeof value === 'object' ? Object.values(value).filter(Boolean) : []);

export const getFleetDashboard = businessId => rpc('fleet_dashboard_summary_v2', { p_business_id: businessId });
export const getFleetServiceOpportunities = businessId => rpc('fleet_service_opportunities_for_business', { p_business_id: businessId });
export const hasFleetAccess = businessId => rpc('has_fleet_access', { p_business_id: businessId });
export const enableEnterpriseFleetService = userId => rpc('enable_enterprise_fleet_service', { p_user_id: userId });
export const setFleetVehicleStatus = (businessId, vehicleId, status) => rpc('fleet_set_vehicle_status', { p_business_id: businessId, p_vehicle_id: vehicleId, p_status: status });
export const setFleetDriverStatus = (businessId, driverId, status) => rpc('fleet_set_driver_status', { p_business_id: businessId, p_driver_id: driverId, p_status: status });
export const setFleetRouteStatus = (businessId, routeId, status) => rpc('fleet_set_route_status', { p_business_id: businessId, p_route_id: routeId, p_status: status });
export const completeFleetMaintenance = (businessId, maintenanceId, notes = '') => rpc('fleet_complete_maintenance', { p_business_id: businessId, p_maintenance_id: maintenanceId, p_notes: notes });
export const resolveFleetAlert = (businessId, alertId, resolution) => rpc('fleet_resolve_alert', { p_business_id: businessId, p_alert_id: alertId, p_resolution: resolution });
export const publishFleetRouteNotification = (routeId, eventType, title, body, payload = {}) => rpc('publish_fleet_route_notification', { p_route_id: routeId, p_event_type: eventType, p_title: title, p_body: body, p_payload: payload });

export const createEnterpriseNetwork = name => rpc('create_enterprise_partner_network', { p_name: name });
export const getEnterpriseNetwork = (networkId, start, end) => rpc('get_enterprise_partner_network', { p_network_id: networkId, p_start: start, p_end: end });
export const listMyPartnerMemberships = () => rpc('list_my_partner_memberships');
export const joinPartnerProgram = programId => rpc('join_partner_program', { p_program_id: programId });
export const setEnterprisePartnerStatus = (membershipId, status) => rpc('set_enterprise_partner_status', { p_membership_id: membershipId, p_status: status });
export const createBusinessPartnerProgram = (businessId, name, preferredAccess = false, matchDiscountBonus = 0, customPerk = '') => rpc('create_business_partner_program', { p_business_id: businessId, p_name: name, p_preferred_access: preferredAccess, p_match_discount_bonus: matchDiscountBonus, p_custom_perk: customPerk });
export const listBusinessPartnerPrograms = () => rpc('business_list_partner_programs');
export const businessSetPartnerProgramAccess = (programId, preferredAccess) => rpc('business_set_partner_program_access', { p_partner_program_id: programId, p_preferred_access: preferredAccess });
export const businessSetPartnerEnabled = (businessId, programId, enabled) => rpc('business_set_partner_enabled', { p_business_id: businessId, p_program_id: programId, p_enabled: enabled });
export const requestPartnerAgreement = (programId, partnerBusinessId) => rpc('business_request_partner_agreement', { p_partner_program_id: programId, p_partner_business_id: partnerBusinessId });
export const acceptPartnerAgreement = agreementId => rpc('accept_partner_agreement', { p_agreement_id: agreementId });
export const getPartnerAnalytics = (businessId, start, end) => rpc('business_partner_analytics', { p_business_id: businessId, p_start: start, p_end: end });
export const getPartnerDetail = (businessId, start, end) => rpc('business_partner_detail', { p_business_id: businessId, p_start: start, p_end: end });
export const getPartnerUsage = programId => rpc('business_partner_program_usage', { p_partner_program_id: programId });
export const getPartnerCampaignRoi = (campaignId, start, end) => rpc('get_partner_campaign_roi', { p_campaign_id: campaignId, p_start: start, p_end: end });
export const getPartnerNetworkBenchmark = (networkId, start, end) => rpc('get_partner_network_benchmark', { p_network_id: networkId, p_start: start, p_end: end });
export const getPartnerAllocationRoi = (networkId, start, end) => rpc('get_partner_allocation_roi', { p_network_id: networkId, p_start: start, p_end: end });
export const recordPartnerMetric = (networkId, date, metrics = {}) => rpc('record_enterprise_partner_metric', { p_network_id: networkId, p_metric_date: date, p_visits: Number(metrics.visits || 0), p_check_ins: Number(metrics.checkIns || 0), p_reviews: Number(metrics.reviews || 0), p_preferred_uses: Number(metrics.preferredUses || 0), p_access_redemptions: Number(metrics.accessRedemptions || 0), p_promotion_redemptions: Number(metrics.promotionRedemptions || 0) });
export const recordPartnerCampaignOutcome = (campaignId, partnerBusinessId, metrics = {}) => rpc('record_enterprise_partner_campaign_outcome', { p_campaign_id: campaignId, p_partner_business_id: partnerBusinessId, p_visits: Number(metrics.visits || 0), p_check_ins: Number(metrics.checkIns || 0), p_reviews: Number(metrics.reviews || 0), p_preferred_uses: Number(metrics.preferredUses || 0), p_access_redemptions: Number(metrics.accessRedemptions || 0), p_promotion_redemptions: Number(metrics.promotionRedemptions || 0), p_attributed_users: Number(metrics.attributedUsers || 0), p_points_awarded: Number(metrics.pointsAwarded || 0) });

export function normalizeFleetSummary(value) {
  const summary = value && typeof value === 'object' ? value : {};
  return { raw: summary, vehicles: array(summary.vehicles), drivers: array(summary.drivers), routes: array(summary.routes), alerts: array(summary.alerts), maintenance: array(summary.maintenance), opportunities: array(summary.opportunities), metrics: summary.metrics || summary.summary || {} };
}
