import { useEffect, useMemo, useState } from 'react';
import { Activity, Building2, MapPinned, RefreshCw, Route as RouteIcon, Navigation, Radio, ShieldCheck, Target, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { listBusinesses, listLocations, getLocationIntelligence } from '../services/business';
import { listPlaces } from '../services/places';
import { buildFleetRecommendations } from '../services/intelligenceRecommendations';
import { getBusinessIntelligence } from '../services/intelligence';
import { subscribeToLiveEvents } from '../services/liveNetwork';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';
import '../styles/admin-fleet.css';

export default function FleetReviewPage(){
  const {authenticated,loading:authLoading,capabilities}=useAuth();
  const [params]=useSearchParams();
  const [state,setState]=useState({businesses:[],locations:[],intelligence:[],signals:[],networkPlaces:[]});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [livePulse,setLivePulse]=useState(null);
  const fleetAuthorized=hasCapability(capabilities,'fleet')||hasCapability(capabilities,'admin');

  async function load(){
    setLoading(true);setError(null);
    try{
      const businesses=(await listBusinesses())||[];
      const locationSets=await Promise.all(businesses.map(b=>listLocations(b.id).catch(()=>[])));
      const locations=locationSets.flat().map((location,index)=>({...location,business_id:location.business_id||businesses.find(b=>location.business_id===b.id)?.id||null,business_name:businesses.find(b=>String(b.id)===String(location.business_id))?.name||businesses[index]?.name||'Fleet network'}));
      const intelligenceSets=await Promise.all(businesses.map(b=>getLocationIntelligence(b.id).catch(()=>[])));
      const intelligence=intelligenceSets.flat();
      const networkSets=await Promise.all(businesses.map(b=>getBusinessIntelligence(b.id).catch(()=>({signals:[]}))));
      const signals=networkSets.flatMap(network=>network?.signals||[]);
      const networkPlaces=await listPlaces({category:'restroom',sort:'recommended',limit:12}).catch(()=>[]);
      setState({businesses,locations,intelligence,signals,networkPlaces:networkPlaces||[]});
    }catch(e){setError(e.message||'Unable to load fleet intelligence.')}finally{setLoading(false)}
  }

  useEffect(()=>{if(authenticated&&fleetAuthorized)load();else if(!authLoading)setLoading(false)},[authenticated,authLoading,fleetAuthorized]);
  useEffect(()=>{
    if(!authenticated||!fleetAuthorized)return undefined;
    let timer;
    const refresh=()=>{clearTimeout(timer);timer=setTimeout(load,350)};
    window.addEventListener('kleenest:location-activity',refresh);
    window.addEventListener('kleenest:intelligence-updated',refresh);
    let unsubscribe;
    try{unsubscribe=subscribeToLiveEvents({onEvent:event=>{if(String(event?.event_type||'').startsWith('fleet.')||String(event?.event_type||'').startsWith('location.')){setLivePulse(event);refresh()}}})}catch{}
    return()=>{clearTimeout(timer);window.removeEventListener('kleenest:location-activity',refresh);window.removeEventListener('kleenest:intelligence-updated',refresh);unsubscribe?.()};
  },[authenticated,fleetAuthorized]);

  const recommendations=useMemo(()=>buildFleetRecommendations(state.intelligence),[state.intelligence]);
  const requested=params.get('location');
  const selected=recommendations.find(item=>String(item.location_id)===String(requested));
  const operationalSignals=state.signals.filter(signal=>signal.category==='operational'||signal.action==='create-event'||signal.action==='create-promotion');
  const avgQuality=recommendations.length?Math.round(recommendations.reduce((sum,item)=>sum+(Number(item.signals.quality_score)||0),0)/recommendations.length):0;

  function openRoute(item){
    const location=state.locations.find(row=>String(row.id)===String(item.location_id));
    if(!location)return;
    const destination=location.latitude!=null&&location.longitude!=null?`${location.latitude},${location.longitude}`:[location.address,location.city,location.state].filter(Boolean).join(', ');
    if(!destination)return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,'_blank','noopener,noreferrer');
  }

  if(authLoading||loading)return <section className="page"><div className="empty-state loading-state"><span className="loading-dot"/><div><strong>Loading fleet intelligence</strong><p>Connecting network activity to fleet operations…</p></div></div></section>;
  if(!authenticated)return <section className="page"><div className="empty-state"><h2>Sign in to review fleet activity</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if(!fleetAuthorized)return <section className="page"><div className="empty-state"><ShieldCheck size={38}/><h2>Fleet access required</h2><p>This operational surface is limited to fleet and administrator accounts.</p><Link className="secondary" to="/">Return home</Link></div></section>;
  if(error)return <section className="page"><div className="empty-state"><h2>Fleet intelligence unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></div></section>;

  return <section className="page business-page fleet-page">
    <div className="page-header"><div><span className="eyebrow">FLEET OPERATIONS</span><h1>Network-powered fleet command</h1><p>Use Kleenest demand, cleanliness, verification, arrivals, and live activity to plan better stops and service opportunities.</p></div><div className="hero-actions"><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh network</button><Link className="secondary" to="/map"><MapPinned size={16}/>Open network map</Link></div></div>
    {livePulse&&<div className="success-banner"><Radio size={16}/><span>Live network signal: <strong>{livePulse.event_type}</strong></span></div>}
    <div className="fleet-metric-strip"><div className="fleet-metric"><Building2 size={18}/><strong>{state.locations.length}</strong><span>managed waypoints</span></div><div className="fleet-metric"><Target size={18}/><strong>{recommendations.length}</strong><span>service opportunities</span></div><div className="fleet-metric"><Activity size={18}/><strong>{avgQuality}</strong><span>network quality</span></div><div className="fleet-metric"><Users size={18}/><strong>{state.networkPlaces.length}</strong><span>nearby bathrooms</span></div></div>
    <section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">FLEET BENEFIT</span><h2>What the network can do for your fleet</h2></div><RouteIcon size={22}/></div><div className="business-grid"><div className="business-action-row"><div><strong>Find stronger service stops</strong><span>Prioritize locations with demand, activity and quality signals instead of relying on static lists.</span></div><Link className="primary" to="/map"><MapPinned size={16}/>Find stops</Link></div><div className="business-action-row"><div><strong>Turn activity into routes</strong><span>Open navigation directly from recommended operational waypoints.</span></div><Link className="secondary" to="#route-review">Review routes</Link></div></div></section>
    {operationalSignals.length>0&&<section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">LIVE OPPORTUNITIES</span><h2>Network events requiring attention</h2></div><ShieldCheck size={22}/></div><div className="business-intelligence-list">{operationalSignals.slice(0,8).map(signal=><div className="business-row" key={signal.key}><div><strong>{signal.title}</strong><span>{signal.evidence}</span><span>{String(signal.priority||'normal').toUpperCase()} priority</span></div><span className="tag">{signal.action==='create-event'?'Event opportunity':signal.action==='create-promotion'?'Promotion opportunity':'Operational signal'}</span></div>)}</div></section>}
    <section id="route-review" className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">ROUTE REVIEW</span><h2>{selected?selected.name:'Recommended service opportunities'}</h2></div><RouteIcon size={22}/></div>{selected&&<div className="business-action-row"><div><strong>Selected operational waypoint</strong><span>{selected.recommendation.body}</span></div><button className="primary" onClick={()=>openRoute(selected)}><Navigation size={16}/>Open route</button></div>}<div className="business-intelligence-list">{recommendations.length?recommendations.map(item=><div className={`business-row ${requested===String(item.location_id)?'selected':''}`} key={item.location_id}><div><strong>{item.name}</strong><span>{item.recommendation.body}</span><span>Demand {item.signals.demand_score} · Activity {item.signals.activity_score} · Quality {item.signals.quality_score}</span></div><div className="business-intelligence-score"><MapPinned size={18}/><span><Activity size={14}/> Service opportunity</span><Link className="secondary" to={`/fleet?location=${encodeURIComponent(item.location_id)}`}>Review</Link><button className="secondary" onClick={()=>openRoute(item)}><Navigation size={14}/>Route</button></div></div>):<p className="observation-copy">No elevated service opportunities are currently detected.</p>}</div></section>
    <section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">NETWORK BATHROOMS</span><h2>Nearby network stops</h2></div><MapPinned size={22}/></div><div className="business-intelligence-list">{state.networkPlaces.length?state.networkPlaces.slice(0,6).map(place=><div className="business-row" key={place.id}><div><strong>{place.name}</strong><span>{place.address||'Address not set'}</span><span>{place.intelligence_freshness_label||'Network location'} · {place.distance_miles!=null?`${place.distance_miles.toFixed(1)} mi`:''}</span></div><Link className="secondary" to={`/place/${place.id}`}>Review stop</Link></div>):<p className="observation-copy">No nearby network stops are available yet.</p>}</div></section>
  </section>
}