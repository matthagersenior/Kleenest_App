import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MapSurface from './components/MapSurface.jsx';
import CapabilityCenterPage from './pages/CapabilityCenterPage.jsx';
import FleetOperationsPage from './pages/FleetOperationsPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import SocialPage from './pages/SocialPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import RouteGuard from './components/RouteGuard.jsx';
import KleenestFeatureRoutes from './components/KleenestFeatureRoutes.jsx';
import { discoverUniversalLocations } from './services/universalDiscovery.js';
import { bootstrapLocationIntelligence } from './services/locationBootstrap.js';
import { getCurrentUser } from './services/auth.js';
import { createOfflinePack, getCachedLocations, getCachedPacks } from './services/offlinePacks.js';
import { useAuth } from './context/AuthContext.jsx';
import CanonicalConsumerRuntime from './CanonicalConsumerRuntime.jsx';
import WorkspaceShell from './components/WorkspaceShell.jsx';
import { CAPABILITIES } from './domain/capabilities.js';

const NETWORK_FALLBACK = { latitude: 38.627, longitude: -90.199 };

function cachedPlaceRows(rows) {
  return rows.map((row) => (row?.snapshot ? { ...row.snapshot, location_id: row.location_id } : row)).filter(Boolean);
}

function boundsAround(location, radiusKm = 10) {
  const lat = Number(location?.latitude);
  const lng = Number(location?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return { west: lng - dLng, south: lat - dLat, east: lng + dLng, north: lat + dLat };
}

function MapWorkspace() {
  const { authenticated } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  const [offlinePack, setOfflinePack] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCached = async () => {
    const packs = await getCachedPacks();
    const pack = packs[0];
    const rows = await getCachedLocations(pack?.id);
    setOfflinePack(pack || null);
    setPlaces(cachedPlaceRows(rows));
    setLoading(false);
    if (!rows.length) setError('No saved map area is available offline yet.');
  };

  const loadNetwork = async (location) => {
    if (!location) {
      setLoading(false);
      setPlaces([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser().catch(() => null);
      const rows = await discoverUniversalLocations({ latitude: location.latitude, longitude: location.longitude, radiusKm: 50, userId: user?.id });
      setPlaces(rows);
      setOffline(false);
      if (!rows.length) setError('No locations were found in the current discovery area.');
    } catch (err) {
      setOffline(true);
      try {
        await loadCached();
      } catch {
        setError(err?.message || 'Unable to load the location network.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const online = () => {
      setOffline(false);
      loadNetwork(userLocation || NETWORK_FALLBACK);
    };
    const offlineNow = () => {
      setOffline(true);
      loadCached().catch(() => {});
    };
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineNow);
    getCachedPacks().then((rows) => setOfflinePack(rows[0] || null)).catch(() => {});
    const startDiscovery = () => loadNetwork(NETWORK_FALLBACK);
    if (!navigator.geolocation) {
      startDiscovery();
      return () => {
        active = false;
        window.removeEventListener('online', online);
        window.removeEventListener('offline', offlineNow);
      };
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!active) return;
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy || 0 };
        setUserLocation(loc);
        loadNetwork(loc);
        bootstrapLocationIntelligence({ location: loc, membershipType: 'consumer' }).catch(() => {});
      },
      () => {
        if (active) startDiscovery();
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
    return () => {
      active = false;
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offlineNow);
    };
  }, []);

  const saveOffline = async () => {
    if (!authenticated) {
      setError('Sign in to save an offline map area.');
      return;
    }
    const bounds = boundsAround(userLocation || NETWORK_FALLBACK);
    if (!bounds) {
      setError('Choose a discovery area before saving an offline map.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const pack = await createOfflinePack({ kind: 'area', name: 'Nearby Kleenest map', bounds });
      setOfflinePack(pack);
      setPlaces(cachedPlaceRows(await getCachedLocations(pack.id)));
    } catch (err) {
      setError(err?.message || 'Unable to save this area offline.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkspaceShell>
      <main className="map-main-page">
        <div className="map-runtime-status" role="status">
          <span className={offline ? 'status-dot offline' : 'status-dot'} />
          <span>{offline ? 'Offline map' : loading ? 'Discovering nearby locations…' : `${places.length.toLocaleString()} locations ready`}</span>
          {!userLocation && !offline && <small>Network discovery area · location permission optional</small>}
          {offlinePack && <small>Saved area available</small>}
          {error && <button type="button" onClick={() => loadNetwork(userLocation || NETWORK_FALLBACK)}>{error}</button>}
          {authenticated && <button className="secondary compact" type="button" onClick={saveOffline} disabled={saving || offline}>{saving ? 'Saving…' : 'Save offline area'}</button>}
        </div>
        <MapSurface places={places} userLocation={userLocation} onLocation={setUserLocation} />
      </main>
    </WorkspaceShell>
  );
}

function FeatureSurface() {
  return (
    <Routes>
      <Route path="/games" element={<RouteGuard requireAuth><GamesPage /></RouteGuard>} />
      <Route path="/social" element={<RouteGuard requireAuth><SocialPage /></RouteGuard>} />
      <Route path="/notifications" element={<RouteGuard requireAuth><NotificationsPage /></RouteGuard>} />
      <KleenestFeatureRoutes />
    </Routes>
  );
}

function CanonicalRuntime() {
  const location = useLocation();
  if (location.pathname === '/map') return <MapWorkspace />;
  if (location.pathname === '/capabilities') return <RouteGuard capabilities={[CAPABILITIES.ADMIN]}><WorkspaceShell><CapabilityCenterPage /></WorkspaceShell></RouteGuard>;
  if (location.pathname === '/fleet-operations') return <WorkspaceShell><FleetOperationsPage /></WorkspaceShell>;
  if (location.pathname === '/' || location.pathname === '/discover' || location.pathname.startsWith('/place/') || location.pathname === '/profile' || location.pathname === '/check-in') return <WorkspaceShell><CanonicalConsumerRuntime /></WorkspaceShell>;
  return <FeatureSurface />;
}

export default CanonicalRuntime;
