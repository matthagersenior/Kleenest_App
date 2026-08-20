import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAnyCapability } from '../domain/capabilities';

const ROLE_TO_CAPABILITY={consumer:'consumer',user:'consumer',premium:'premium',business:'business',owner:'business',fleet:'fleet',admin:'admin',platform_admin:'admin',super_admin:'admin'};
export default function RouteGuard({children,requireAuth=false,roles=[],capabilities=[]}){const{authenticated,loading,capabilities:userCapabilities=[]}=useAuth();const location=useLocation();if(loading)return <section className="page"><div className="empty-state"><p>Checking access…</p></div></section>;if(requireAuth&&!authenticated)return <Navigate to="/" replace state={{from:location.pathname}}/>;const requiredRoles=roles.map(role=>ROLE_TO_CAPABILITY[String(role).toLowerCase()]||String(role).toLowerCase());if(requiredRoles.length&&!hasAnyCapability(userCapabilities,requiredRoles))return <Navigate to="/" replace/>;if(capabilities.length&&!hasAnyCapability(userCapabilities,capabilities))return <Navigate to="/" replace/>;return children}
