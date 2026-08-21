import { supabase } from '../lib/supabase';

export function subscribeToUserNotifications(userId,{onNotification,onError}={}){
 if(!supabase||!userId)return()=>{};
 const channel=supabase.channel(`kleenest-notifications:${userId}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${userId}`},payload=>onNotification?.(payload.new)).subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')onError?.(new Error(`Notification realtime ${status}`));});
 return()=>{supabase.removeChannel(channel);};
}

export async function markNotificationRead(id){if(!supabase||!id)return{error:null};return supabase.rpc('mark_notification_read',{p_notification_id:id});}
