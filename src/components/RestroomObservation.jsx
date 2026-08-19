import { useState } from 'react';
import { Check, Droplets, PackageCheck, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { submitRestroomObservation } from '../services/community';

const SIGNALS=[
  ['clean','Clean / usable',Sparkles],
  ['needs_cleaning','Needs cleaning',ThumbsDown],
  ['supplies_stocked','Supplies stocked',PackageCheck],
  ['supplies_low','Supplies low',Droplets],
  ['open','Open',ThumbsUp],
  ['unavailable','Closed / unavailable',ThumbsDown],
];

export default function RestroomObservation({locationId,checkInId=null,onSubmitted}){
  const [selected,setSelected]=useState('clean');
  const [cleanliness,setCleanliness]=useState(80);
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function submit(e){
    e.preventDefault();setBusy(true);setMessage('');
    try{const result=await submitRestroomObservation({locationId,checkInId,observationType:selected,cleanlinessPct:cleanliness,note});setMessage(`Observation recorded${result?.confidence?' · '+result.confidence+' confidence':''}.`);setNote('');onSubmitted?.(result)}
    catch(error){setMessage(error.message||'Unable to record observation.')}
    finally{setBusy(false)}
  }
  return <form className="observation-panel" onSubmit={submit}>
    <div className="panel-heading"><div><span className="eyebrow">LIVE COMMUNITY SIGNAL</span><h2>What did you find?</h2></div><Check size={24}/></div>
    <p className="observation-copy">A quick observation helps keep this bathroom's intelligence current for the next person.</p>
    <div className="observation-grid">{SIGNALS.map(([value,label,Icon])=><button type="button" key={value} className={selected===value?'observation-selected':''} onClick={()=>setSelected(value)}><Icon size={17}/><span>{label}</span></button>)}</div>
    <label className="range-label"><span>Cleanliness estimate</span><strong>{cleanliness}%</strong></label>
    <input className="cleanliness-range" type="range" min="0" max="100" step="5" value={cleanliness} onChange={e=>setCleanliness(Number(e.target.value))}/>
    <textarea value={note} onChange={e=>setNote(e.target.value)} rows="3" placeholder="Optional note: supplies, odor, accessibility issue, unexpected closure…"/>
    <button className="primary" disabled={busy}>{busy?'Recording…':'Submit observation'}</button>
    {message&&<p className={message.startsWith('Observation')?'form-success':'form-error'}>{message}</p>}
  </form>;
}
