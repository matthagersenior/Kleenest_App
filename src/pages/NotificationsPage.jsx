import {useEffect,useState} from 'react';
import {Bell,CheckCheck} from 'lucide-react';
import {listMyNotifications,markAllNotificationsRead,markNotificationRead} from '../services/notifications';

export default function NotificationsPage(){
 const[items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[busy,setBusy]=useState(false);
 const load=()=>{setLoading(true);listMyNotifications().then(setItems).catch(e=>setError(e.message||'Unable to load notifications.')).finally(()=>setLoading(false));};
 useEffect(load,[]);
 async function read(id){try{await markNotificationRead(id);setItems(v=>v.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n));}catch(e){setError(e.message||'Unable to update notification.');}}
 async function readAll(){setBusy(true);try{await markAllNotificationsRead();setItems(v=>v.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));}catch(e){setError(e.message||'Unable to mark notifications read.');}finally{setBusy(false);}}
 return <section className="page"><div className="page-header"><div><span className="eyebrow">COMMUNITY</span><h1>Notifications</h1><p>Stay current on rewards, reviews, follows, contests, and activity around your places.</p></div><button className="secondary" onClick={readAll} disabled={busy||!items.some(n=>!n.read_at)}><CheckCheck size={17}/>{busy?'Updating…':'Mark all read'}</button></div>{error&&<div className="form-error">{error}</div>}{loading?<div className="loading-state">Loading…</div>:items.length?<div className="notification-list">{items.map(n=><button key={n.id} className={`notification-item ${n.read_at?'read':''}`} onClick={()=>!n.read_at&&read(n.id)}><Bell size={20}/><span><strong>{n.title||n.type||'Kleenest activity'}</strong><span>{n.body||n.message||''}</span><small>{n.created_at?new Date(n.created_at).toLocaleString():''}</small></span></button>)}</div>:<div className="empty-state"><h3>No notifications yet</h3><p>Rewards and community activity will appear here.</p></div>}</section>;
}
