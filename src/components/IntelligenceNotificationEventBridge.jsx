import { useEffect } from 'react';
import { intelligenceEvents } from '../services/intelligencePublisher.js';

export default function IntelligenceNotificationEventBridge(){
 useEffect(()=>{
  const publish=(kind,detail={})=>{const locationId=detail.locationId;if(!locationId)return;const payload={...detail,source:'runtime'};if(kind==='observation')intelligenceEvents.community(locationId,payload).catch(()=>{});else if(kind==='review')intelligenceEvents.community(locationId,payload).catch(()=>{});else if(kind==='arrival')intelligenceEvents.community(locationId,{...payload,signal:'arrival'}).catch(()=>{});};
  const onObs=e=>publish('observation',e.detail);const onReview=e=>publish('review',e.detail);const onActivity=e=>{if(e.detail?.type==='arrival'||e.detail?.type==='check_in')publish('arrival',e.detail);};
  window.addEventListener('kleenest:observation-created',onObs);window.addEventListener('kleenest:review-created',onReview);window.addEventListener('kleenest:location-activity',onActivity);
  return()=>{window.removeEventListener('kleenest:observation-created',onObs);window.removeEventListener('kleenest:review-created',onReview);window.removeEventListener('kleenest:location-activity',onActivity);};
 },[]);
 return null;
}
