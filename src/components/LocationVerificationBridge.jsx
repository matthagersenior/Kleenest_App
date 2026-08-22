import { useEffect,useMemo,useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listLocationVerificationSummary,submitLocationVerification } from '../services/locationVerification';

export default function LocationVerificationBridge(){
  const { pathname }=useLocation();
  const { authenticated }=useAuth();
  const placeId=useMemo(()=>{const m=pathname.match(/^\/place\/([^/]+)/);return m?.[1]||null},[pathname]);
  const [summary,setSummary]=useState(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [hasBathroom,setHasBathroom]=useState(true);const [publicAccess,setPublicAccess]=useState(true);
  useEffect(()=>{if(!placeId){setSummary(null);return}let active=true;listLocationVerificationSummary(placeId).then(v=>active&&setSummary(v)).catch(()=>active&&setSummary(null));return()=>{active=false}},[placeId]);
  if(!placeId||!authenticated)return null;
  async function submit(e){e.preventDefault();setBusy(true);setMessage('');try{let coords=null;if(typeof navigator!=='undefined'&&navigator.geolocation){coords=await new Promise(resolve=>navigator.geolocation.getCurrentPosition(p=>resolve({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>resolve(null),{enableHighAccuracy:true,maximumAge:30000,timeout:8000}));}await submitLocationVerification({placeId,isOpen:hasBathroom,isPublic:publicAccess,latitude:coords?.latitude??null,longitude:coords?.longitude??null});const next=await listLocationVerificationSummary(placeId);setSummary(next);setMessage('Bathroom verification recorded.');}catch(error){setMessage(error.message||'Verification could not be recorded.')}finally{setBusy(false)}}
  return <aside className="detail-panel location-verification-card" style={{marginTop:16}}><div className="panel-heading"><div><span className="eyebrow">COMMUNITY VERIFICATION</span><h2>Verify the bathroom</h2></div><ShieldCheck size={22}/></div><p>Confirm whether this location has a public bathroom. If location access is available, Kleenest records the verification distance too.</p><form onSubmit={submit}><div className="hero-actions"><label><input type="checkbox" checked={hasBathroom} onChange={e=>setHasBathroom(e.target.checked)}/> Public bathroom available</label><label><input type="checkbox" checked={publicAccess} onChange={e=>setPublicAccess(e.target.checked)}/> Public access</label></div><button className="primary" disabled={busy}>{busy?'Saving…':<><CheckCircle2 size={17}/> Confirm bathroom</>}</button></form>{summary?.total>0&&<p className="freshness">{summary.total} community verification{summary.total===1?'':'s'} · {summary.openCount} positive report{summary.openCount===1?'':'s'}</p>}{message&&<p className="form-success">{message}</p>}</aside>
}
