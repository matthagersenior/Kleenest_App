import { useState } from 'react';
import { Database, RefreshCw, MapPinned, Layers, MapPinCheck, ShieldCheck, ChevronDown, Wrench, Radio, Route, Users, Building2 } from 'lucide-react';
import { runAdminTool, runDataIngest, backfillLocationAddresses } from '../services/adminData';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';
import { Link } from 'react-router-dom';

export default function AdminDataPage(){
 const {capabilities=[],loading}=useAuth(); const [busy,setBusy]=useState(''); const [result,setResult]=useState(null); const [ingestionOpen,setIngestionOpen]=useState(false);
 if(loading)return <section className="page"><div className="empty-state">Loading administrator session…</div></section>;
 if(!hasCapability(capabilities,'admin'))return <section className="page"><div className="empty-state"><ShieldCheck size={30}/><h2>Administrator access required</h2><p>This surface is protected by Supabase Auth + server-side capability checks.</p></div></section>;
 async function run(key,fn){setBusy(key);setResult(null);try{setResult(await fn())}catch(error){setResult({ok:false,error:error.message||String(error)})}finally{setBusy('')}}
 return <section className="page admin-page"><div className="page-header"><div><span className="eyebrow">ADMINISTRATION</span><h1>Admin tools</h1><p>Monitor, maintain, and operate the Kleenest network. Data ingestion is intentionally kept secondary to day-to-day administration.</p></div><Wrench size={28}/></div>
 <div className="admin-tool-grid">
   <Link className="detail-panel admin-tool-card" to="/fleet"><Radio size={22}/><div><strong>Fleet operations</strong><span>Review operational signals, route activity, and live fleet intelligence.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/business/dashboard"><Building2 size={22}/><div><strong>Business operations</strong><span>Review managed businesses, locations, QR activity, intelligence, and performance.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/map"><MapPinned size={22}/><div><strong>Network map</strong><span>Inspect the canonical location network and GPS discovery experience.</span></div></Link>
   <Link className="detail-panel admin-tool-card" to="/notifications"><Users size={22}/><div><strong>Community activity</strong><span>Review the user-facing activity and notification surfaces.</span></div></Link>
 </div>
 <section className="admin-tools-panel admin-secondary-tools"><div className="panel-heading"><div><span className="eyebrow">MAINTENANCE</span><h2>Network maintenance</h2><p>Operational tools for address coverage and derived network data.</p></div></div><div className="admin-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>run('addresses',()=>backfillLocationAddresses(25))}><MapPinCheck size={18}/> {busy==='addresses'?'Backfilling addresses…':'Backfill 25 addresses'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('health',()=>runAdminTool('health'))}><RefreshCw size={18}/> {busy==='health'?'Checking…':'Run backend health check'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('refresh',()=>runAdminTool('refresh-all',{limit:100}))}><RefreshCw size={18}/> {busy==='refresh'?'Refreshing…':'Refresh derived data'}</button>
 </div></section>
 <section className="admin-tools-panel ingestion-panel"><button className="admin-collapse" type="button" aria-expanded={ingestionOpen} onClick={()=>setIngestionOpen(v=>!v)}><div><span className="eyebrow">ADVANCED / DATA</span><h2>Data ingestion</h2><p>Source imports for expanding or refreshing the canonical location network.</p></div><ChevronDown className={ingestionOpen?'rotated':''}/></button>{ingestionOpen&&<div className="admin-actions ingestion-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>run('stl',()=>runDataIngest('ingest-osm-city',{city:'STL'}))}><MapPinned size={18}/> {busy==='stl'?'Importing St. Louis…':'Import St. Louis OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('kcmo',()=>runDataIngest('ingest-osm-city',{city:'KCMO'}))}><MapPinned size={18}/> {busy==='kcmo'?'Importing Kansas City…':'Import Kansas City OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('stl-data',()=>runDataIngest('ingest-data-gov-city',{city:'STL'}))}><Database size={18}/> {busy==='stl-data'?'Importing St. Louis Data.gov…':'Import St. Louis Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('kc-data',()=>runDataIngest('ingest-data-gov-city',{city:'KCMO'}))}><Database size={18}/> {busy==='kc-data'?'Importing Kansas City Data.gov…':'Import Kansas City Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('both',()=>runDataIngest('ingest-stl-kc'))}><Layers size={18}/> {busy==='both'?'Importing both cities…':'Import STL + Kansas City Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('chi-osm',()=>runDataIngest('ingest-osm-city',{city:'CHI'}))}><MapPinned size={18}/> {busy==='chi-osm'?'Importing Chicago OSM…':'Import Chicago OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('chi-data',()=>runDataIngest('ingest-chicago'))}><Database size={18}/> {busy==='chi-data'?'Importing Chicago Data.gov…':'Import Chicago Data.gov'}</button>
 </div>}</section>
 {result&&<pre className="admin-result">{JSON.stringify(result,null,2)}</pre>}</section>;
}
