import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Gamepad2, Gift, LockKeyhole, LogOut, Medal, Save, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { upsertProfile } from '../services/profile';
import { signOut } from '../services/auth';
import { supabase } from '../lib/supabase';
import '../styles/profile.css';

function labelForMembership(workspaceContext, profile) {
  return workspaceContext?.membershipLabel || profile?.subscription_tier || 'Free';
}

export default function ProfilePage({ onSignIn }) {
  const { authenticated, user, profile, workspaceContext, setProfile } = useAuth();
  const [form, setForm] = useState({ display_name: profile?.display_name || '', username: profile?.username || '', bio: profile?.bio || '', avatar_url: profile?.avatar_url || '' });
  const [status, setStatus] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const membership = useMemo(() => labelForMembership(workspaceContext, profile), [workspaceContext, profile]);
  const adsEnabled = workspaceContext?.adsEnabled ?? String(profile?.subscription_tier || 'free').toLowerCase() === 'free';

  if (!authenticated) return <section className="profile-page page"><div className="profile-empty"><ShieldCheck size={42}/><span className="eyebrow">PROFILE</span><h1>Your Kleenest profile</h1><p>Sign in to manage identity, membership, privacy, progression, community settings and support.</p><button className="primary" type="button" onClick={onSignIn}>Sign in</button></div></section>;

  const update = (name, value) => setForm(current => ({ ...current, [name]: value }));
  async function saveProfile(event) {
    event.preventDefault(); setSaving(true); setStatus('Saving…');
    try { const next = await upsertProfile(user.id, { display_name: form.display_name.trim() || null, username: form.username.trim() || null, bio: form.bio.trim() || null, avatar_url: form.avatar_url.trim() || null }); setProfile(next); setStatus('Profile saved.'); }
    catch (error) { setStatus(error?.message || 'Unable to save profile.'); }
    finally { setSaving(false); }
  }
  async function updatePassword(event) {
    event.preventDefault();
    if (!password || password.length < 8) { setPasswordStatus('Use at least 8 characters.'); return; }
    setPasswordStatus('Updating…');
    try { const { error } = await supabase.auth.updateUser({ password }); if (error) throw error; setPassword(''); setPasswordStatus('Password updated.'); }
    catch (error) { setPasswordStatus(error?.message || 'Unable to update password.'); }
  }

  return <section className="profile-page page">
    <div className="profile-heading"><div><span className="eyebrow">PROFILE</span><h1>{profile?.display_name || user?.email || 'Kleenest member'}</h1><p>Manage identity, membership, privacy, progression, community settings and your Kleenest experience.</p></div><div className="profile-avatar" aria-hidden="true">{(profile?.display_name || user?.email || 'K').slice(0,1).toUpperCase()}</div></div>
    <div className="membership-card"><div><strong>Membership: {membership.toLowerCase()}</strong><p>Membership: {membership.toLowerCase()}. {adsEnabled ? 'Freemium ads are enabled.' : 'Ads are disabled for your membership.'}</p><small>Account: {user?.email}</small></div><Link className="secondary" to="/rewards"><Gift size={16}/> View rewards</Link></div>
    <div className="profile-grid">
      <article className="profile-card profile-card-wide"><div className="card-heading"><div><span className="eyebrow">IDENTITY</span><h2>Profile details</h2></div><ShieldCheck size={20}/></div><form onSubmit={saveProfile} className="profile-form"><label>Display name<input value={form.display_name} onChange={e => update('display_name', e.target.value)} autoComplete="name"/></label><label>Username<input value={form.username} onChange={e => update('username', e.target.value.replace(/\s/g,'').toLowerCase())} autoComplete="username"/></label><label>Bio<textarea value={form.bio} onChange={e => update('bio', e.target.value)} rows={5} maxLength={500}/></label><label>Avatar URL<input value={form.avatar_url} onChange={e => update('avatar_url', e.target.value)} inputMode="url"/></label><div className="form-actions"><button className="primary" disabled={saving}><Save size={16}/>{saving ? 'Saving…' : 'Save profile'}</button>{status && <span className="form-status">{status}</span>}</div></form></article>
      <article className="profile-card"><div className="card-heading"><div><span className="eyebrow">SECURITY</span><h2>Password</h2></div><LockKeyhole size={20}/></div><form onSubmit={updatePassword} className="profile-form"><label>New password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} autoComplete="new-password"/></label><button className="secondary" disabled={!password}><LockKeyhole size={16}/> Update password</button>{passwordStatus && <span className="form-status">{passwordStatus}</span>}</form></article>
      <article className="profile-card"><div className="card-heading"><div><span className="eyebrow">PRIVACY</span><h2>Account controls</h2></div><ShieldCheck size={20}/></div><p className="muted">Your profile data is stored in your Kleenest account and governed by the account security and privacy controls.</p><button className="secondary" type="button" onClick={() => signOut()}><LogOut size={16}/> Sign out</button></article>
    </div>
    <section className="profile-section"><div className="section-heading"><div><span className="eyebrow">YOUR EXPERIENCE</span><h2>Account activity</h2></div></div><div className="profile-links"><Link to="/rewards"><Gift size={18}/><span><strong>Rewards</strong><small>{profile?.points || 0} points · level {profile?.level || 1}</small></span></Link><Link to="/games"><Gamepad2 size={18}/><span><strong>Play</strong><small>Games, challenges and progression</small></span></Link><Link to="/social"><Users size={18}/><span><strong>Community</strong><small>Connections and contributions</small></span></Link><Link to="/notifications"><Bell size={18}/><span><strong>Notifications</strong><small>Activity and account updates</small></span></Link><Link to="/leaderboard"><Medal size={18}/><span><strong>Leaderboard</strong><small>See your community standing</small></span></Link></div></section>
  </section>;
}
