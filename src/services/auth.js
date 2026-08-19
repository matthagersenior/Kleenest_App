import { supabase } from '../lib/supabase';

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

export async function signUp({ email, password, fullName = '' }) {
  const client = requireClient();
  return client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: window.location.origin,
    },
  });
}

export async function signIn({ email, password }) {
  const client = requireClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const client = requireClient();
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  const client = requireClient();
  return client.auth.signOut({ scope: 'local' });
}

export async function sendPasswordReset(email) {
  const client = requireClient();
  return client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/profile`,
  });
}

export async function updateUserMetadata(data) {
  const client = requireClient();
  return client.auth.updateUser({ data });
}

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  return supabase;
}
