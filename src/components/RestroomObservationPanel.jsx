import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Droplets, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { submitRestroomObservation } from '../services/community';
import { submitQualityObservation } from '../services/observations';

const OPTIONS=[
  {type:'clean',label:'Clean',icon:Sparkles},
  {type:'dirty',label:'Needs cleaning',icon:AlertTriangle},
  {type:'supplies_ok',label:'Supplies stocked',icon:Droplets},
  {type:'supplies_low',label:'Supplies low',icon:Droplets},
  {type:'open',label:'Open now',icon:CheckCircle2},
  {type:'closed',label:'Closed / unavailable',icon:AlertTriangle},
  {type:'accessible',label:'Accessible',icon:ShieldCheck},
  {type:'not_accessible',label:'Not accessible',icon:ShieldCheck},
  {type:'changing_table',label:'Changing table',icon:CheckCircle2},
  {type:'no_changing_table',label:'No changing table',icon:AlertTriangle},
];
const OCCUPANCY=[['low','Low'],['medium','Medium'],['high','High']];

export default function RestroomObservationPanel({locationId,checkInId=null,onSubmitted}){
  const [selected,setSelected]=useState([]),[cleanliness,setCleanliness]=useState(''),[occupancy,setOccupancy]=useState(''),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  function toggle(type){setSelected(v=>v.includes(type)?v.filter(x=>x!==type):[...v,type])}
  async function submit(e){
    e.preventDefault();
    if(!selected.length&&!occupancy&&!cleanliness){setMessage('Choose at least one observation.');return}
    setBusy(true);setMessage('');
    try{
      await Promise.all(selected.map(type=>submitRestroomObservation({locationId,checkInId,observationType:type,cleanlinessPct:cleanliness===''?null:Number(cleanliness),note})));
      if(occupancy){
        await submitQualityObservation({locationId,cleanliness:cleanliness===''?null:Number(cleanliness),checkInId,feedback:note,metadata:{occupancy_band:occupancy,source:'consumer_checkin_observation'}});
      }
      setSelected([]);setNote('');setCleanliness('');setOccupancy('');setMessage('Observation recorded. The location signal has been refreshed.');
      onSubmitted?.();
    }catch(error){setMessage(error.message||'Unable to record observation.')}finally{setBusy(false)}
  }
  return <section className="observation-panel"><div className="panel-heading"><div><span className="eyebrow">CONTRIBUTE SIGNAL</span><h2>What did you find?</h2><p>Quick observations help Kleenest keep location data fresh and expose conflicting reports.</p></div><ShieldCheck size={24}/></div><form onSubmit={submit}><div className="observation-options">{OPTIONS.map(({type,label,icon:Icon})=><button type="button" key={type} className={selected.includes(type)?'selected':''} onClick={()=>toggle(type)}><Icon size={16}/>{label}</button>)}</div><label className="observation-field"><span>Cleanliness estimate</span><div className="range-row"><input type="range" min="0" max="100" step="5" value={cleanliness===''?50:cleanliness} onChange={e=>setCleanliness(e.target.value)}/><strong>{cleanliness===''?'Not rated':`${cleanliness}%`}</strong></div></label><div className="observation-field"><span><Users size={15}/> How busy was it?</span><div className="observation-options">{OCCUPANCY.map(([value,label])=><button type="button" key={value} className={occupancy===value?'selected':''} onClick={()=>setOccupancy(occupancy===value?'':value)}>{label}</button>)}</div></div><textarea value={note} onChange={e=>setNote(e.target.value)} rows="3" placeholder="Optional note: soap empty, stall closed, recently cleaned…"/><button className="primary" disabled={busy}>{busy?'Recording…':'Submit observation'}</button></form>{message&&<p className={message.includes('recorded')?'form-success':'form-error'}>{message}</p>}</section>
}
