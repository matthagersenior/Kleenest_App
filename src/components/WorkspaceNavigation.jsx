import { NavLink } from 'react-router-dom';
import { Bell, ChevronDown, Shield, Sparkles, Users, Truck, Building2 } from 'lucide-react';
import { getWorkspace } from '../domain/workspaces';

const icons = { consumer: Sparkles, business: Building2, fleet: Truck, enterprise: Users, admin: Shield };

export default function WorkspaceNavigation({ context, onWorkspaceChange }) {
  const workspace = getWorkspace(context?.workspace?.id || 'consumer');
  const Icon = icons[workspace.id] || Sparkles;
  const available = context?.availableWorkspaces || ['consumer'];
  return (
    <header className="workspace-shell" data-workspace={workspace.id} data-membership={context?.membership || 'free'}>
      <div className="workspace-brand">
        <NavLink to="/" className="brand-mark" aria-label="Kleenest home">K</NavLink>
        <div className="workspace-identity">
          <span className="brand-name">Kleenest</span>
          <span className="membership-badge"><Icon size={13} />{context?.membershipLabel || 'Free'}</span>
        </div>
      </div>
      <nav className="workspace-nav" aria-label={`${workspace.label} navigation`}>
        {workspace.navigation.filter(item => item.path).map(item => (
          <NavLink key={item.id} to={item.path} className={({ isActive }) => isActive ? 'workspace-nav-link active' : 'workspace-nav-link'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="workspace-actions">
        {available.length > 1 && (
          <label className="workspace-switcher">
            <span className="sr-only">Switch workspace</span>
            <select value={workspace.id} onChange={event => onWorkspaceChange?.(event.target.value)}>
              {available.map(id => <option key={id} value={id}>{getWorkspace(id).label}</option>)}
            </select>
            <ChevronDown size={15} aria-hidden="true" />
          </label>
        )}
        <NavLink to="/notifications" className="workspace-icon-action" aria-label="Notifications"><Bell size={18} /></NavLink>
      </div>
    </header>
  );
}
