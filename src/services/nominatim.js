const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';
const CACHE_PREFIX = 'kleenest:nominatim:';
const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;
let queue = Promise.resolve();

function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function key(lat,lon){return `${CACHE_PREFIX}${Number(lat).toFixed(6)}:${Number(lon).toFixed(6)}`}
async function rateLimitedFetch(url){queue=queue.then(async()=>{const wait=Math.max(0,MIN_INTERVAL_MS-(Date.now()-lastRequestAt));if(wait)await sleep(wait);lastRequestAt=Date.now();return fetch(url,{headers:{Accept:'application/json'}})});return queue}
export async function reverseGeocode(lat,lon,{language='en-US'}={}){if(lat==null||lon==null)return null;const cached=localStorage.getItem(key(lat,lon));if(cached){try{return JSON.parse(cached)}catch{localStorage.removeItem(key(lat,lon))}}const params=new URLSearchParams({format:'jsonv2',lat:String(lat),lon:String(lon),addressdetails:'1',zoom:'18','accept-language':language});const response=await rateLimitedFetch(`${NOMINATIM_BASE}?${params}`);if(!response.ok)throw new Error(`Reverse geocoding failed (${response.status})`);const result=await response.json();const value={displayAddress:result.display_name||'',address:result.address||{},lat:Number(result.lat),lon:Number(result.lon),source:'nominatim',fetchedAt:new Date().toISOString()};localStorage.setItem(key(lat,lon),JSON.stringify(value));return value}
export function formatAddress(result){if(!result)return'';const a=result.address||{};const line1=[a.house_number,a.road].filter(Boolean).join(' ');const line2=[a.city||a.town||a.village||a.hamlet,a.state,a.postcode].filter(Boolean).join(', ');return [line1,line2].filter(Boolean).join(', ')||result.displayAddress||''}
