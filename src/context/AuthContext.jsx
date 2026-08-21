import { createContext,useContext,useEffect,useMemo,useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../services/auth';
import { getProfile } from '../services/profile';
import { normalizeCapabilities } from '../domain/capabilities';

const AuthContext=createContext(null);
async function loadEntitlements(){if(!supabase)return[];const {data,error}=await supabase.rpc('get_current_user_product_entitlements');return error?[]:(data||[]);}
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[profile,setProfile]=useState(null),[entitlements,setEntitlements]=useState([]),[loading,setLoading]=useState(Boolean(supabase));
 useEffect(()=>{if(!supabase){setLoading(false);return undefined;}let mounted=true;
  const hydrate=async currentUser=>{if(!currentUser){setProfile(null);setEntitlements([]);return;}const [nextProfile,nextEntitlements]=await Promise.all([getProfile(currentUser.id),loadEntitlements()]);if(!mounted)return;setProfile(nextProfile);setEntitlements(nextEntitlements);};
  getCurrentUser().then(async currentUser=>{if(!mounted)return;setUser(currentUser);await hydrate(currentUser);}).catch(()=>{}).finally(()=>mounted&&setLoading(false));
  const {data:subscription}=supabase.auth.onAuthStateChange((_event,session)=>{const nextUser=session?.user??null;setUser(nextUser);hydrate(nextUser).catch(()=>{});});
  return()=>{mounted=false;subscription.subscription.unsubscribe();};
 },[]);
 const capabilities=useMemo(()=>normalizeCapabilities(profile,entitlements),[profile,entitlements]);
 const value=useMemo(()=>({user,profile,entitlements,capabilities,loading,authenticated:Boolean(user),setProfile,setEntitlements}),[user,profile,entitlements,capabilities,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
