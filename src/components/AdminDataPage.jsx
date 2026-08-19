import { useState } from 'react';
import { Database, RefreshCw, MapPinned, Layers } from 'lucide-react';
import { runAdminTool, runDataIngest } from '../services/adminData';
import { useAuth } from '../context/AuthContext';

export default function AdminDataPage(){
 const {profile,loading}=useAuth(); const [busy,setBusy]=useState(''); const [result,setResult]=useState(null);
 if(loading)return <section className="page"><div className="empty-state">Loading administrator session…</div></section>;
 if(!profile?.is_admin&&!['admin','owner','platform_admin','super_admin'].includes(String(profile?.role||'').toLowerCase()))return <section className="page"><div className="empty-state"><h2>Administrator access required</h2><p>This surface is protected by Supabase Auth + server-side role checks.</p></div></section>;
 async function run(key,fn){setBusy(key);setResult(null);try{setResult(await fn())}catch(error){setResult({ok:false,error:error.message||String(error)})}finally{setBusy('')}}
 return <section className="page"><div className="page-header"><div><span className="eyebrow">ADMIN / DATA</span><h1>Map Data Operations</h1><p>One canonical location layer. Public sources are ingested with source provenance and deduplicated by source identity.</p></div></div><div className="admin-actions">
 <button className="primary" disabled={!!busy} onClick={()=>run('stl',()=>runDataIngest('ingest-osm-city',{city:'STL'}))}><MapPinned size={18}/> {busy==='stl'?'Importing St. Louis…':'Import St. Louis OSM'}</button>
 <button className="primary" disabled={!!busy} onClick={()=>run('kcmo',()=>runDataIngest('ingest-osm-city',{city:'KCMO'}))}><MapPinned size={18}/> {busy==='kcmo'?'Importing Kansas City…':'Import Kansas City OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('stl-data',()=>runDataIngest('ingest-data-gov-city',{city:'STL'}))}><Database size={18}/> {busy==='stl-data'?'Importing St. Louis Data.gov…':'Import St. Louis Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('kc-data',()=>runDataIngest('ingest-data-gov-city',{city:'KCMO'}))}><Database size={18}/> {busy==='kc-data'?'Importing Kansas City Data.gov…':'Import Kansas City Data.gov'}</button>
 <button className="primary" disabled={!!busy} onClick={()=>run('both',()=>runDataIngest('ingest-stl-kc'))}><Layers size={18}/> {busy==='both'?'Importing both cities…':'Import STL + Kansas City Data.gov'}</button>
 <button className="primary" disabled={!!busy} onClick={()=>run('chi-osm',()=>runDataIngest('ingest-osm-city',{city:'CHI'}))}><MapPinned size={18}/> {busy==='chi-osm'?'Importing Chicago OSM…':'Import Chicago OSM'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('chi-data',()=>runDataIngest('ingest-chicago'))}><Database size={18}/> {busy==='chi-data'?'Importing Chicago Data.gov…':'Import Chicago Data.gov'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('health',()=>runAdminTool('health'))}><RefreshCw size={18}/> {busy==='health'?'Checking…':'Run backend health check'}</button>
 <button className="secondary" disabled={!!busy} onClick={()=>run('refresh',()=>runAdminTool('refresh-all',{limit:100}))}><RefreshCw size={18}/> {busy==='refresh'?'Refreshing…':'Refresh derived data'}</button>
 </div>{result&&<pre className="admin-result">{JSON.stringify(result,null,2)}</pre>}</section>;
}
