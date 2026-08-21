import {useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {registerPushSubscription} from '../services/pushNotifications';
import {startGpsGeofencing} from '../services/gpsGeofencing';

export default function PushNotificationBridge(){
  const {profile}=useAuth();
  useEffect(()=>{
    if(!profile)return undefined;
    let cancelled=false;
    let stopGeofencing=()=>{};
    const run=async()=>{
      try{if(!cancelled)await registerPushSubscription();}catch(error){console.warn('Push notification registration unavailable:',error?.message||error);}
      if(!cancelled)stopGeofencing=startGpsGeofencing({onError:error=>console.warn('GPS geofencing unavailable:',error?.message||error)});
    };
    run();
    return()=>{cancelled=true;stopGeofencing();};
  },[profile?.id,profile?.user_id]);
  return null;
}
