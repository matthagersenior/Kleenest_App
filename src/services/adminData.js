import { supabase } from '../lib/supabase';

function requireClient(){if(!supabase)throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.') ;return supabase}
async function invoke(name,body){const client=requireClient();const {data,error}=await client.functions.invoke(name,{body});if(error){const detail=error.context?.body||error.message;throw new Error(`${name}: ${detail||'Edge Function request failed.'}`)}if(data?.ok===false||data?.error)throw new Error(data.error||`${name} returned an error.`);return data}
export async function runDataIngest(action,payload={}){return invoke('public-data-ingest-v3',{action,...payload})}
export async function runAdminTool(action,payload={}){return invoke('admin-tools',{action,...payload})}
export async function checkBackendHealth(){return invoke('admin-tools',{action:'health'})}
export async function ingestRegion(region,{sources=['osm','data_gov']}={}){const city=String(region).toUpperCase();const results={};if(sources.includes('osm'))results.osm=await runDataIngest('ingest-osm-city',{city});if(sources.includes('data_gov')){results.data_gov=city==='CHI'?await runDataIngest('ingest-chicago'):await runDataIngest('ingest-data-gov-city',{city})}return results}
