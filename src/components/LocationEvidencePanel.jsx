import { useEffect, useState } from 'react';
import { Accessibility, Camera, Droplets, Gauge, ShieldCheck, Toilet, WashingMachine } from 'lucide-react';
import { listLocationFixtures, listLocationHours, listLocationPhotos, getLocationQualitySummary } from '../services/locationIntelligence';

const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export default function LocationEvidencePanel({locationId}){
 const [s,setS]=useState({loading:true,fixtures:null,hours:[],photos:[],quality:null});
 useEffect(()=>{let alive=true;if(!locationId)return;Promise.all([listLocationFixtures(locationId).catch(()=>null),listLocationHours(locationId).catch(()=>[]),listLocationPhotos(locationId).catch(()=>[]),getLocationQualitySummary(locationId).catch(()=>null)]).then(([fixtures,hours,photos,quality])=>alive&&setS({loading:false,fixtures,hours,photos,quality}));return()=>{alive=false;};},[locationId]);
 if(s.loading)return null;
 const f=s.fixtures,q=s.quality;
 return <section className="detail-panel location-evidence-panel"><div className="panel-heading"><div><span className="eyebrow">BATHROOM INTELLIGENCE</span><h2>What to expect</h2></div><ShieldCheck size={20}/></div>
  {f&&<div className="fixture-grid">{[['stalls',f.stalls,Toilet],['urinals',f.urinals,Toilet],['sinks',f.sinks,Droplets],['dryers',f.hand_dryers,WashingMachine],['changing tables',f.changing_tables,Accessibility],['showers',f.showers,Droplets]].filter(([,v])=>v!==null&&v!==undefined).map(([label,value,Icon])=><div className="data-card" key={label}><Icon size={17}/><strong>{value}</strong><span>{label}</span></div>)}</div>}
  {q&&<div className="quality-grid">{[['Cleanliness',q.cleanliness_score??q.cleanliness],['Accessibility',q.accessibility_score??q.accessibility],['Safety',q.safety_score??q.safety],['Availability',q.availability_score??q.availability],['Condition',q.condition_score??q.condition]].filter(([,v])=>v!==null&&v!==undefined).map(([label,v])=><div key={label}><span>{label}</span><strong>{Number(v).toFixed(1)}/5</strong><Gauge value={Number(v)}/></div>)}</div>}
  {s.hours.length>0&&<details><summary>Hours</summary><div className="hours-list">{s.hours.map(h=><div key={h.day_of_week}><span>{days[h.day_of_week]||`Day ${h.day_of_week}`}</span><span>{h.is_24_hours?'Open 24 hours':`${h.opens_at?.slice(0,5)||'—'} – ${h.closes_at?.slice(0,5)||'—'}`}</span></div>)}</div></details>}
  {s.photos.length>0&&<div className="photo-strip"><div className="subheading"><Camera size={16}/> Community photos</div><div>{s.photos.slice(0,6).map(p=><figure key={p.id}><img src={p.public_url||p.url||p.storage_path} alt={p.caption||'Kleenest location'} loading="lazy"/><figcaption>{p.caption||'Location photo'}</figcaption></figure>)}</div></div>}
 </section>;
}
