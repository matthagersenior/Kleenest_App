import { lazy,Suspense,useEffect,useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { Download,Menu,Users,X } from 'lucide-react';
import MapSurface from './components/MapSurface.jsx';
import RoutePlannerPage from './pages/RoutePlannerPage.jsx';
import CapabilityCenterPage from './pages/CapabilityCenterPage.jsx';
import { discoverUniversalLocations } from './services/universalDiscovery.js';
import { bootstrapLocationIntelligence } from './services/locationBootstrap.js';
import { signOut,getCurrentUser } from './services/auth.js';
import { createOfflinePack,getCachedLocations,getCachedPacks } from './services/offlinePacks.js';
import { useAuth } from './context/AuthContext.jsx';

const LegacyAppRuntime=lazy(()=>import('./AppRuntime.jsx'));
const NETWORK_FALLBACK={latitude:38.627,longitude:-90.199};
function cachedPlaceRows(rows){return rows.map(row=>row?.snapshot?{...row.snapshot,location_id:row.location_id}:row).filter(Boolean);}
function boundsAround(location,radiusKm=10){const lat=Number(location?.latitude),lng=Number(location?.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;const dLat=radiusKm/111;const dLng=radiusKm/(111*Math.max(.2,Math.cos(lat*Math.PI/180)));return{west:lng-dLng,south:lat-dLat,east:lng+dLng,north:lat+dLat};}

function MapWorkspace(){
 const{authenticated}=useAuth();
 const[userLocation,setUserLocation]=useState(null),[places,setPlaces]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[offline,setOffline]=useState(typeof navigator!=='undefined'&&!navigator.onLine),[offlinePack,setOfflinePack]=useState(null),[menuOpen,setMenuOpen]=useState(false),[saving,setSaving]=useState(false);
 const loadCached=async()=>{const packs=await getCachedPacks();const pack=packs[0];const rows=await getCachedLocations(pack?.id);setOfflinePack(pack||null);setPlaces(cachedPlaceRows(rows));setLoading(false);if(!rows.length)setError('No saved map area is available offline yet.');};
 const loadNetwork=async(location)=>{if(!location){setLoading(false);setPlaces([]);return;}setLoading(true);setError(null);try{const user=await getCurrentUser().catch(()=>null);const rows=await discoverUniversalLocations({latitude:location.latitude,longitude:location.longitude,radiusKm:50,userId:user?.id});setPlaces(rows);setOffline(false);if(!rows.length)setError('No locations were found in the current discovery area.');}catch(err){setOffline(true);try{await loadCached();}catch{setError(err?.message||'Unable to load the location network.');}}finally{setLoading(false);}};
 useEffect(()=>{let active=true;const online=()=>{setOffline(false);loadNetwork(userLocation||NETWORK_FALLBACK)};const offlineNow=()=>{setOffline(true);loadCached().catch(()=>{})};window.addEventListener('online',online);window.addEventListener('offline',offlineNow);getCachedPacks().then(rows=>setOfflinePack(rows[0]||null)).catch(()=>{});
   const startDiscovery=()=>loadNetwork(NETWORK_FALLBACK);
   if(!navigator.geolocation){startDiscovery();return()=>{active=false;window.removeEventListener('online',online);window.removeEventListener('offline',offlineNow)}}
   navigator.geolocation.getCurrentPosition(pos=>{if(!active)return;const loc={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy||0};setUserLocation(loc);loadNetwork(loc);bootstrapLocationIntelligence({location:loc,membershipType:'consumer'}).catch(()=>{})},()=>{if(active)startDiscovery()},{enableHighAccuracy:true,maximumAge:30000,timeout:10000});
   return()=>{active=false;window.removeEventListener('online',online);window.removeEventListener('offline',offlineNow)}
 },[]);
 const saveOffline=async()=>{if(!authenticated){setError('Sign in to save an offline map area.');return;}const bounds=boundsAround(userLocation||NETWORK_FALLBACK);if(!bounds){setError('Choose a discovery area before saving an offline map.');return;}setSaving(true);setError(null);try{const pack=await createOfflinePack({kind:'area',name:'Nearby Kleenest map',bounds});setOfflinePack(pack);setPlaces(cachedPlaceRows(await getCachedLocations(pack.id)));}catch(err){setError(err?.message||'Unable to save this area offline.')}finally{setSaving(false)}};
 return <div className="app-shell map-workspace-shell"><header className="topbar"><Link className="brand" to="/">Kleenest</Link><nav className={`nav ${menuOpen?'open':''}`}><Link to="/">Home</Link><Link className="active" to="/map">Map</Link><Link to="/discover">Discover</Link><Link to="/route">Route</Link><Link to="/profile">Profile</Link>{authenticated&&<Link to="/social"><Users size={15}/>Social</Link>}<Link to="/capabilities">Capabilities</Link></nav><div className="header-actions">{authenticated&&<button className="secondary compact" onClick={saveOffline} disabled={saving||offline}><Download size={15}/>{saving?'Saving…':'Offline'}</button>}{authenticated?<button className="secondary compact" onClick={signOut}>Sign out</button>:<Link className="primary compact" to="/profile">Sign in</Link>}<button className="icon-button menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu">{menuOpen?<X/>:<Menu/>}</button></div></header><main className="map-main-page"><div className="map-runtime-status" role="status"><span className={offline?'status-dot offline':'status-dot'}/><span>{offline?'Offline map':loading?'Discovering nearby locations…':`${places.length.toLocaleString()} locations ready`}</span>{!userLocation&&!offline&&<small>Network discovery area · location permission optional</small>}{offlinePack&&<small>Saved area available</small>}{error&&<button onClick={()=>loadNetwork(userLocation||NETWORK_FALLBACK)}>{error}</button>}</div><MapSurface places={places} userLocation={userLocation} onLocation={setUserLocation}/></main><footer><span>© {new Date().getFullYear()} Kleenest</span><span>Find it. Check it. Know it.</span></footer></div>;
}
function LegacyRuntimeFallback(){return <main className="empty-state loading-state" role="status"><span className="loading-dot"/><div><strong>Loading Kleenest</strong><p>Preparing the requested workspace…</p></div></main>}
export default function CanonicalAppRuntime(){const location=useLocation();if(location.pathname==='/map')return <MapWorkspace/>;if(location.pathname==='/route')return <RoutePlannerPage/>;if(location.pathname==='/capabilities')return <CapabilityCenterPage/>;return <Suspense fallback={<LegacyRuntimeFallback/>}><LegacyAppRuntime/></Suspense>}
