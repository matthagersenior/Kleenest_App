import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToNetworkNotifications } from '../services/realtimeNetwork';

export default function NetworkRealtimeBridge(){
  const { user } = useAuth() || {};
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return undefined;
    return subscribeToNetworkNotifications({
      userId,
      onNotification: notification => window.dispatchEvent(new CustomEvent('kleenest:notification', { detail: notification })),
      onEvent: event => window.dispatchEvent(new CustomEvent('kleenest:network-event', { detail: event })),
    });
  }, [user?.id]);
  return null;
}
