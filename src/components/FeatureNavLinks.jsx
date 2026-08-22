import {Link} from 'react-router-dom';
import {Bell,Gift,Map,Medal,Route as RouteIcon,Sparkles,Trophy,Users,Compass,UserRound,Star,Gamepad2,Building2,ShieldCheck} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {hasCapability} from '../domain/capabilities';
import './FeatureNavLinks.css';

export default function FeatureNavLinks({business=false}){
  const{authenticated,capabilities=[]}=useAuth();
  const canPremium=hasCapability(capabilities,'premium');
  const canBusiness=hasCapability(capabilities,'business');
  const canFleet=hasCapability(capabilities,'fleet');
  const canEnterprise=hasCapability(capabilities,'enterprise');
  const canAdmin=hasCapability(capabilities,'admin');
  return <div className="feature-nav" aria-label={business?'Business tools':'Kleenest features'}>
    <Link className="feature-link feature-link-primary" to="/map"><Map size={16}/>Map</Link>
    <Link className="feature-link" to="/discover"><Compass size={16}/>Discover</Link>
    {authenticated&&<Link className="feature-link" to="/route"><RouteIcon size={16}/>Route</Link>}
    {authenticated&&<Link className="feature-link" to="/rewards"><Gift size={16}/>Rewards</Link>}
    {authenticated&&<Link className="feature-link" to="/games"><Gamepad2 size={16}/>Play</Link>}
    {authenticated&&<Link className="feature-link" to="/social"><Users size={16}/>Community</Link>}
    {authenticated&&<Link className="feature-link" to="/notifications"><Bell size={16}/>Notifications</Link>}
    {authenticated&&<Link className="feature-link" to="/contests"><Trophy size={16}/>Contests</Link>}
    {authenticated&&<Link className="feature-link" to="/leaderboard"><Medal size={16}/>Leaderboards</Link>}
    {authenticated&&<Link className="feature-link" to="/profile"><UserRound size={16}/>Profile</Link>}
    {canBusiness&&<>
      <Link className="feature-link" to="/business/dashboard"><Building2 size={16}/>Business</Link>
      {business&&<>
        <Link className="feature-link" to="/business/reviews"><Star size={16}/>Reviews</Link>
        <Link className="feature-link" to="/business/intelligence"><Sparkles size={16}/>Intelligence</Link>
        <Link className="feature-link" to="/business/performance"><Sparkles size={16}/>Performance</Link>
        <Link className="feature-link" to="/business/entitlements"><ShieldCheck size={16}/>Plan & features</Link>
      </>}
    </>}
    {canFleet&&<Link className="feature-link" to="/fleet"><RouteIcon size={16}/>Fleet</Link>}
    {canEnterprise&&<Link className="feature-link" to="/enterprise"><Building2 size={16}/>Enterprise</Link>}
    {canPremium&&<Link className="feature-link" to="/rewards"><Gift size={16}/>Premium rewards</Link>}
    {canAdmin&&<Link className="feature-link" to="/admin/crud"><ShieldCheck size={16}/>Admin / preview</Link>}
  </div>;
}
