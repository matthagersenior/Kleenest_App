import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, Search, SlidersHorizontal, Navigation, Heart, Plus, Minus, X } from 'lucide-react';
import './MapSurface.css';
import { supabase } from '../lib/supabase';
import { listMapNetworkNearby, searchMapLocations, MAP_CATEGORIES } from '../services/mapNetwork';

const DEFAULT_CENTER = [38.627, -90.199];
const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '/');
const CATEGORY_GLYPHS = { all: '✦', restroom: '🚻', restaurant: '🍽', cafe: '☕', gas_station: '⛽', shopping: '🛍', park: '🌳', service: '✦', health: '✚', public_safety: '◈', cooling_center: '❄' };
const AMENITIES = ['accessible','changing_table','baby_changing','handwashing','drinking_water','shower','parking','ev_charging','wifi','food','outdoor','pet_friendly'];
const AMENITY_LABELS = { accessible:'Accessible', changing_table:'Changing table', baby_changing:'Baby/family', handwashing:'Handwashing', drinking_water:'Drinking water', shower:'Showers', parking:'Parking', ev_charging:'EV charging', wifi:'Wi-Fi', food:'Food & drink', outdoor:'Outdoor', pet_friendly:'Pet friendly' };

function escapeHtml(value) { return String(value ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c])); }
function placeKey(place) { return String(place.location_id || place.id); }
function placeAmenities(place) {
  const raw = place.amenities || place.amenity_names || place.amenity_labels || [];
  if (Array.isArray(raw)) return raw.map(v => typeof v === 'object' ? String(v.name || v.category || '') : String(v)).map(v => v.toLowerCase().replaceAll(' ','_')).filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(v => v.trim().toLowerCase().replaceAll(' ','_')).filter(Boolean);
  return AMENITIES.filter(k => place[k] === true || place[`has_${k}`] === true);
}
function status(place) {
  const raw = String(place.bathroom_verification_status || place.bathroom_status || '').toLowerCase();
  if (place.is_verified === true || raw === 'verified' || raw === 'has_bathroom') return { key:'verified', label:'Verified' };
  if (place.category === 'restroom' || raw || place.has_bathroom || place.has_restroom) return { key:'reported', label:'Community reported' };
  return { key:'unknown', label:'Location' };
}
function distanceLabel(place) {
  const d = Number(place.distance_meters ?? (Number(place.distance_km) * 1000));
  if (!Number.isFinite(d)) return '';
  return d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`;
}
function markerIcon(place, selected, favorite) {
  const category = String(place.category || 'service');
  const s = status(place);
  return L.divIcon({ className:'kleenest-marker-wrapper', html:`<div class="kleenest-marker marker-${s.key} ${selected?'selected':''} ${favorite?'favorite':''}" aria-label="${escapeHtml(place.name || 'Kleenest location')}"><span>${CATEGORY_GLYPHS[category] || '✦'}</span>${favorite?'<b>♥</b>':''}</div>`, iconSize:[46,46], iconAnchor:[23,46], popupAnchor:[0,-42] });
}
function userIcon() { return L.divIcon({ className:'kleenest-user-wrapper', html:'<div class="kleenest-user-marker"><span></span></div>', iconSize:[34,34], iconAnchor:[17,17] }); }

export default function MapSurface({ places = [], onSelect, onBoundsChange, onLocation, userLocation }) {
  const nodeRef = useRef(null), mapRef = useRef(null), layerRef = useRef(null), userLayerRef = useRef(null);
  const [selectedId,setSelectedId] = useState(null), [search,setSearch] = useState(''), [category,setCategory] = useState('all'), [radius,setRadius] = useState(30), [amenity,setAmenity] = useState(''), [verifiedOnly,setVerifiedOnly] = useState(false), [favoritesOnly,setFavoritesOnly] = useState(false), [filtersOpen,setFiltersOpen] = useState(false), [resultsOpen,setResultsOpen] = useState(true), [remotePlaces,setRemotePlaces] = useState([]), [searching,setSearching] = useState(false), [error,setError] = useState(null), [retry,setRetry] = useState(0), [favorites,setFavorites] = useState(() => { try { return new Set(JSON.parse(localStorage.getItem('kleenest:map:favorites') || '[]').map(String)); } catch { return new Set(); } });

  const supplied = useMemo(() => (Array.isArray(places) ? places : []).filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))), [places]);
  const remote = useMemo(() => (Array.isArray(remotePlaces) ? remotePlaces : []).filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))), [remotePlaces]);
  const allPlaces = useMemo(() => { const m = new Map(); [...supplied, ...remote].forEach(p => m.set(placeKey(p), p)); return [...m.values()]; }, [supplied, remote]);

  useEffect(() => { try { localStorage.setItem('kleenest:map:favorites', JSON.stringify([...favorites])); } catch {} }, [favorites]);
  useEffect(() => { let active = true; (async()=>{ if(!supabase || !allPlaces.length) return; const { data:{ user } } = await supabase.auth.getUser(); if(!user || !active) return; const ids=[...new Set(allPlaces.map(p=>p.location_id).filter(Boolean))]; if(!ids.length)return; const {data}=await supabase.from('location_favorites').select('location_id').eq('user_id',user.id).in('location_id',ids); if(active&&data)setFavorites(new Set(data.map(r=>String(r.location_id)))); })().catch(()=>{}); return()=>{active=false}; }, [allPlaces]);

  useEffect(() => {
    let active=true;
    const timer=setTimeout(async()=>{
      if(!userLocation?.latitude || !userLocation?.longitude) return;
      setSearching(true); setError(null);
      try {
        const rows = search.trim() ? await searchMapLocations(search,{latitude:Number(userLocation.latitude),longitude:Number(userLocation.longitude),radiusKm:radius,limit:500}) : await listMapNetworkNearby({latitude:Number(userLocation.latitude),longitude:Number(userLocation.longitude),radiusKm:radius,limit:500,category:'all',amenities:amenity?{[amenity]:true}:{}});
        if(active)setRemotePlaces(rows);
      } catch(e) { if(active)setError(e?.message || 'Unable to refresh map discovery.'); }
      finally { if(active)setSearching(false); }
    }, search.trim()?300:100);
    return()=>{active=false;clearTimeout(timer)};
  }, [userLocation?.latitude,userLocation?.longitude,radius,search,amenity]);

  const filtered = useMemo(() => allPlaces.filter(place => {
    const cat=String(place.category||'service');
    if(category!=='all' && cat!==category) return false;
    const am=placeAmenities(place);
    if(amenity && !am.includes(amenity)) return false;
    const q=search.trim().toLowerCase();
    if(q) { const hay=[place.name,place.brand,place.operator_name,place.operator,place.address,place.city,place.state,place.postal_code,place.category,...am].filter(Boolean).join(' ').toLowerCase(); if(!hay.includes(q)) return false; }
    const d=Number(place.distance_meters ?? (Number(place.distance_km)*1000));
    if(Number.isFinite(d) && d>radius*1000) return false;
    if(verifiedOnly && !Boolean(place.is_verified || String(place.bathroom_verification_status||'').toLowerCase()==='verified' || Number(place.verification_confidence)>=.8)) return false;
    if(favoritesOnly && !favorites.has(placeKey(place))) return false;
    return true;
  }), [allPlaces,category,amenity,search,radius,verifiedOnly,favoritesOnly,favorites]);

  const activeFilterCount=Number(Boolean(amenity))+Number(verifiedOnly)+Number(favoritesOnly)+(radius!==30?1:0);
  const locate=()=>{ if(!navigator.geolocation){setError('Location is not supported by this browser.');return;} navigator.geolocation.getCurrentPosition(pos=>{const loc={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy||0};onLocation?.(loc,null);if(mapRef.current)mapRef.current.setView([loc.latitude,loc.longitude],15,{animate:true});},()=>setError('Location permission is unavailable. You can still browse the network.'),{enableHighAccuracy:true,maximumAge:30000,timeout:10000}); };
  const fit=()=>{if(mapRef.current&&filtered.length)mapRef.current.fitBounds(L.latLngBounds(filtered.map(p=>[Number(p.latitude),Number(p.longitude)])),{padding:[80,80],maxZoom:15});};
  const focus=place=>{setSelectedId(place.id);onSelect?.(place);mapRef.current?.setView([Number(place.latitude),Number(place.longitude)],Math.max(mapRef.current.getZoom()||14,15),{animate:true});setResultsOpen(false);};
  const toggleFavorite=async place=>{const key=placeKey(place),next=!favorites.has(key);setFavorites(prev=>{const n=new Set(prev);next?n.add(key):n.delete(key);return n});try{const {data:{user}}=await supabase?.auth.getUser()||{data:{user:null}};if(user&&place.location_id){if(next)await supabase.from('location_favorites').upsert({user_id:user.id,location_id:place.location_id},{onConflict:'user_id,location_id'});else await supabase.from('location_favorites').delete().eq('user_id',user.id).eq('location_id',place.location_id);} }catch(e){setFavorites(prev=>{const n=new Set(prev);next?n.delete(key):n.add(key);return n});}};

  useEffect(()=>{if(!nodeRef.current||mapRef.current)return;let map;try{map=L.map(nodeRef.current,{zoomControl:false,attributionControl:true}).setView(userLocation?[userLocation.latitude,userLocation.longitude]:DEFAULT_CENTER,userLocation?15:11);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);layerRef.current=L.layerGroup().addTo(map);userLayerRef.current=L.layerGroup().addTo(map);if(userLocation)L.marker([userLocation.latitude,userLocation.longitude],{icon:userIcon(),zIndexOffset:1000}).addTo(userLayerRef.current);const report=()=>{const b=map.getBounds();onBoundsChange?.({south:b.getSouth(),west:b.getWest(),north:b.getNorth(),east:b.getEast()});};map.on('moveend',report);report();mapRef.current=map;}catch(e){setError(e?.message||'The map could not initialize.');}return()=>{try{map?.off();map?.remove()}catch{}mapRef.current=null;layerRef.current=null;userLayerRef.current=null};},[retry]);
  useEffect(()=>{const map=mapRef.current,group=layerRef.current;if(!map||!group)return;group.clearLayers();filtered.forEach(place=>{const favorite=favorites.has(placeKey(place));const marker=L.marker([Number(place.latitude),Number(place.longitude)],{icon:markerIcon(place,String(place.id)===String(selectedId),favorite)}).addTo(group);const s=status(place),am=placeAmenities(place),detailsUrl=`${APP_BASE}place/${encodeURIComponent(place.id)}`;marker.bindPopup(`<div class="kleenest-popup"><span class="popup-kicker">${escapeHtml(MAP_CATEGORIES.find(c=>c.id===place.category)?.label||'Location')}</span><strong>${escapeHtml(place.name||place.brand||'Kleenest location')}</strong><span class="popup-status ${s.key}">${s.key==='verified'?'✓ ':''}${escapeHtml(s.label)}</span>${distanceLabel(place)?`<span class="popup-muted">${distanceLabel(place)} away</span>`:''}${place.address?`<span class="popup-muted">${escapeHtml(place.address)}</span>`:''}${place.rating?`<span class="popup-muted">★ ${Number(place.rating).toFixed(1)}${place.review_count?` · ${place.review_count} reviews`:''}</span>`:''}${place.cleanliness_pct!=null?`<span class="popup-muted">Cleanliness ${Math.round(Number(place.cleanliness_pct))}%</span>`:''}${am.length?`<div class="popup-tags">${am.slice(0,6).map(a=>`<span>${escapeHtml(AMENITY_LABELS[a]||a.replaceAll('_',' '))}</span>`).join('')}</div>`:''}<div class="popup-actions"><a href="${detailsUrl}">Details</a><button type="button" data-action="favorite">${favorite?'♥ Saved':'♡ Save'}</button><button type="button" data-action="route">Route</button><button type="button" data-action="arrival">Arrived</button></div></div>`);marker.on('click',()=>setSelectedId(place.id));marker.on('popupopen',event=>{const root=event.popup.getElement();root?.querySelector('[data-action="favorite"]')?.addEventListener('click',e=>{e.preventDefault();toggleFavorite(place)});root?.querySelector('[data-action="route"]')?.addEventListener('click',e=>{e.preventDefault();window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,'_blank','noopener,noreferrer')});root?.querySelector('[data-action="arrival"]')?.addEventListener('click',e=>{e.preventDefault();window.dispatchEvent(new CustomEvent('kleenest:map-arrival',{detail:{locationId:place.location_id||place.id,placeId:place.id}}));});});});if(filtered.length===1)map.setView([Number(filtered[0].latitude),Number(filtered[0].longitude)],15);},[filtered,selectedId,favorites]);

  return <div className="map-experience">
    <div className="map-topbar"><div className="map-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bathrooms, businesses, addresses, amenities…" aria-label="Search map"/>{searching&&<span className="map-search-loading">Searching…</span>}{search&&<button type="button" onClick={()=>setSearch('')} aria-label="Clear search"><X size={16}/></button>}</div><button type="button" className="map-locate" onClick={locate} aria-label="Use my location"><LocateFixed size={18}/></button><button type="button" className={`map-filter ${activeFilterCount?'has-filters':''}`} onClick={()=>setFiltersOpen(v=>!v)} aria-label="Map filters"><SlidersHorizontal size={18}/>{activeFilterCount>0&&<b>{activeFilterCount}</b>}</button></div>
    <div className="map-categories">{MAP_CATEGORIES.map(({id,label})=><button type="button" key={id} className={category===id?'active':''} onClick={()=>setCategory(id)}>{CATEGORY_GLYPHS[id]||'✦'}<span>{label}</span></button>)}</div>
    {filtersOpen&&<div className="map-filter-panel"><div className="filter-head"><strong>Explore filters</strong><button type="button" onClick={()=>setFiltersOpen(false)}><X size={16}/></button></div><label>Search radius<select value={radius} onChange={e=>setRadius(Number(e.target.value))}><option value={1}>1 km</option><option value={5}>5 km</option><option value={10}>10 km</option><option value={30}>30 km</option><option value={50}>50 km</option></select></label><label className="filter-toggle"><input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)}/> Verified locations</label><label className="filter-toggle"><input type="checkbox" checked={favoritesOnly} onChange={e=>setFavoritesOnly(e.target.checked)}/> Saved locations</label><div className="filter-section"><strong>Amenities</strong><div className="filter-chips">{AMENITIES.map(id=><button type="button" key={id} className={amenity===id?'active':''} onClick={()=>setAmenity(amenity===id?'':id)}>{AMENITY_LABELS[id]}</button>)}</div></div><button type="button" className="filter-clear" onClick={()=>{setAmenity('');setVerifiedOnly(false);setFavoritesOnly(false);setRadius(30)}}>Clear all filters</button></div>}
    <div className="map-stage"><div ref={nodeRef} className="leaflet-map" aria-label="Kleenest locations map"/><div className="map-map-controls"><button type="button" onClick={()=>mapRef.current?.zoomIn()} aria-label="Zoom in"><Plus size={17}/></button><button type="button" onClick={()=>mapRef.current?.zoomOut()} aria-label="Zoom out"><Minus size={17}/></button><button type="button" onClick={fit} aria-label="Fit all results"><Navigation size={16}/></button></div><div className="map-count"><strong>{filtered.length}</strong><span>{filtered.length===1?'location':'locations'}{search?` matching “${search}”`:''}</span></div>{error&&<button type="button" className="map-inline-error" onClick={()=>setRetry(v=>v+1)}>{error} · Retry</button>}</div>
    <div className={`map-results-drawer ${resultsOpen?'open':''}`}><div className="drawer-handle" onClick={()=>setResultsOpen(v=>!v)}></div><div className="drawer-head"><div><strong>{filtered.length.toLocaleString()} {filtered.length===1?'location':'locations'}</strong><span>{category==='all'?'Everything nearby':MAP_CATEGORIES.find(c=>c.id===category)?.label||'Locations'}{search?' · Search results':''}</span></div><button type="button" onClick={()=>setResultsOpen(v=>!v)}>{resultsOpen?'Hide':'Show'}</button></div>{resultsOpen&&<div className="drawer-list">{filtered.slice(0,100).map(place=>{const s=status(place),favorite=favorites.has(placeKey(place)),am=placeAmenities(place);return <button type="button" key={placeKey(place)} className={`map-result-card ${String(selectedId)===String(place.id)?'selected':''}`} onClick={()=>focus(place)}><span className={`result-icon ${s.key}`}>{CATEGORY_GLYPHS[String(place.category)]||'✦'}</span><span className="result-body"><strong>{place.name||place.brand||'Kleenest location'}</strong><small>{s.label}{distanceLabel(place)?` · ${distanceLabel(place)}`:''}{place.rating?` · ★ ${Number(place.rating).toFixed(1)}`:''}</small>{am.length>0&&<span className="result-tags">{am.slice(0,3).map(a=><em key={a}>{AMENITY_LABELS[a]||a.replaceAll('_',' ')}</em>)}</span>}</span><span className="result-favorite" onClick={e=>{e.stopPropagation();toggleFavorite(place)}}><Heart size={17} fill={favorite?'currentColor':'none'}/></span></button>})}</div>}</div>
  </div>;
}
