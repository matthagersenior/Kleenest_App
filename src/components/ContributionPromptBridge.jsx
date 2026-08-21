import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RestroomObservationPanel from './RestroomObservationPanel';

export default function ContributionPromptBridge(){
  const [prompt,setPrompt]=useState(null);

  useEffect(()=>{
    let active=true;
    const onCheckIn=async(event)=>{
      const { locationId, checkInId, pointsAwarded=0 }=event.detail||{};
      if(!locationId||!supabase)return;
      try{
        const { data: place }=await supabase.from('places').select('id,name,category').eq('location_id',locationId).eq('is_active',true).maybeSingle();
        if(!active||place?.category!=='restroom')return;
        setPrompt({locationId,checkInId,placeName:place.name||'this bathroom',pointsAwarded});
      }catch{}
    };
    window.addEventListener('kleenest:checkin-created',onCheckIn);
    return()=>{active=false;window.removeEventListener('kleenest:checkin-created',onCheckIn)};
  },[]);

  if(!prompt)return null;
  return <div className="contribution-prompt-backdrop" role="dialog" aria-modal="true" aria-label="Contribute a restroom observation">
    <div className="contribution-prompt-card">
      <div className="contribution-prompt-header">
        <div><span className="eyebrow"><MapPin size={13}/> CHECK-IN COMPLETE</span><h2>Help keep {prompt.placeName} accurate.</h2><p>You earned {prompt.pointsAwarded||0} points. A few quick observations make Kleenest more useful for the next person.</p></div>
        <button className="icon-button" type="button" aria-label="Close" onClick={()=>setPrompt(null)}><X size={19}/></button>
      </div>
      <RestroomObservationPanel locationId={prompt.locationId} checkInId={prompt.checkInId} onSubmitted={()=>setPrompt(null)}/>
      <button className="contribution-skip" type="button" onClick={()=>setPrompt(null)}>Not now</button>
    </div>
  </div>;
}
