import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, MapPinned, RefreshCw, Route as RouteIcon, Navigation, Radio, ShieldCheck } from 'lucide-react';
import { listBusinesses, listLocations, getLocationIntelligence } from '../services/business';
import { buildFleetRecommendations } from '../services/intelligenceRecommendations';
import { getBusinessIntelligence } from '../services/intelligence';
import { subscribeToLiveEvents } from '../services/liveNetwork';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';
import '../styles/admin-fleet.css';

export default function FleetReviewPage(){
  const {authenticated,loading:authLoading,capabilities}=useAuth();
  const [params]=useSearchParams();
  const [state,setState]=useState({business:null,locations:[],intelligence:[],signals:[]});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [livePulse,setLivePulse]=useState(null);
  const fleetAuthorized=hasCapability(capabilities,'fleet')||hasCapability(capabilities,'admin');

  async function load(){
    setLoading(true);setError(null);
    try{
      const business=(await listBusinesses())?.[0];
      if(!business){setState({business:null,locations:[],intelligence:[],signals:[]});return;}
      const [locations,intelligence,network]=await Promise.all([
        listLocations(business.id),
        getLocationIntelligence(business.id),
        getBusinessIntelligence(business.id).catch(()=>({signals:[]}))
      ]);
      setState({business,locations:locations||[],intelligence:intelligence||[],signals:network?.signals||[]});
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
    try{unsubscribe=subscribeToLiveEvents({onEvent:event=>{if(String(event?.event_type||'').startsWith('fleet.')){setLivePulse(event);refresh()}}})}catch{}
    return()=>{clearTimeout(timer);window.removeEventListener('kleenest:location-activity',refresh);window.removeEventListener('kleenest:intelligence-updated',refresh);unsubscribe?.()};
  },[authenticated,fleetAuthorized]);

  const recommendations=useMemo(()=>buildFleetRecommendations(state.intelligence),[state.intelligence]);
  const requested=params.get('location');
  const selected=recommendations.find(item=>String(item.location_id)===String(requested));
  const operationalSignals=state.signals.filter(signal=>signal.category==='operational'||signal.action==='create-event');
  const avgQuality=recommendations.length?Math.round(recommendations.reduce((sum,item)=>sum+(Number(item.signals.quality_score)||0),0)/recommendations.length):0;

  function openRoute(item){
    const location=state.locations.find(row=>String(row.id)===String(item.location_id));
    if(!location)return;
    const destination=location.latitude!=null&&location.longitude!=null?`${location.latitude},${location.longitude}`:[location.address,location.city,location.state].filter(Boolean).join(', ');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,'_blank','noopener,noreferrer');
  }

  if(authLoading||loading)return <section className="page"><div className="empty-state loading-state"><span className="loading-dot"/><div><strong>Loading fleet intelligence</strong><p>Preparing route recommendations and live activity…</p></div></div></section>;
  if(!authenticated)return <section className="page"><div className="empty-state"><h2>Sign in to review fleet activity</h2><Link className="primary" to="/profile">Sign in</Link></div></section>;
  if(!fleetAuthorized)return <section className="page"><div className="empty-state"><ShieldCheck size={38}/><h2>Fleet access required</h2><p>This operational surface is limited to fleet and administrator accounts.</p><Link className="secondary" to="/">Return home</Link></div></section>;
  if(error)return <section className="page"><div className="empty-state"><h2>Fleet intelligence unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></div></section>;
  if(!state.business)return <section className="page"><div className="empty-state"><h2>No business connected</h2><Link className="primary" to="/business/dashboard">Business dashboard</Link></div></section>;

  return <section className="page business-page">
    <div className="page-header"><div><span className="eyebrow">FLEET INTELLIGENCE</span><h1>Review route activity</h1><p>High-activity locations become operational waypoints. Live activity refreshes recommendations automatically.</p></div><div className="hero-actions"><Link className="secondary" to="/business/intelligence">Business intelligence</Link><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div></div>
    {livePulse&&<div className="success-banner"><Radio size={16}/><span>Live fleet signal received: <strong>{livePulse.event_type}</strong></span></div>}
    <div className="fleet-metric-strip"><div className="fleet-metric"><strong>{state.locations.length}</strong><span>managed locations</span></div><div className="fleet-metric"><strong>{recommendations.length}</strong><span>recommended waypoints</span></div><div className="fleet-metric"><strong>{avgQuality}</strong><span>average quality score</span></div></div>
    {operationalSignals.length>0&&<section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">OPERATIONAL SIGNALS</span><h2>Network events requiring attention</h2></div><ShieldCheck size={22}/></div><div className="business-intelligence-list">{operationalSignals.slice(0,6).map(signal=><div className="business-row" key={signal.key}><div><strong>{signal.title}</strong><span>{signal.evidence}</span><span>{String(signal.priority||'normal').toUpperCase()} priority</span></div><span className="tag">{signal.action==='create-event'?'Event opportunity':'Operational signal'}</span></div>)}</div></section>}
    <section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">ROUTE REVIEW</span><h2>{selected?selected.name:'Recommended waypoints'}</h2></div><RouteIcon size={22}/></div>{selected&&<div className="business-action-row"><div><strong>Selected operational waypoint</strong><span>{selected.recommendation.body}</span></div><button className="primary" onClick={()=>openRoute(selected)}><Navigation size={16}/>Open route</button></div>}<div className="business-intelligence-list">{recommendations.length?recommendations.map(item=><div className={`business-row ${requested===String(item.location_id)?'selected':''}`} key={item.location_id}><div><strong>{item.name}</strong><span>{item.recommendation.body}</span><span>Demand {item.signals.demand_score} · Activity {item.signals.activity_score} · Quality {item.signals.quality_score}</span></div><div className="business-intelligence-score"><MapPinned size={18}/><span><Activity size={14}/> Operational waypoint</span><Link className="secondary" to={`/fleet?location=${encodeURIComponent(item.location_id)}`}>Review</Link><button className="secondary" onClick={()=>openRoute(item)}><Navigation size={14}/>Route</button></div></div>):<p className="observation-copy">No elevated activity zones are currently detected.</p>}</div></section>
  </section>
}