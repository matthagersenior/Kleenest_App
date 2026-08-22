import { useEffect, useState } from 'react';
import { Camera, Clock3, ListChecks, Send, ShieldCheck } from 'lucide-react';
import { getPlace } from '../services/places';
import { listLocationAmenities, listBathroomVerifications, submitBathroomVerification } from '../services/locationIntelligence';

export default function LocationDataPanel({ locationId: propId }) {
  const [state, setState] = useState({ loading:true, place:null, amenities:[], verifications:[], message:'' });
  const id = propId || (typeof window !== 'undefined' ? decodeURIComponent(window.location.pathname.match(/^\/place\/([^/]+)/)?.[1] || '') : '');
  useEffect(() => { let active=true; if(!id)return; (async()=>{try{const place=await getPlace(id);const locationId=place?.location_id||place?.id||id;const [amenities,verifications]=await Promise.all([listLocationAmenities(locationId).catch(()=>[]),listBathroomVerifications(locationId).catch(()=>[])]);if(active)setState({loading:false,place,amenities,verifications,message:''});}catch(e){if(active)setState(s=>({...s,loading:false,message:e?.message||'Location data unavailable.'}));}})();return()=>{active=false;};},[id]);
  async function verify(value){setState(s=>({...s,message:'Saving verification…'}));try{const locationId=state.place?.location_id||state.place?.id||id;await submitBathroomVerification({locationId,hasPublicBathroom:value});const verifications=await listBathroomVerifications(locationId).catch(()=>[]);setState(s=>({...s,verifications,message:'Thanks — your verification was recorded.'}));}catch(e){setState(s=>({...s,message:e?.message||'Sign in to contribute.'}));}}
  if(!id||state.loading)return null;
  const amenities=state.amenities||[]; const verifications=state.verifications||[];
  return <section className="detail-panel location-data-panel" aria-label="Location details and community evidence">
    <div className="panel-heading"><div><span className="eyebrow">LOCATION DATA</span><h2>Know before you go</h2></div><ShieldCheck size={20}/></div>
    <div className="location-data-grid">
      <div className="data-card"><Clock3 size={17}/><strong>{state.place?.open_now===true?'Open now':state.place?.open_now===false?'Closed':'Hours unavailable'}</strong><span>operating status</span></div>
      <div className="data-card"><ListChecks size={17}/><strong>{amenities.length||'—'}</strong><span>known amenities</span></div>
      <div className="data-card"><Camera size={17}/><strong>{state.place?.photo_count ?? state.place?.photos?.length ?? '—'}</strong><span>available photos</span></div>
    </div>
    {amenities.length>0&&<div className="amenity-chips">{amenities.slice(0,12).map(a=><span key={a.id}>{a.name}</span>)}</div>}
    <div className="verification-actions"><strong>Is there a public bathroom here?</strong><div><button type="button" className="secondary" onClick={()=>verify(true)}><Send size={14}/> Yes</button><button type="button" className="secondary" onClick={()=>verify(false)}>No</button></div></div>
    <p className="muted">{verifications.length ? `${verifications.length} community verification${verifications.length===1?'':'s'} recorded.` : 'Help keep Kleenest accurate with a quick verification.'}</p>
    {state.message&&<p className="form-success" role="status">{state.message}</p>}
  </section>;
}
