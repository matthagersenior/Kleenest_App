import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordLocationView } from '../services/events';
import { useAuth } from '../context/AuthContext';

export default function LocationActivityBridge(){
  const location=useLocation();
  const {authenticated}=useAuth();
  useEffect(()=>{
    if(!authenticated)return;
    const match=location.pathname.match(/^\/place\/([^/]+)/);
    if(!match)return;
    const locationId=decodeURIComponent(match[1]);
    const key=`kleenest:view:${locationId}`;
    const now=Date.now();
    const last=Number(sessionStorage.getItem(key)||0);
    if(now-last<30000)return;
    sessionStorage.setItem(key,String(now));
    recordLocationView({locationId,placeId:locationId});
  },[authenticated,location.pathname]);
  return null;
}
