import { lazy,Suspense,useEffect,useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { LocateFixed,Menu,Search,Signpost,Users,X } from 'lucide-react';
import MapSurface from './components/MapSurface.jsx';
import MapLegend from './components/MapLegend.jsx';
import { listPlaces } from './services/places.js';
import { signOut } from './services/auth.js';
import { useAuth } from './context/AuthContext.jsx';

const LegacyAppRuntime=lazy(()=>import('./AppRuntime.jsx'));

function MapWorkspace(){
  const [userLocation,setUserLocation]=useState(null);
  const [places,setPlaces]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const { authenticated }=useAuth();

  const loadNetwork=(location)=>{
    setLoading(true);setError(null);
    listPlaces({category:'all',limit:500,...(location?{userLocation:location,radiusKm:50}:{sort:'recommended'})})
      .then(rows=>setPlaces(Array.isArray(rows)?rows:[]))
      .catch(err=>setError(err?.message||'Unable to load the nearby network.'))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{
    let active=true;
    if(!navigator.geolocation){setLoading(false);setError('Location is not supported by this browser.');loadNetwork(null);return undefined;}
    navigator.geolocation.getCurrentPosition(
      position=>{if(!active)return;const location={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy||0};setUserLocation(location);loadNetwork(location)},
      ()=>{if(!active)return;setError('Location permission was unavailable. Showing the network without proximity filtering.');loadNetwork(null)},
      {enableHighAccuracy:true,maximumAge:30000,timeout:10000}
    );
    return()=>{active=false};
  },[]);

  const refreshLocation=()=>{
    if(!navigator.geolocation){setError('Location is not supported by this browser.');return;}
    setError(null);
    navigator.geolocation.getCurrentPosition(
      position=>{const location={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy||0};setUserLocation(location);loadNetwork(location)},
      ()=>setError('We could not access your location. Check browser location permission.'),
      {enableHighAccuracy:true,maximumAge:0,timeout:10000}
    );
  };

  return <div className="app-shell map-workspace-shell">
    <header className="topbar">
      <Link className="brand" to="/">Kleenest</Link>
      <nav className={`nav ${menuOpen?'open':''}`}>
        <Link to="/">Home</Link><Link className="active" to="/map">Map</Link><Link to="/discover">Discover</Link><Link to="/profile">Profile</Link>
        {authenticated&&<Link to="/social"><Users size={15}/>Social</Link>}
      </nav>
      <div className="header-actions">
        {authenticated?<button className="secondary compact" onClick={signOut}>Sign out</button>:<Link className="primary compact" to="/profile">Sign in</Link>}
        <button className="icon-button menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu">{menuOpen?<X/>:<Menu/>}</button>
      </div>
    </header>
    <main>
      <section className="page map-page-canonical">
        <div className="page-header">
          <div><span className="eyebrow">LIVE LOCATION NETWORK</span><h1>Explore Kleenest</h1><p>Search nearby businesses, bathrooms, amenities, brands, fleet opportunities, events and rewards from the canonical network.</p></div>
          <div className="hero-actions"><button className="secondary" onClick={refreshLocation}><LocateFixed size={17}/>{userLocation?'Refresh location':'Use my location'}</button><Link className="secondary" to="/discover"><Search size={17}/>Browse all places</Link></div>
        </div>
        {error&&<div className="empty-state"><h3>Map data notice</h3><p>{error}</p><button className="secondary" onClick={refreshLocation}><Signpost size={16}/>Retry location discovery</button></div>}
        {loading&&<div className="empty-state loading-state" role="status"><span className="loading-dot"/><div><strong>Updating the canonical map</strong><p>Loading locations and fresh map intelligence…</p></div></div>}
        <MapLegend/>
        <MapSurface places={places} userLocation={userLocation} onLocation={setUserLocation}/>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} Kleenest</span><span>Find it. Check it. Know it.</span></footer>
  </div>;
}

function LegacyRuntimeFallback(){return <main className="empty-state loading-state" role="status"><span className="loading-dot"/><div><strong>Loading Kleenest</strong><p>Preparing the requested workspace…</p></div></main>}

export default function CanonicalAppRuntime(){
  const location=useLocation();
  if(location.pathname==='/map')return <MapWorkspace/>;
  return <Suspense fallback={<LegacyRuntimeFallback/>}><LegacyAppRuntime/></Suspense>;
}