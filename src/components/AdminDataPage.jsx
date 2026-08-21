import { useState } from 'react';
import { Database, RefreshCw, MapPinned, Layers, MapPinCheck, ShieldCheck, ChevronDown, Wrench, Radio, Users, Building2, CheckCircle2 } from 'lucide-react';
import { runAdminTool, runDataIngest, backfillLocationAddresses } from '../services/adminData';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';
import { Link } from 'react-router-dom';
import '../styles/admin-fleet.css';

export default function AdminDataPage(){
 const {capabilities=[],loading}=useAuth(); const [busy,setBusy]=useState(''); const [result,setResult]=useState(null); const [ingestionOpen,setIngestionOpen]=useState(false);
 if(loading)return <section className="page"><div className="empty-state">Loading administrator session…</div></section>;
 if(!hasCapability(capabilities,'admin'))return <section className="page"><div className="empty-state"><ShieldCheck size={30}/><h2>Administrator access required</h2><p>This surface is protected by Supabase Auth + server-side capability checks.</p></div></section>;
 async function run(key,fn){setBusy(key);setResult(null);try{setResult(await fn())}catch(error){setResult({ok:false,error:error.message||String(error)})}finally{setBusy('')}}
 const ingest=(key,action,payload)=>run(key,()=>runDataIngest(action,payload));
 return <section className="page admin-page"><div className="page-header"><div><span className="eyebrow">ADMINISTRATION</span><h1>Admin tools</h1><p>Operate the Kleenest network. Ingestion stays secondary to administration.</p></div><Wrench size={28}/></div>
 <div className="admin-tool-grid">
   <Link className="detail-panel admin-tool-card" to="/fleet"><Radio size={22}/><div><strong>Fleet operations</strong><span>Operational signals, route activity, and fleet intelligence.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/business/dashboard"><Building2 size={22}/><div><strong>Business operations</strong><span>Businesses, locations, QR activity, intelligence, and performance.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/map"><MapPinned size={22}/><div><strong>Network map</strong><span>Canonical locations and GPS discovery.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/notifications"><Users size={22}/><div><strong>Community activity</strong><span>User activity and notification surfaces.</span></div></Link>
 </div>
 <section className="admin-tools-panel admin-secondary-tools"><div className="panel-heading"><div><span className="eyebrow">MAINTENANCE</span><h2>Network maintenance</h2><p>Address coverage, backend health, and derived network data.</p></div></div><div className="admin-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>run('addresses',()=>backfillLocationAddresses(25))}><MapPinCheck size={18}/> {busy==='addresses'?'Backfilling…':'Backfill 25 addresses'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('health',()=>runAdminTool('health'))}><RefreshCw size={18}/> {busy==='health'?'Checking…':'Backend health'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('refresh',()=>runAdminTool('refresh-all',{limit:100}))}><RefreshCw size={18}/> {busy==='refresh'?'Refreshing…':'Refresh derived data'}</button>
 </div></section>
 <section className="admin-tools-panel ingestion-panel"><button className="admin-collapse" type="button" aria-expanded={ingestionOpen} onClick={()=>setIngestionOpen(v=>!v)}><div><span className="eyebrow">ADVANCED / DATA</span><h2>Data ingestion</h2><p>OSM and Data.gov network discovery. Run markets without leaving Admin.</p></div><ChevronDown className={ingestionOpen?'rotated':''}/></button>{ingestionOpen&&<div className="admin-actions ingestion-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>ingest('top-osm','market-bathroom-ingest',{source:'osm',markets:'top10'})}><MapPinned size={18}/> {busy==='top-osm'?'Running…':'Top 10 OSM network'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>ingest('top-data','market-bathroom-ingest',{source:'datagov',markets:'top10'})}><Database size={18}/> {busy==='top-data'?'Running…':'Top 10 Data.gov network'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>ingest('stl-osm','market-bathroom-ingest',{source:'osm',markets:['st_louis']})}><MapPinned size={18}/> {busy==='stl-osm'?'Running…':'St. Louis OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>ingest('stl-data','market-bathroom-ingest',{source:'datagov',markets:['st_louis']})}><Database size={18}/> {busy==='stl-data'?'Running…':'St. Louis Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>ingest('both','market-bathroom-ingest',{source:'all',markets:['st_louis']})}><Layers size={18}/> {busy==='both'?'Running…':'St. Louis OSM + Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('quality',()=>runAdminTool('location-quality'))}><CheckCircle2 size={18}/> {busy==='quality'?'Auditing…':'Location quality audit'}</button>
 </div>}</section>
 {result&&<pre className="admin-result">{JSON.stringify(result,null,2)}</pre>}</section>;
}