import { useEffect } from 'react';
import { recordArrival } from '../services/events';

export default function MapBehaviorBridge(){
  useEffect(()=>{
    const onArrival=event=>{
      const {locationId,placeId}=event.detail||{};
      if(!locationId)return;
      recordArrival({locationId,placeId,method:'map_user_action'}).catch(()=>null);
    };
    window.addEventListener('kleenest:map-arrival',onArrival);
    return()=>window.removeEventListener('kleenest:map-arrival',onArrival);
  },[]);
  return null;
}
