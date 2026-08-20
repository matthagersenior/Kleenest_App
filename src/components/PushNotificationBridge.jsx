import {useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {registerPushSubscription} from '../services/pushNotifications';

export default function PushNotificationBridge(){
  const {profile}=useAuth();
  useEffect(()=>{
    if(!profile)return;
    let cancelled=false;
    const run=async()=>{
      try{if(!cancelled)await registerPushSubscription();}catch(error){console.warn('Push notification registration unavailable:',error?.message||error);}
    };
    run();
    return()=>{cancelled=true;};
  },[profile?.id,profile?.user_id]);
  return null;
}
