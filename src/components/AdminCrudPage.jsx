import { useEffect,useMemo,useState } from 'react';
import { Database,Edit3,Plus,RefreshCw,Save,ShieldCheck,Trash2,X,ChevronLeft,ChevronRight } from 'lucide-react';
import { ADMIN_RESOURCES,adminKeysFor,createAdminRow,deleteAdminRow,listAdminRows,updateAdminRow } from '../services/adminCrud';
import { useAuth } from '../context/AuthContext';
import { hasCapability } from '../domain/capabilities';
import '../styles/admin-crud.css';

const PAGE_SIZE=50;
const keyFor=(table,row)=>adminKeysFor(table).map(k=>row?.[k]).join('|');
const parsePayload=(text)=>{const value=JSON.parse(text);if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('Record must be a JSON object.');return value;};

export default function AdminCrudPage(){
 const {capabilities=[],loading}=useAuth(); const [table,setTable]=useState('locations'); const [rows,setRows]=useState([]); const [count,setCount]=useState(0); const [page,setPage]=useState(0); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [editor,setEditor]=useState(null); const [draft,setDraft]=useState('');
 const label=useMemo(()=>ADMIN_RESOURCES.find(([key])=>key===table)?.[1]||table,[table]);
 async function load(){setBusy(true);setError('');try{const result=await listAdminRows(table,{limit:PAGE_SIZE,offset:page*PAGE_SIZE});setRows(result.data);setCount(result.count)}catch(e){setRows([]);setCount(0);setError(e.message||String(e))}finally{setBusy(false)}}
 useEffect(()=>{setPage(0)},[table]);
 useEffect(()=>{if(!loading&&hasCapability(capabilities,'admin'))load()},[table,page,loading]);
 if(loading)return <section className="page"><div className="empty-state">Loading administrator session…</div></section>;
 if(!hasCapability(capabilities,'admin'))return <section className="page"><div className="empty-state"><ShieldCheck size={30}/><h2>Administrator access required</h2></div></section>;
 function open(row){setEditor(row);setDraft(JSON.stringify(row,null,2));}
 async function save(){setBusy(true);setError('');try{const payload=parsePayload(draft);if(editor&&Object.keys(editor).length){const keys=adminKeysFor(table);if(keys.some(k=>editor[k]==null))throw new Error('Missing primary-key value.');const updatePayload={...payload};keys.forEach(k=>delete updatePayload[k]);await updateAdminRow(table,editor,updatePayload)}else await createAdminRow(table,payload);setEditor(null);await load()}catch(e){setError(e.message||String(e))}finally{setBusy(false)}}
 async function remove(row){if(!window.confirm(`Delete this ${label.toLowerCase()} record? This cannot be undone.`))return;setBusy(true);setError('');try{await deleteAdminRow(table,row);await load()}catch(e){setError(e.message||String(e))}finally{setBusy(false)}}
 const pageCount=Math.max(1,Math.ceil(count/PAGE_SIZE));
 return <section className="page admin-page"><div className="page-header"><div><span className="eyebrow">PLATFORM ADMIN</span><h1>Admin CRUD</h1><p>Direct operational control of the underlying Kleenest network. All actions require Admin capability and Supabase RLS.</p></div><Database size={28}/></div>
 <div className="admin-crud-toolbar"><label>Resource<select value={table} onChange={e=>{setEditor(null);setTable(e.target.value)}}>{ADMIN_RESOURCES.map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label><button className="secondary" disabled={busy} onClick={load}><RefreshCw size={17}/> Refresh</button><button className="primary" disabled={busy} onClick={()=>{setEditor({});setDraft('{}')}}><Plus size={17}/> New</button><span className="crud-count">{count} records</span></div>
 {error&&<div className="crud-error" role="alert">{error}</div>}
 <div className="crud-list">{rows.map((row,index)=><article className="crud-row" key={`${keyFor(table,row)}-${index}`}><div className="crud-row-main"><strong>{row.name||row.title||row.display_name||row.code||row.id||`Record ${index+1}`}</strong><span>{keyFor(table,row)}</span></div><div className="crud-actions"><button className="secondary" onClick={()=>open(row)}><Edit3 size={15}/> Edit</button><button className="danger" onClick={()=>remove(row)}><Trash2 size={15}/> Delete</button></div></article>)}{!busy&&!rows.length&&<div className="empty-state"><Database size={24}/><p>No records in {label}.</p></div>}</div>
 <div className="crud-pagination"><button className="secondary" disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={15}/> Previous</button><span>Page {page+1} of {pageCount}</span><button className="secondary" disabled={busy||page+1>=pageCount} onClick={()=>setPage(p=>p+1)}>Next <ChevronRight size={15}/></button></div>
 {editor&&<div className="crud-overlay" role="dialog" aria-modal="true"><div className="crud-modal"><div className="crud-modal-head"><div><span className="eyebrow">{Object.keys(editor).length?'EDIT':'CREATE'}</span><h2>{label}</h2></div><button className="icon-button" onClick={()=>setEditor(null)} aria-label="Close editor"><X/></button></div><textarea value={draft} onChange={e=>setDraft(e.target.value)} spellCheck="false"/><div className="crud-modal-actions"><button className="secondary" onClick={()=>setEditor(null)}>Cancel</button><button className="primary" disabled={busy} onClick={save}><Save size={16}/> {busy?'Saving…':'Save changes'}</button></div></div></div>}
 </section>;
}
