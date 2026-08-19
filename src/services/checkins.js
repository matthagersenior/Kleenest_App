import { supabase } from '../lib/supabase';

export async function createCheckIn({ locationId, userId, qrCodeId = null, method = 'qr', latitude = null, longitude = null }) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: existing } = await supabase.from('check_ins').select('id').eq('location_id', locationId).eq('user_id', userId).gte('checked_in_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).limit(1);
  if (existing?.length) throw new Error('You already checked in here today.');
  const { data: qr } = qrCodeId ? await supabase.from('qr_codes').select('id,active').eq('id', qrCodeId).maybeSingle() : { data: null };
  if (qrCodeId && (!qr || !qr.active)) throw new Error('This QR code is not active.');
  const { data, error } = await supabase.from('check_ins').insert({ location_id: locationId, user_id: userId, qr_code_id: qrCodeId, checked_in_at: new Date().toISOString(), verification_method: method, latitude, longitude, points_awarded: 10, metadata: {} }).select().single();
  if (error) throw error;
  return data;
}

export async function listMyCheckIns(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('check_ins').select('id,location_id,checked_in_at,verification_method,points_awarded').eq('user_id', userId).order('checked_in_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMyPoints(userId) {
  if (!supabase || !userId) return 0;
  const { data, error } = await supabase.from('point_transactions').select('points').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.points || 0), 0);
}
