import { useState } from 'react';
import { Database, RefreshCw, MapPinned, Layers, MapPinCheck, ShieldCheck } from 'lucide-react';
import { runAdminTool, runDataIngest, backfillLocationAddresses } from '../services/adminData';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';

export default function AdminDataPage(){
 const {capabilities=[],loading}=useAuth(); const [busy,setBusy]=useState(''); const [result,setResult]=useState(null);
 if(loading)return <section className="page"><div className="empty-state">Loading administrator session…</div></section>;
 if(!hasCapability(capabilities,'admin'))return <section className="page"><div className="empty-state"><ShieldCheck size={30}/><h2>Administrator access required</h2><p>This surface is protected by Supabase Auth + server-side capability checks.</p></div></section>;
 async function run(key,fn){setBusy(key);setResult(null);try{setResult(await fn())}catch(error){setResult({ok:false,error:error.message||String(error)})}finally{setBusy('')}}
 return <section className="page"><div className="page-header"><div><span className="eyebrow">ADMIN / DATA</span><h1>Admin tools</h1><p>Manage canonical location data, provenance, derived intelligence, and address coverage.</p></div></div><section className="admin-tools-panel"><h2>Data ingestion</h2><p>Run source imports only when you need to refresh or expand the location network.</p><div className="admin-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>run('stl',()=>runDataIngest('ingest-osm-city',{city:'STL'}))}><MapPinned size={18}/> {busy==='stl'?'Importing St. Louis…':'Import St. Louis OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('kcmo',()=>runDataIngest('ingest-osm-city',{city:'KCMO'}))}><MapPinned size={18}/> {busy==='kcmo'?'Importing Kansas City…':'Import Kansas City OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('stl-data',()=>runDataIngest('ingest-data-gov-city',{city:'STL'}))}><Database size={18}/> {busy==='stl-data'?'Importing St. Louis Data.gov…':'Import St. Louis Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('kc-data',()=>runDataIngest('ingest-data-gov-city',{city:'KCMO'}))}><Database size={18}/> {busy==='kc-data'?'Importing Kansas City Data.gov…':'Import Kansas City Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('both',()=>runDataIngest('ingest-stl-kc'))}><Layers size={18}/> {busy==='both'?'Importing both cities…':'Import STL + Kansas City Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('chi-osm',()=>runDataIngest('ingest-osm-city',{city:'CHI'}))}><MapPinned size={18}/> {busy==='chi-osm'?'Importing Chicago OSM…':'Import Chicago OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('chi-data',()=>runDataIngest('ingest-chicago'))}><Database size={18}/> {busy==='chi-data'?'Importing Chicago Data.gov…':'Import Chicago Data.gov'}</button>
 </div></section><section className="admin-tools-panel"><h2>Maintenance</h2><p>Operational tools for address coverage and derived network data.</p><div className="admin-actions">
 <button className="secondary" disabled={!!busy} onClick={()=>run('addresses',()=>backfillLocationAddresses(25))}><MapPinCheck size={18}/> {busy==='addresses'?'Backfilling addresses…':'Backfill 25 addresses'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('health',()=>runAdminTool('health'))}><RefreshCw size={18}/> {busy==='health'?'Checking…':'Run backend health check'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('refresh',()=>runAdminTool('refresh-all',{limit:100}))}><RefreshCw size={18}/> {busy==='refresh'?'Refreshing…':'Refresh derived data'}</button>
 </div></section>{result&&<pre className="admin-result">{JSON.stringify(result,null,2)}</pre>}</section>;
}
