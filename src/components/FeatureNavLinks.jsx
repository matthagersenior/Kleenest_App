import {Link} from 'react-router-dom';
import {Bell,Gift,Medal,Route as RouteIcon,Sparkles,Trophy} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {hasCapability} from '../domain/capabilities';

export default function FeatureNavLinks({business=false}){
  const{authenticated,capabilities=[]}=useAuth();
  const canPremium=hasCapability(capabilities,'premium');
  const canBusiness=hasCapability(capabilities,'business');
  const canFleet=hasCapability(capabilities,'fleet');
  return <div className="hero-actions">
    {authenticated&&<Link className="secondary" to="/rewards"><Gift size={16}/>Rewards</Link>}
    {authenticated&&<Link className="secondary" to="/notifications"><Bell size={16}/>Notifications</Link>}
    {authenticated&&<Link className="secondary" to="/contests"><Trophy size={16}/>Contests</Link>}
    {authenticated&&<Link className="secondary" to="/leaderboard"><Medal size={16}/>Leaderboard</Link>}
    {business&&canBusiness&&<>
      <Link className="secondary" to="/business/intelligence"><Sparkles size={16}/>Intelligence</Link>
      <Link className="secondary" to="/business/performance"><Sparkles size={16}/>Performance</Link>
      <Link className="secondary" to="/business/entitlements"><Sparkles size={16}/>Plans</Link>
    </>}
    {canFleet&&<Link className="secondary" to="/fleet"><RouteIcon size={16}/>Fleet</Link>}
    {canPremium&&<Link className="secondary" to="/rewards"><Gift size={16}/>Premium rewards</Link>}
  </div>;
}
