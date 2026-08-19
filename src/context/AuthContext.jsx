import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../services/auth';
import { getProfile } from '../services/profile';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) { setLoading(false); return undefined; }
    let mounted = true;
    getCurrentUser().then(async currentUser => {
      if (!mounted) return;
      setUser(currentUser);
      if (currentUser) setProfile(await getProfile(currentUser.id));
    }).catch(() => {}).finally(() => mounted && setLoading(false));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
      else getProfile(session.user.id).then(setProfile).catch(() => {});
    });
    return () => { mounted = false; subscription.subscription.unsubscribe(); };
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading, authenticated: Boolean(user), setProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
