import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyCapability } from '../domain/capabilities';

export default function RouteGuard({ children, requireAuth = false, roles = [], capabilities = [] }) {
  const { authenticated, loading, capabilities: userCapabilities } = useAuth();
  const location = useLocation();
  if (loading) return <section className="page"><div className="empty-state"><p>Checking access…</p></div></section>;
  if (requireAuth && !authenticated) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  if (roles.length && !hasAnyCapability(userCapabilities, roles.map(role => String(role).toLowerCase()))) return <Navigate to="/" replace />;
  if (capabilities.length && !hasAnyCapability(userCapabilities, capabilities)) return <Navigate to="/" replace />;
  return children;
}
