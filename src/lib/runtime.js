const required=['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY'];
export const runtimeConfig={isProduction:import.meta.env.PROD,supabaseConfigured:required.every(key=>Boolean(import.meta.env[key])),missing:required.filter(key=>!import.meta.env[key])};
export function assertRuntimeConfig(){if(runtimeConfig.isProduction&&!runtimeConfig.supabaseConfigured)throw new Error(`Kleenest is not configured for production. Missing: ${runtimeConfig.missing.join(', ')}`);return runtimeConfig}
export function safeError(error,fallback='Something went wrong. Please try again.'){if(import.meta.env.DEV)return error?.message||fallback;return fallback}
export function isEntitlementError(error){return error?.code==='FEATURE_NOT_ENTITLED'}
