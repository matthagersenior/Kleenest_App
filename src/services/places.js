import { normalizePlace } from '../domain/contracts';
import { supabase } from '../lib/supabase';

const demoPlaces = [
  { id: 'demo-1', name: 'Kleenest Coffee House', category: 'cafe', rating: 4.8, distance: '0.4 mi' },
  { id: 'demo-2', name: 'Main Street Market', category: 'restaurant', rating: 4.6, distance: '0.7 mi' },
  { id: 'demo-3', name: 'River Road Fuel', category: 'gas_station', rating: 4.4, distance: '1.1 mi' },
];

export async function listPlaces({ category = 'all', limit = 50 } = {}) {
  if (!supabase) return demoPlaces.filter(matchesCategory(category)).slice(0, limit).map(normalizePlace);

  let query = supabase.from('places').select('*').limit(limit);
  if (category !== 'all') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizePlace);
}

function matchesCategory(category) {
  return (place) => category === 'all' || place.category === category;
}
