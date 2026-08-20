import {useEffect,useMemo,useState} from 'react';
import {Bell,CheckCheck,Radio,Route as RouteIcon,Tag} from 'lucide-react';
import {listMyNotifications,markAllNotificationsRead,markNotificationRead} from '../services/notifications';

const INTELLIGENCE_TYPES=new Set(['operational_attention','demand_opportunity','high_activity_zone']);

export default function NotificationsPage(){
 const[items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[busy,setBusy]=useState(false);
 const load=()=>{setLoading(true);setError(null);listMyNotifications().then(setItems).catch(e=>setError(e.message||'Unable to load notifications.')).finally(()=>setLoading(false));};
 useEffect(load,[]);
 async function read(id){try{await markNotificationRead(id);setItems(v=>v.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n));}catch(e){setError(e.message||'Unable to update notification.');}}
 async function readAll(){setBusy(true);try{await markAllNotificationsRead();setItems(v=>v.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));}catch(e){setError(e.message||'Unable to mark notifications read.');}finally{setBusy(false);}}
 const intelligenceItems=useMemo(()=>items.filter(n=>INTELLIGENCE_TYPES.has(n.type)||String(n.type||'').startsWith('intelligence')), [items]);
 return <section className="page">
  <div className="page-header"><div><span className="eyebrow">NETWORK INTELLIGENCE</span><h1>Notifications</h1><p>Actionable signals from the Kleenest network appear here alongside rewards, reviews, follows, contests, and activity.</p></div><button className="secondary" onClick={readAll} disabled={busy||!items.some(n=>!n.read_at)}><CheckCheck size={17}/>{busy?'Updating…':'Mark all read'}</button></div>
  {error&&<div className="form-error">{error}</div>}
  {!loading&&intelligenceItems.length>0&&<section className="detail-panel business-card"><div className="panel-heading"><div><span className="eyebrow">ACTIONABLE INTELLIGENCE</span><h2>{intelligenceItems.filter(n=>!n.read_at).length} active signal{intelligenceItems.filter(n=>!n.read_at).length===1?'':'s'}</h2></div><Radio size={21}/></div><div className="business-intelligence-list">{intelligenceItems.slice(0,5).map(n=><div className={`business-row ${n.read_at?'read':''}`} key={`intel-${n.id}`}><div><strong>{n.title||n.type}</strong><span>{n.body||n.message||'Intelligence signal requires attention.'}</span><small>{n.created_at?new Date(n.created_at).toLocaleString():''}</small></div><div className="business-intelligence-score">{n.type==='demand_opportunity'?<Tag size={18}/>:n.type==='high_activity_zone'?<RouteIcon size={18}/>:<Bell size={18}/>}<button className="secondary" onClick={()=>!n.read_at&&read(n.id)}>{n.read_at?'Read':'Acknowledge'}</button></div></div>)}</div></section>}
  {loading?<div className="loading-state">Loading…</div>:items.length?<div className="notification-list">{items.map(n=><button key={n.id} className={`notification-item ${n.read_at?'read':''}`} onClick={()=>!n.read_at&&read(n.id)}><Bell size={20}/><span><strong>{n.title||n.type||'Kleenest activity'}</strong><span>{n.body||n.message||''}</span><small>{n.created_at?new Date(n.created_at).toLocaleString():''}</small></span></button>)}</div>:<div className="empty-state"><h3>No notifications yet</h3><p>Rewards and community activity will appear here.</p></div>}
 </section>;
}
