import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { subscribeToUserNotifications } from '../services/notificationRealtime.js';

export default function NotificationRealtimeBridge(){
 const {user}=useAuth();
 useEffect(()=>{if(!user?.id)return;return subscribeToUserNotifications(user.id,{onNotification:event=>{window.dispatchEvent(new CustomEvent('kleenest:notification',{detail:event}));}});},[user?.id]);
 return null;
}
