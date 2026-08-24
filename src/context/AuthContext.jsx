import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../services/auth';
import { getProfile } from '../services/profile';
import { normalizeCapabilities } from '../domain/capabilities';
import { resolveWorkspaceContext } from '../services/workspaceContext';

const AuthContext = createContext(null);
async function loadEntitlements() {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('get_current_user_product_entitlements');
  return error ? [] : (data || []);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [workspaceContext, setWorkspaceContext] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let mounted = true;
    const hydrate = async currentUser => {
      if (!currentUser) {
        setProfile(null); setEntitlements([]); setWorkspaceContext(null); return;
      }
      const [nextProfile, nextEntitlements] = await Promise.all([
        getProfile(currentUser.id), loadEntitlements()
      ]);
      if (!mounted) return;
      setProfile(nextProfile);
      setEntitlements(nextEntitlements);
      const nextWorkspace = await resolveWorkspaceContext({
        user: currentUser,
        profile: nextProfile,
        entitlements: nextEntitlements,
        businessId: nextProfile?.business_id || null
      }).catch(() => null);
      if (mounted) setWorkspaceContext(nextWorkspace);
    };
    getCurrentUser().then(async currentUser => {
      if (!mounted) return;
      setUser(currentUser);
      await hydrate(currentUser);
    }).catch(() => {}).finally(() => mounted && setLoading(false));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      hydrate(nextUser).catch(() => {});
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, []);

  const capabilities = useMemo(() => normalizeCapabilities(profile, entitlements), [profile, entitlements]);
  const value = useMemo(() => ({
    user, profile, entitlements, capabilities, workspaceContext, loading,
    authenticated: Boolean(user), setProfile, setEntitlements, setWorkspaceContext
  }), [user, profile, entitlements, capabilities, workspaceContext, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
