import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getWorkspaceModel, MEMBERSHIP_UI, resolveWorkspace, WORKSPACE_NAVIGATION } from '../domain/workspaces.js';

function firstEntitlement(entitlements = []) { return Array.isArray(entitlements) && entitlements.length > 0 ? entitlements[0] : null; }
function isActive(location, item) { return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`); }

export default function WorkspaceShell({ children, workspace: workspaceOverride = null }) {
  const location = useLocation();
  const { profile, entitlements, capabilities, authenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const model = useMemo(() => {
    const entitlement = firstEntitlement(entitlements);
    const membership = profile?.membership_tier || profile?.subscription_tier || entitlement?.service_tier || 'free';
    const workspace = workspaceOverride || resolveWorkspace(location.pathname, capabilities);
    return getWorkspaceModel({ membership, workspace, businessId: profile?.business_id || null, capabilities });
  }, [capabilities, entitlements, location.pathname, profile, workspaceOverride]);
  const navigation = WORKSPACE_NAVIGATION[model.workspace.id] || WORKSPACE_NAVIGATION.consumer;
  const membershipKnown = Object.prototype.hasOwnProperty.call(MEMBERSHIP_UI, model.membership);
  return (
    <div className={`app-shell workspace-shell workspace-${model.workspace.id}`} data-membership={membershipKnown ? model.membership : 'free'}>
      <header className="topbar workspace-topbar">
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)} aria-label="Kleenest home">Kleenest</Link>
        <nav className={`nav workspace-nav ${menuOpen ? 'open' : ''}`} aria-label={`${model.workspace.label} navigation`}>
          {navigation.map((item) => (
            <Link key={item.id} className={isActive(location, item) ? 'active' : ''} to={item.path} onClick={() => setMenuOpen(false)}>{item.label}</Link>
          ))}
        </nav>
        <div className="header-actions workspace-actions">
          {authenticated && <Link className="icon-button" to="/notifications" aria-label="Notifications" onClick={() => setMenuOpen(false)}><Bell size={18} /></Link>}
          <span className="membership-badge" title={`Membership: ${model.membershipLabel}`}>{model.membershipLabel}</span>
          <span className="workspace-badge">{model.workspace.label}</span>
          <button className="icon-button menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      {children}
      <footer className="workspace-footer"><span>Kleenest</span><span>{model.membershipLabel}</span></footer>
    </div>
  );
}
