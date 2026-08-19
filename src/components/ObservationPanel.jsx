import { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { OBSERVATION_TYPES, submitObservation } from '../services/observations';

export default function ObservationPanel({ locationId, checkInId=null, onSubmitted }) {
  const [type,setType]=useState('clean');
  const [cleanliness,setCleanliness]=useState(80);
  const [note,setNote]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');setMessage('');try{await submitObservation({locationId,checkInId,observationType:type,cleanlinessPct:type==='clean'||type==='dirty'?cleanliness:null,note});setMessage('Observation recorded. Thank you for strengthening this location’s data.');setNote('');onSubmitted?.()}catch(e){setError(e.message||'Unable to record observation.')}finally{setBusy(false)}}
  return <form className="observation-panel" onSubmit={submit}><div className="panel-heading"><div><span className="eyebrow">CONTRIBUTE SIGNAL</span><h2>What did you observe?</h2></div><ShieldCheck size={23}/></div><p className="observation-copy">Your observation is stored as evidence, not treated as unquestionable fact. Verified visits carry stronger weight in Kleenest intelligence.</p><div className="observation-grid">{OBSERVATION_TYPES.map(([value,label])=><button type="button" key={value} className={type===value?'observation-selected':''} onClick={()=>setType(value)}>{type===value&&<CheckCircle2 size={15}/>} {label}</button>)}</div>{(type==='clean'||type==='dirty')&&<><div className="range-label"><span>Cleanliness estimate</span><strong>{cleanliness}%</strong></div><input className="cleanliness-range" type="range" min="0" max="100" step="5" value={cleanliness} onChange={e=>setCleanliness(Number(e.target.value))}/></>}<textarea value={note} onChange={e=>setNote(e.target.value)} rows="3" placeholder="Optional details: supplies, odor, accessibility, maintenance, etc."/><button className="primary" disabled={busy||!locationId}>{busy?'Recording…':'Record observation'}</button>{error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}</form>
}
