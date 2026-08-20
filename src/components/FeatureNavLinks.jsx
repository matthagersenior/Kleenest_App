import {Link} from 'react-router-dom';
import {Bell,Gift,Map,Medal,Route as RouteIcon,Sparkles,Trophy,Users,Compass,UserRound,Star} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {hasCapability} from '../domain/capabilities';
import './FeatureNavLinks.css';

export default function FeatureNavLinks({business=false}){
  const{authenticated,capabilities=[]}=useAuth();
  const canPremium=hasCapability(capabilities,'premium');
  const canBusiness=hasCapability(capabilities,'business');
  const canFleet=hasCapability(capabilities,'fleet');
  return <div className="feature-nav" aria-label={business?'Business tools':'Kleenest features'}>
    <Link className="feature-link feature-link-primary" to="/map"><Map size={16}/>Map</Link>
    <Link className="feature-link" to="/discover"><Compass size={16}/>Discover</Link>
    {authenticated&&<Link className="feature-link" to="/rewards"><Gift size={16}/>Rewards</Link>}
    {authenticated&&<Link className="feature-link" to="/rewards#social"><Users size={16}/>Community</Link>}
    {authenticated&&<Link className="feature-link" to="/notifications"><Bell size={16}/>Notifications</Link>}
    {authenticated&&<Link className="feature-link" to="/contests"><Trophy size={16}/>Contests</Link>}
    {authenticated&&<Link className="feature-link" to="/leaderboard"><Medal size={16}/>Leaderboard</Link>}
    {authenticated&&<Link className="feature-link" to="/profile"><UserRound size={16}/>Profile</Link>}
    {business&&canBusiness&&<>
      <Link className="feature-link" to="/business/dashboard"><BuildingIcon/>Overview</Link>
      <Link className="feature-link" to="/business/dashboard/reviews"><Star size={16}/>Reviews</Link>
      <Link className="feature-link" to="/business/intelligence"><Sparkles size={16}/>Intelligence</Link>
      <Link className="feature-link" to="/business/performance"><Sparkles size={16}/>Performance</Link>
      <Link className="feature-link" to="/business/entitlements"><Sparkles size={16}/>Plans</Link>
    </>}
    {canFleet&&<Link className="feature-link" to="/fleet"><RouteIcon size={16}/>Fleet</Link>}
    {canPremium&&<Link className="feature-link" to="/rewards"><Gift size={16}/>Premium rewards</Link>}
  </div>;
}
function BuildingIcon(){return <span aria-hidden="true" style={{fontSize:16,lineHeight:1}}>▦</span>}
