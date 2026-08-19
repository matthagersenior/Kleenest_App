import { supabase } from '../lib/supabase';
import { reactionsForEvent } from './liveReactions';

const NOTIFICATION_TYPES = new Set([
  'arrival_notification',
  'reward_confirmation',
  'verification_confirmation',
  'verification_opportunity',
  'conflict_alert',
  'route_offer',
  'fleet_zone_alert',
  'fleet_arrival',
  'fleet_departure',
  'route_update',
  'task_confirmation'
]);

export async function materializeLiveReactions(event, userIds = []) {
  if (!supabase || !event?.id) return [];
  const reactionTypes = reactionsForEvent(event.event_type);
  if (!reactionTypes.length || !userIds.length) return [];
  const rows = reactionTypes.flatMap((reactionType) => userIds.map((userId) => ({
    event_id: event.id,
    user_id: userId,
    reaction_type: reactionType,
    location_id: event.location_id || null,
    payload: event.payload || {}
  })));
  const { data, error } = await supabase.from('live_network_reactions').insert(rows).select();
  if (error) throw error;
  return data || [];
}

export async function materializeNotificationsFromReactions(reactions = []) {
  if (!supabase || !reactions.length) return [];
  const rows = reactions
    .filter((reaction) => NOTIFICATION_TYPES.has(reaction.reaction_type))
    .map((reaction) => ({
      user_id: reaction.user_id,
      type: `live_${reaction.reaction_type}`,
      title: notificationTitle(reaction.reaction_type),
      body: notificationBody(reaction.reaction_type, reaction.payload),
      data: { event_id: reaction.event_id, location_id: reaction.location_id, reaction_id: reaction.id, ...(reaction.payload || {}) }
    }));
  if (!rows.length) return [];
  const { data, error } = await supabase.from('notifications').insert(rows).select();
  if (error) throw error;
  return data || [];
}

function notificationTitle(type) {
  const titles = {
    arrival_notification: 'You arrived',
    reward_confirmation: 'Check-in reward earned',
    verification_confirmation: 'Location verified',
    verification_opportunity: 'Help verify this location',
    conflict_alert: 'Location needs attention',
    route_offer: 'Opportunity along your route',
    fleet_zone_alert: 'Fleet zone alert',
    fleet_arrival: 'Fleet arrival recorded',
    fleet_departure: 'Fleet departure recorded',
    route_update: 'Route updated',
    task_confirmation: 'Task completed'
  };
  return titles[type] || 'Kleenest live update';
}

function notificationBody(type, payload = {}) {
  if (type === 'route_offer') return payload.offer_text || 'There is a Kleenest opportunity along your route.';
  if (type === 'verification_opportunity') return 'Verify this location and help keep Kleenest accurate.';
  if (type === 'conflict_alert') return 'Kleenest detected conflicting location information.';
  if (type === 'reward_confirmation') return `You earned ${Number(payload.points_awarded) || 0} points for checking in.`;
  return 'Kleenest has a new live update for you.';
}
