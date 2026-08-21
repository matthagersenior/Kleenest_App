import { supabase } from '../lib/supabase';

function requireClient(){
  if(!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}

async function invoke(name,body){
  const client=requireClient();
  const {data,error}=await client.functions.invoke(name,{body});
  if(error){
    let detail=error.context?.body||error.message;
    if(typeof detail!=='string') detail=JSON.stringify(detail);
    throw new Error(`${name}: ${detail}`);
  }
  if(data?.ok===false||data?.error) throw new Error(data.error||`${name} returned an error.`);
  return data;
}

export async function runDataIngest(action,payload={}){
  return invoke('public-data-ingest-v4',{action,...payload});
}

const NETWORK_INGEST_FUNCTION='market-bathroom-ingest-v5';

export async function runNetworkIngest(payload={}){
  const source=String(payload.source||'osm').toLowerCase();
  const markets=Array.isArray(payload.markets)?payload.markets.map(x=>String(x).toUpperCase()):[];
  if(markets.length===1&&markets[0]==='STL'&&source==='all') return invoke(NETWORK_INGEST_FUNCTION,{action:'stl'});
  if(markets.length===1){
    const city=markets[0];
    return invoke(NETWORK_INGEST_FUNCTION,{action:'osm-city',city});
  }
  return invoke(NETWORK_INGEST_FUNCTION,{action:'osm-city',city:markets[0]||'STL'});
}

export async function runAdminTool(action,payload={}){return invoke('admin-tools',{action,...payload});}
export async function backfillLocationAddresses(limit=25){return invoke('backfill-location-addresses',{limit});}
export async function checkBackendHealth(){return invoke('admin-tools',{action:'health'});}

export async function ingestRegion(region,{sources=['osm','data_gov']}={}){
  const city=String(region).toUpperCase();
  const results={};
  if(sources.includes('osm')) results.osm=await runNetworkIngest({source:'osm',markets:[city]});
  if(sources.includes('data_gov')) results.data_gov=await runNetworkIngest({source:'datagov',markets:[city]});
  return results;
}
