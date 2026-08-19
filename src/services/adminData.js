import { supabase } from '../lib/supabase';

export async function runDataIngest(action, payload = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('public-data-ingest-v3', {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.ok === false) throw new Error(data.error || 'Data ingestion failed.');
  return data;
}

export async function runAdminTool(action, payload = {}) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.functions.invoke('admin-tools', {
    body: { action, ...payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}
