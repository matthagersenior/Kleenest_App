import { getLocationSignals } from './intelligence';

function scoreReason(signals){
  const reasons=[];
  if(signals.demand_score>=70)reasons.push('high demand');
  if(signals.activity_score>=60)reasons.push('recent activity');
  if(signals.quality_score>=80)reasons.push('strong community confidence');
  if(signals.operational_status==='attention')reasons.push('location needs attention');
  if(signals.operational_status==='stale')reasons.push('stale location signal');
  return reasons;
}

export function buildLocationRecommendation(snapshot,signals,{surface='consumer'}={}){
  if(!snapshot)return null;
  const reasons=scoreReason(signals);
  if(surface==='business'){
    if(signals.operational_status==='attention'||signals.operational_status==='stale')return{
      type:'operational_attention',priority:'high',title:'Location needs attention',body:'Recent network signals indicate that this location may need verification or operational follow-up.',reasons
    };
    if(signals.demand_score>=70)return{
      type:'demand_opportunity',priority:'high',title:'Demand opportunity',body:'Kleenest is seeing elevated interest around this location.',reasons
    };
    return{type:'business_health',priority:'normal',title:'Location health is stable',body:'No immediate operational action is indicated by the current signals.',reasons};
  }
  if(surface==='fleet'){
    if(signals.demand_score>=70||signals.activity_score>=70)return{
      type:'high_activity_zone',priority:'high',title:'High-activity zone',body:'Recent demand and activity make this location a useful operational waypoint.',reasons
    };
    return{type:'normal_zone',priority:'normal',title:'Normal activity',body:'No elevated operational signal is currently detected.',reasons};
  }
  if(signals.quality_score>=80&&signals.operational_status!=='stale')return{
    type:'trusted_place',priority:'normal',title:'Trusted place',body:'Strong community confidence makes this a reliable place to consider.',reasons
  };
  if(signals.demand_score>=70)return{
    type:'popular_place',priority:'normal',title:'Popular nearby',body:'This place is receiving elevated interest from the Kleenest network.',reasons
  };
  return{type:'standard_place',priority:'low',title:'Nearby place',body:'This place has current Kleenest intelligence available.',reasons};
}

export async function recommendLocation(placeId,{surface='consumer'}={}){
  const{snapshot,signals}=await getLocationSignals(placeId);
  return buildLocationRecommendation(snapshot,signals,{surface});
}

export function rankLocationSignals(rows=[]){
  return [...rows].sort((a,b)=>{
    const aScore=Number(a?.demand_score||0)+Number(a?.activity_score||0)+Number(a?.quality_score||0);
    const bScore=Number(b?.demand_score||0)+Number(b?.activity_score||0)+Number(b?.quality_score||0);
    return bScore-aScore;
  });
}
