import { useEffect,useState } from 'react';
import { BarChart3,Building2,ChevronRight,QrCode,RefreshCw,ShieldCheck,Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listBusinesses,listLocations,listBusinessQrs,getAnalytics,getReviewAnalytics } from '../services/business';

function Card({children,className=''}){return <section className={`detail-panel business-card ${className}`}>{children}</section>}
function Loading(){return <div className="empty-state"><p>Loading business workspace…</p></div>}

export default function BusinessDashboardPage(){
 const[data,setData]=useState({businesses:[],locations:[],qrs:[],analytics:null,reviews:null});
 const[active,setActive]=useState(null); const[loading,setLoading]=useState(true); const[error,setError]=useState(null);
 async function load(){setLoading(true);setError(null);try{const businesses=await listBusinesses();const first=businesses?.[0];if(!first){setData({businesses:[],locations:[],qrs:[],analytics:null,reviews:null});return}setActive(first.id);const [locations,qrs,analytics,reviews]=await Promise.all([listLocations(first.id),listBusinessQrs(first.id),getAnalytics(first.id),getReviewAnalytics(first.id)]);setData({businesses,locations:locations??[],qrs:qrs??[],analytics,reviews});}catch(e){setError(e.message||'Unable to load business workspace.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 if(loading)return <section className="page"><Loading/></section>;
 if(error)return <section className="page"><div className="empty-state"><h2>Business workspace unavailable</h2><p>{error}</p><button className="secondary" onClick={load}><RefreshCw size={16}/>Retry</button></div></section>;
 if(!data.businesses.length)return <section className="page"><div className="business-hero"><span className="eyebrow">KLEENEST FOR BUSINESS</span><h1>Turn your location into a <em>living profile.</em></h1><p>No managed business is connected to this account yet. Business onboarding is the next step.</p><Link className="primary" to="/business">Start business setup</Link></div></section>;
 const business=data.businesses.find(b=>b.id===active)||data.businesses[0],a=data.analytics||{},r=data.reviews||{};
 return <section className="page business-page">
   <div className="page-header"><div><span className="eyebrow">BUSINESS COMMAND CENTER</span><h1>{business.name||'Your business'}</h1><p>Manage locations, QR check-ins, reputation, and local demand from one place.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/>Refresh</button></div>
   {data.businesses.length>1&&<div className="business-switcher">{data.businesses.map(b=><button key={b.id} className={b.id===business.id?'selected':''} onClick={async()=>{setActive(b.id);const [locations,qrs,analytics,reviews]=await Promise.all([listLocations(b.id),listBusinessQrs(b.id),getAnalytics(b.id),getReviewAnalytics(b.id)]);setData(x=>({...x,locations:locations??[],qrs:qrs??[],analytics,reviews}))}}>{b.name}</button>)}</div>}
   <div className="business-stat-grid"><div><Building2/><strong>{data.locations.length}</strong><span>managed locations</span></div><div><QrCode/><strong>{data.qrs.length}</strong><span>QR codes</span></div><div><BarChart3/><strong>{a.total_check_ins??a.check_ins??0}</strong><span>check-ins</span></div><div><Star/><strong>{Number(r.average_rating??r.avg_rating??0).toFixed(1)}</strong><span>review rating</span></div></div>
   <div className="business-grid">
    <Card><div className="panel-heading"><div><span className="eyebrow">LOCATIONS</span><h2>Location network</h2></div><Building2 size={22}/></div>{data.locations.length?data.locations.map(l=><div className="business-row" key={l.id}><div><strong>{l.name}</strong><span>{[l.city,l.state].filter(Boolean).join(', ')||l.address||'Address not set'}</span></div><ChevronRight size={17}/></div>):<p className="observation-copy">No business locations yet.</p>}</Card>
    <Card><div className="panel-heading"><div><span className="eyebrow">QR LIFECYCLE</span><h2>Check-in codes</h2></div><QrCode size={22}/></div>{data.qrs.length?data.qrs.map(q=><div className="business-row" key={q.id}><div><strong>{q.label||'Kleenest QR'}</strong><span>{q.active?'Active':'Inactive'} · {q.purpose||'checkin'}</span></div><span className={`status-pill ${q.active?'on':''}`}>{q.active?'LIVE':'OFF'}</span></div>):<p className="observation-copy">No QR codes have been created for this business.</p>}</Card>
   </div>
   <Card><div className="panel-heading"><div><span className="eyebrow">LOCATION INTELLIGENCE</span><h2>What customers are telling you</h2></div><ShieldCheck size={22}/></div><div className="business-insights"><div><strong>{a.unique_visitors??a.unique_users??0}</strong><span>unique visitors</span></div><div><strong>{a.directions_requests??a.route_events??0}</strong><span>directions requests</span></div><div><strong>{a.arrivals??a.visits??0}</strong><span>arrivals</span></div><div><strong>{r.total_reviews??r.review_count??0}</strong><span>reviews</span></div></div></Card>
 </section>
}
