import { supabase } from '../lib/supabase';

const WATCH_RADIUS_M = 1200;
const TRIGGER_RADIUS_M = 300;
const MIN_MOVE_M = 75;
const COOLDOWN_MS = 10 * 60 * 1000;

function distanceMeters(a,b){
  const R=6371000,rad=Math.PI/180;
  const dLat=(b.latitude-a.latitude)*rad;
  const dLng=(b.longitude-a.longitude)*rad;
  const x=Math.sin(dLat/2)**2+Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

export function startGpsGeofencing({onError}={}){
  if(typeof window==='undefined'||!navigator.geolocation||!supabase)return()=>{};
  let lastPosition=null;
  let lastTriggeredAt=0;
  let cancelled=false;

  const inspect=async(position)=>{
    if(cancelled)return;
    const current={latitude:position.coords.latitude,longitude:position.coords.longitude};
    if(lastPosition&&distanceMeters(lastPosition,current)<MIN_MOVE_M)return;
    lastPosition=current;
    try{
      const {data,error}=await supabase.rpc('map_network_nearby_v1',{
        p_lat:current.latitude,p_lng:current.longitude,p_radius_m:WATCH_RADIUS_M,p_limit:25,
        p_category:null,p_search:null,p_amenity_names:[]
      });
      if(error||!Array.isArray(data)||!data.length)return;
      const nearby=data
        .map(row=>({...row,distance_meters:Number(row.distance_meters??Infinity)}))
        .filter(row=>row.distance_meters<=TRIGGER_RADIUS_M)
        .sort((a,b)=>a.distance_meters-b.distance_meters);
      if(!nearby.length||Date.now()-lastTriggeredAt<COOLDOWN_MS)return;
      const place=nearby[0];
      if(!place.location_id)return;
      const {error:notifyError}=await supabase.rpc('create_gps_geofence_notification',{
        p_location_id:place.location_id,
        p_distance_m:Math.round(place.distance_meters),
        p_category:place.category||null
      });
      if(!notifyError)lastTriggeredAt=Date.now();
    }catch(error){onError?.(error);}
  };

  const watchId=navigator.geolocation.watchPosition(inspect,error=>onError?.(error),{
    enableHighAccuracy:true,maximumAge:15000,timeout:15000
  });
  return()=>{cancelled=true;navigator.geolocation.clearWatch(watchId);};
}
