import { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Map, Search, UserRound, Store, Trophy, Menu, X } from 'lucide-react';

const places = [
  { id: '1', name: 'Kleenest Coffee House', category: 'Cafe', rating: 4.8, distance: '0.4 mi' },
  { id: '2', name: 'Main Street Market', category: 'Restaurant', rating: 4.6, distance: '0.7 mi' },
  { id: '3', name: 'River Road Fuel', category: 'Gas Station', rating: 4.4, distance: '1.1 mi' },
];

function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = [
    ['/', 'Home'], [' /map'.trim(), 'Map'], ['/discover', 'Discover'], ['/profile', 'Profile'],
  ];

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/" onClick={() => setOpen(false)}>Kleenest</Link>
      <nav className={`nav ${open ? 'open' : ''}`}>
        {nav.map(([to, label]) => <Link key={to} className={location.pathname === to ? 'active' : ''} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link to="/business" className="business-link" onClick={() => setOpen(false)}>For Businesses</Link>
      </nav>
      <button className="icon-button menu-button" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
    </header>
    <main><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/business" element={<Business />} />
    </Routes></main>
    <footer><span>© {new Date().getFullYear()} Kleenest</span><span>Discover better places. Leave better data.</span></footer>
  </div>;
}

function Home() {
  return <section className="page home-page">
    <div className="hero"><span className="eyebrow">LOCAL DISCOVERY, REBUILT</span><h1>Find places worth<br /><em>coming back to.</em></h1><p>Kleenest brings local places, real experiences, check-ins, reviews, rewards, and business tools into one clean community.</p><div className="hero-actions"><Link className="primary" to="/map"><Map size={18}/> Explore the map</Link><Link className="secondary" to="/discover"><Search size={18}/> Discover places</Link></div></div>
    <section className="section"><div className="section-heading"><div><span className="eyebrow">NEAR YOU</span><h2>Places to explore</h2></div><Link to="/map">View map →</Link></div><div className="place-grid">{places.map(place => <PlaceCard key={place.id} place={place} />)}</div></section>
    <section className="feature-grid"><div className="feature"><Trophy /><div><h3>Earn while you explore</h3><p>Check in, complete challenges, and build your Kleenest reputation.</p></div></div><div className="feature"><Store /><div><h3>Built for local businesses</h3><p>Profiles, reviews, promotions, QR check-ins, analytics, and more.</p></div></div></section>
  </section>;
}

function PlaceCard({ place }) { return <Link className="place-card" to={`/map?place=${place.id}`}><div className="place-image">{place.category.slice(0, 1)}</div><div><span className="tag">{place.category}</span><h3>{place.name}</h3><div className="meta"><strong>★ {place.rating}</strong><span>•</span><span>{place.distance}</span></div></div></Link>; }

function MapPage() { const filters = ['All', 'Restaurants', 'Cafes', 'Gas Stations', 'Shopping', 'Parks', 'Services']; return <section className="page map-page"><div className="page-header"><div><span className="eyebrow">EXPLORE</span><h1>Map</h1><p>Discover local places and open their full details.</p></div><button className="primary"><Search size={18}/> Search this area</button></div><div className="filters">{filters.map((f, i) => <button key={f} className={i === 0 ? 'selected' : ''}>{f}</button>)}</div><div className="map-layout"><div className="map-canvas"><div className="map-placeholder"><Map size={42}/><strong>Map surface ready</strong><span>Connect the canonical location provider here.</span></div></div><aside className="map-results">{places.map(p => <PlaceCard key={p.id} place={p}/>)}</aside></div></section>; }

function Discover() { return <section className="page"><div className="page-header"><div><span className="eyebrow">DISCOVERY</span><h1>Discover</h1><p>Reviews, recommendations, promotions, and community activity.</p></div></div><div className="empty-state"><Search size={38}/><h2>Your local feed starts here.</h2><p>As the new data layer comes online, this surface will combine trusted place data with community activity.</p></div></section>; }

function Profile() { return <section className="page"><div className="profile-card"><div className="avatar"><UserRound/></div><div><span className="eyebrow">YOUR PROFILE</span><h1>Welcome to Kleenest</h1><p>Sign in to manage your profile, reviews, check-ins, rewards, and social activity.</p><button className="primary">Sign in</button></div></div><div className="stat-grid"><div><strong>0</strong><span>Check-ins</span></div><div><strong>0</strong><span>Reviews</span></div><div><strong>0</strong><span>Points</span></div></div></section>; }

function Business() { return <section className="page"><div className="business-hero"><span className="eyebrow">KLEENEST FOR BUSINESS</span><h1>Turn local attention<br /><em>into loyal customers.</em></h1><p>One business workspace for locations, profile content, reviews, promotions, campaigns, contests, QR check-ins, and analytics.</p><button className="primary"><Store size={18}/> Create a business profile</button></div><div className="feature-grid"><div className="feature"><Store/><div><h3>Business workspace</h3><p>One canonical home for every location and business action.</p></div></div><div className="feature"><Trophy/><div><h3>QR + rewards</h3><p>Check-ins can power engagement, contests, and analytics.</p></div></div></div></section>; }

export default function App() { return <Shell />; }
