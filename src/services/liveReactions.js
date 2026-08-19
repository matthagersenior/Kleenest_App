import { LIVE_EVENT_TYPES, subscribeToLiveEvents } from './liveNetwork';

export const LIVE_REACTION_TYPES = Object.freeze({
  NOTIFICATION: 'notification',
  ROUTE_OPPORTUNITY: 'route_opportunity',
  VERIFICATION_OPPORTUNITY: 'verification_opportunity',
  FLEET_ALERT: 'fleet_alert',
  BUSINESS_OPPORTUNITY: 'business_opportunity'
});

const REACTION_RULES = Object.freeze({
  [LIVE_EVENT_TYPES.USER_APPROACHING_LOCATION]: [LIVE_REACTION_TYPES.ROUTE_OPPORTUNITY],
  [LIVE_EVENT_TYPES.USER_ARRIVED]: [LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.USER_DEPARTED]: [LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.QR_CHECK_IN]: [LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.LOCATION_VERIFIED]: [LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.LOCATION_STALE]: [LIVE_REACTION_TYPES.VERIFICATION_OPPORTUNITY, LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.LOCATION_CONFLICT]: [LIVE_REACTION_TYPES.VERIFICATION_OPPORTUNITY, LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.BUSINESS_OFFER_STARTED]: [LIVE_REACTION_TYPES.BUSINESS_OPPORTUNITY, LIVE_REACTION_TYPES.NOTIFICATION],
  [LIVE_EVENT_TYPES.VEHICLE_ENTERED_ZONE]: [LIVE_REACTION_TYPES.FLEET_ALERT],
  [LIVE_EVENT_TYPES.VEHICLE_ARRIVED]: [LIVE_REACTION_TYPES.FLEET_ALERT],
  [LIVE_EVENT_TYPES.VEHICLE_DEPARTED]: [LIVE_REACTION_TYPES.FLEET_ALERT],
  [LIVE_EVENT_TYPES.ROUTE_STARTED]: [LIVE_REACTION_TYPES.FLEET_ALERT],
  [LIVE_EVENT_TYPES.ROUTE_CHANGED]: [LIVE_REACTION_TYPES.FLEET_ALERT],
  [LIVE_EVENT_TYPES.TASK_COMPLETED]: [LIVE_REACTION_TYPES.FLEET_ALERT]
});

export function getLiveReactions(event) {
  if (!event?.event_type) return [];
  return (REACTION_RULES[event.event_type] || []).map(type => ({
    type,
    eventId: event.id,
    eventType: event.event_type,
    locationId: event.location_id || null,
    actorType: event.actor_type || null,
    actorId: event.actor_id || null,
    payload: event.payload || {},
    createdAt: event.created_at || null
  }));
}

export function subscribeToLiveReactions({ locationId = null, onReaction, onEvent } = {}) {
  if (typeof onReaction !== 'function') throw new Error('onReaction is required.');
  return subscribeToLiveEvents({
    locationId,
    onEvent: ({ new: event }) => {
      onEvent?.(event);
      getLiveReactions(event).forEach(onReaction);
    }
  });
}
