import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Map, Search, Star, Store, Trophy, UserRound, Menu, X } from 'lucide-react';
import { listCategories, listPlaces, getPlace } from './services/places';
import { signOut } from './services/auth';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AdminDataPage from './components/AdminDataPage';
import MapSurface from './components/MapSurface';

function Shell() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const { authenticated, profile } = useAuth();
  const nav = [['/', 'Home'], ['/map', 'Map'], ['/discover', 'Discover'], ['/profile', 'Profile']];
  const isAdmin = profile?.is_admin || ['admin','owner','platform_admin','super_admin'].includes(String(profile?.role || '').toLowerCase());
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/" onClick={() => setOpen(false)}>Kleenest</Link>
      <nav className={`nav ${open ? 'open' : ''}`}>
        {nav.map(([to, label]) => <Link key={to} className={location.pathname === to ? 'active' : ''} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
        {isAdmin && <Link to="/admin/data" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={() => setOpen(false)}>Admin</Link>}
        <Link to="/business" className="business-link" onClick={() => setOpen(false)}>For Businesses</Link>
      </nav>
      <div className="header-actions">
        {authenticated ? <button className="secondary compact" onClick={() => signOut()}>Sign out</button> : <button className="primary compact" onClick={() => setAuthOpen(true)}>Sign in</button>}
        <button className="icon-button menu-button" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
    </header>
    <main><Routes>
      <Route path="/" element={<Home />} /><Route path="/map" element={<MapPage />} /><Route path="/place/:id" element={<PlaceDetails />} />
      <Route path="/discover" element={<Discover />} /><Route path="/profile" element={<Profile onSignIn={() => setAuthOpen(true)} />} />
      <Route path="/business" element={<Business />} /><Route path="/admin/data" element={<AdminDataPage />} />
    </Routes></main>
    <footer><span>© {new Date().getFullYear()} Kleenest</span><span>Discover better places. Leave better data.</span></footer>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </div>;
}

function usePlaces(category = 'all') {
  const [state, setState] = useState({ places: [], loading: true, error: null });
  useEffect(() => { let active = true; setState(s => ({ ...s, loading: true, error: null })); listPlaces({ category }).then(places => { if (active) setState({ places, loading: false, error: null }); }).catch(error => { if (active) setState({ places: [], loading: false, error: error.message || 'Unable to load places.' }); }); return () => { active = false; }; }, [category]);
  return state;
}

function Home() { const { places, loading } = usePlaces(); return <section className="page home-page"><div className="hero"><span className="eyebrow">LOCAL DISCOVERY, REBUILT</span><h1>Find places worth<br /><em>coming back to.</em></h1><p>Kleenest brings local places, real experiences, check-ins, reviews, rewards, and business tools into one clean community.</p><div className="hero-actions"><Link className="primary" to="/map"><Map size={18}/> Explore the map</Link><Link className="secondary" to="/discover"><Search size={18}/> Discover places</Link></div></div><section className="section"><div className="section-heading"><div><span className="eyebrow">NEAR YOU</span><h2>Places to explore</h2></div><Link to="/map">View map →</Link></div><div className="place-grid">{loading ? <LoadingState /> : places.slice(0, 3).map(place => <PlaceCard key={place.id} place={place} />)}</div></section><section className="feature-grid"><div className="feature"><Trophy /><div><h3>Earn while you explore</h3><p>Check in, complete challenges, and build your Kleenest reputation.</p></div></div><div className="feature"><Store /><div><h3>Built for local businesses</h3><p>Profiles, reviews, promotions, campaigns, contests, QR check-ins, and analytics.</p></div></div></section></section>; }

function PlaceCard({ place }) { return <Link className="place-card" to={`/place/${place.id}`}><div className="place-image">{place.category.slice(0, 1).toUpperCase()}</div><div><span className="tag">{place.category.replaceAll('_', ' ')}</span><h3>{place.name}</h3><div className="meta"><strong>★ {place.rating.toFixed(1)}</strong><span>•</span><span>{place.distance ?? 'Local'}</span></div></div></Link>; }

function MapPage() { const [active, setActive] = useState('all'); const [categories, setCategories] = useState([]); const { places, loading, error } = usePlaces(active); useEffect(() => { listCategories().then(setCategories).catch(() => setCategories([])); }, []); const filters = useMemo(() => [{ slug: 'all', name: 'All' }, ...categories], [categories]); return <section className="page map-page"><div className="page-header"><div><span className="eyebrow">EXPLORE</span><h1>Map</h1><p>Filter local places, including automatically imported known bathrooms.</p></div><button className="primary"><Search size={18}/> Search this area</button></div><div className="filters">{filters.map(category => <button key={category.slug} className={active === category.slug ? 'selected' : ''} onClick={() => setActive(category.slug)}>{category.name}</button>)}</div><div className="map-layout"><div className="map-canvas"><MapSurface places={places} /></div><aside className="map-results">{error ? <div className="empty-state"><h3>Could not load places</h3><p>{error}</p></div> : loading ? <LoadingState /> : places.map(p => <PlaceCard key={p.id} place={p}/>)}</aside></div></section>; }

function PlaceDetails() { const { id } = useParams(); const navigate = useNavigate(); const [place, setPlace] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(null); const [checkedIn, setCheckedIn] = useState(false); useEffect(() => { let active = true; setLoading(true); getPlace(id).then(result => { if (active) setPlace(result); }).catch(e => { if (active) setError(e.message || 'Unable to load this place.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [id]); if (loading) return <section className="page"><Link to="/map" className="back-link"><ArrowLeft size={16}/> Back to map</Link><LoadingState /></section>; if (error || !place) return <section className="page"><Link to="/map" className="back-link"><ArrowLeft size={16}/> Back to map</Link><div className="empty-state"><h2>{error ? 'Unable to load place' : 'Place not found'}</h2><p>{error || 'This place is no longer available.'}</p></div></section>; return <section className="page details-page"><button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16}/> Back</button><div className="details-hero"><div className="details-image">{place.category.slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">{place.category.replaceAll('_', ' ').toUpperCase()}</span><h1>{place.name}</h1><div className="rating"><Star size={18} fill="currentColor"/> <strong>{place.rating.toFixed(1)}</strong><span>({place.reviews} reviews)</span></div><p>{place.description}</p><span className="address">{place.address || 'Address coming soon'} {place.distance ? `· ${place.distance}` : ''}</span></div></div><div className="details-grid"><section className="detail-panel"><h2>Community reviews</h2><div className="review"><div className="review-stars">★★★★★</div><strong>Review surface ready</strong><p>Authenticated community reviews will connect here next, using this canonical place ID.</p></div></section><aside className="detail-panel checkin-panel"><Trophy size={28}/><h2>Check in</h2><p>Check-ins verify visits and can power rewards, contests, and your Kleenest activity.</p><button className="primary" onClick={() => setCheckedIn(true)} disabled={checkedIn}>{checkedIn ? <><CheckCircle2 size={18}/> Checked in</> : 'Check in'}</button></aside></div></section>; }

function Discover() { const { places, loading } = usePlaces(); return <section className="page"><div className="page-header"><div><span className="eyebrow">DISCOVERY</span><h1>Discover</h1><p>Reviews, recommendations, promotions, and community activity.</p></div></div><div className="place-grid">{loading ? <LoadingState /> : places.map(place => <PlaceCard key={place.id} place={place} />)}</div></section>; }

function Profile({ onSignIn }) { const { authenticated, profile } = useAuth(); return <section className="page"><div className="profile-card"><div className="avatar"><UserRound/></div><div><span className="eyebrow">YOUR PROFILE</span><h1>{authenticated ? (profile?.display_name || 'Kleenest member') : 'Welcome to Kleenest'}</h1><p>{authenticated ? 'Your account, check-ins, reviews, points, and community activity live here.' : 'Sign in to manage your profile, reviews, check-ins, rewards, and social activity.'}</p>{authenticated ? <div className="meta"><strong>{profile?.points ?? 0} points</strong><span>•</span><span>{profile?.total_check_ins ?? 0} check-ins</span></div> : <button className="primary" onClick={onSignIn}>Sign in</button>}</div></div></section>; }

function Business() { return <section className="page"><div className="business-hero"><span className="eyebrow">KLEENEST FOR BUSINESS</span><h1>Turn local attention<br /><em>into loyal customers.</em></h1><p>One business workspace for locations, profile content, reviews, promotions, campaigns, contests, QR check-ins, and analytics.</p><button className="primary"><Store size={18}/> Create a business profile</button></div><div className="feature-grid"><div className="feature"><Store/><div><h3>Business workspace</h3><p>One canonical home for every location and business action.</p></div></div><div className="feature"><Trophy/><div><h3>QR + rewards</h3><p>Check-ins can power engagement, contests, and analytics.</p></div></div></div></section>; }

function LoadingState() { return <div className="empty-state"><p>Loading places…</p></div>; }
export default function App() { return <Shell />; }
