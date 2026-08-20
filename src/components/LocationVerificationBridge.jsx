import { useEffect,useMemo,useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listLocationVerificationSummary,submitLocationVerification } from '../services/locationVerification';

export default function LocationVerificationBridge(){
  const { pathname }=useLocation();
  const { authenticated }=useAuth();
  const placeId=useMemo(()=>{const m=pathname.match(/^\/place\/([^/]+)/);return m?.[1]||null},[pathname]);
  const [summary,setSummary]=useState(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [open,setOpen]=useState(true);
  const [publicAccess,setPublicAccess]=useState(true);

  useEffect(()=>{if(!placeId){setSummary(null);return}let active=true;listLocationVerificationSummary(placeId).then(v=>active&&setSummary(v)).catch(()=>active&&setSummary(null));return()=>{active=false}},[placeId]);
  if(!placeId||!authenticated)return null;

  async function submit(e){
    e.preventDefault();setBusy(true);setMessage('');
    try{await submitLocationVerification({placeId,isOpen:open,isPublic:publicAccess});const next=await listLocationVerificationSummary(placeId);setSummary(next);setMessage('Verification recorded. Thank you.')}catch(error){setMessage(error.message||'Verification could not be recorded.')}finally{setBusy(false)}
  }

  return <aside className="detail-panel location-verification-card" style={{marginTop:16}}>
    <div className="panel-heading"><div><span className="eyebrow">COMMUNITY VERIFICATION</span><h2>Is this location still here?</h2></div><ShieldCheck size={22}/></div>
    <p>Help keep Kleenest trustworthy. Confirm that the location is open and available to the public.</p>
    <form onSubmit={submit}>
      <div className="hero-actions"><label><input type="checkbox" checked={open} onChange={e=>setOpen(e.target.checked)}/> Open now</label><label><input type="checkbox" checked={publicAccess} onChange={e=>setPublicAccess(e.target.checked)}/> Public access</label></div>
      <button className="primary" disabled={busy}>{busy?'Saving…':<><CheckCircle2 size={17}/> Confirm location</>}</button>
    </form>
    {summary?.total>0&&<p className="freshness">{summary.total} community check{summary.total===1?'':'s'} · {summary.openCount} report open · {summary.publicCount} report public</p>}
    {message&&<p className="form-success">{message}</p>}
  </aside>
}
