import { useEffect,useState } from 'react';
import { Link,useLocation } from 'react-router-dom';
import { LocateFixed,Menu,Search,Signpost,Users,X } from 'lucide-react';
import LegacyAppRuntime from './AppRuntime.jsx';
import MapSurface from './components/MapSurface.jsx';
import { listPlaces } from './services/places.js';
import { signOut } from './services/auth.js';
import { useAuth } from './context/AuthContext.jsx';

function MapWorkspace(){
  const [userLocation,setUserLocation]=useState(null);
  const [places,setPlaces]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const { authenticated }=useAuth();

  useEffect(()=>{
    let active=true;
    if(!navigator.geolocation){setLoading(false);setError('Location is not supported by this browser.');return undefined;}
    navigator.geolocation.getCurrentPosition(
      position=>active&&setUserLocation({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy||0}),
      ()=>active&&setError('Location permission was unavailable. Showing the network without proximity filtering.'),
      {enableHighAccuracy:true,maximumAge:30000,timeout:10000}
    );
    return()=>{active=false};
  },[]);

  useEffect(()=>{
    let active=true;
    setLoading(true);setError(null);
    listPlaces({category:'all',limit:500,...(userLocation?{userLocation,radiusKm:30}:{sort:'recommended'})})
      .then(rows=>active&&setPlaces(Array.isArray(rows)?rows:[]))
      .catch(err=>active&&setError(err?.message||'Unable to load the nearby network.'))
      .finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },[userLocation]);

  const refreshLocation=()=>{
    if(!navigator.geolocation){setError('Location is not supported by this browser.');return;}
    setError(null);
    navigator.geolocation.getCurrentPosition(
      position=>setUserLocation({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy||0}),
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
        <MapSurface places={places} userLocation={userLocation} onLocation={setUserLocation}/>
      </section>
    </main>
    <footer><span>© {new Date().getFullYear()} Kleenest</span><span>Find it. Check it. Know it.</span></footer>
  </div>;
}

export default function CanonicalAppRuntime(){
  const location=useLocation();
  if(location.pathname==='/map')return <MapWorkspace/>;
  return <LegacyAppRuntime/>;
}
