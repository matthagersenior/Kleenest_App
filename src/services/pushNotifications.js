import { supabase } from '../lib/supabase';

const STORAGE_KEY='kleenest_push_subscription';

function supported(){return typeof window!=='undefined'&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;}

export function pushNotificationsSupported(){return supported();}

export async function getPushPermission(){
  if(!supported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission(){
  if(!supported()) return 'unsupported';
  return Notification.requestPermission();
}

export async function registerPushSubscription({serviceWorkerUrl='/sw.js'}={}){
  if(!supported()) return null;
  const permission=await requestPushPermission();
  if(permission!=='granted') return null;
  const registration=await navigator.serviceWorker.register(serviceWorkerUrl);
  const subscription=await registration.pushManager.getSubscription();
  if(!subscription) return null;
  const json=subscription.toJSON();
  if(typeof localStorage!=='undefined') localStorage.setItem(STORAGE_KEY,JSON.stringify(json));
  if(!supabase) return subscription;
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return subscription;
  const {error}=await supabase.from('notification_push_subscriptions').upsert({user_id:user.id,endpoint:json.endpoint,subscription:json,updated_at:new Date().toISOString()},{onConflict:'user_id,endpoint'});
  if(error) throw error;
  return subscription;
}

export async function unregisterPushSubscription(){
  if(!supported()) return false;
  const registration=await navigator.serviceWorker.getRegistration('/');
  const subscription=await registration?.pushManager.getSubscription();
  if(!subscription) return false;
  const endpoint=subscription.endpoint;
  await subscription.unsubscribe();
  if(typeof localStorage!=='undefined') localStorage.removeItem(STORAGE_KEY);
  if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user) await supabase.from('notification_push_subscriptions').delete().eq('user_id',user.id).eq('endpoint',endpoint);}
  return true;
}
