import { useEffect,useMemo,useState } from 'react';
import { Link,Route,Routes,useLocation,useNavigate,useParams } from 'react-router-dom';
import { ArrowLeft,CheckCircle2,Map,Search,ShieldCheck,Star,Store,Trophy,UserRound,Menu,X,LocateFixed,SlidersHorizontal } from 'lucide-react';
import { listCategories,listPlaces,getPlace } from './services/places';
import { listReviews,createReview,checkIn } from './services/community';
import { getContributorReputation,refreshContributorReputation,reputationLabel } from './services/reputation';
import { signOut } from './services/auth';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AdminDataPage from './components/AdminDataPage';
import MapSurface from './components/MapSurface';
import RewardsPage from './pages/RewardsPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import BusinessReviewsPage from './pages/BusinessReviewsPage';
import RouteGuard from './components/RouteGuard';
import { redeemQr } from './services/qr';
import { cleanlinessLabel,verificationLabel,restroomSignal } from './domain/contracts';
function Shell(){const[open,setOpen]=useState(false),[authOpen,setAuthOpen]=useState(false),location=useLocation(),{authenticated,profile}=useAuth(),nav=[['/','Home'],['/map','Map'],['/discover','Discover'],['/profile','Profile']];const admin=profile?.is_admin||['admin','owner','platform_admin','super_admin'].includes(String(profile?.role||'').toLowerCase());return <div className="app-shell"><header className="topbar"><Link className="brand" to="/">Kleenest</Link><nav className={`nav ${open?'open':''}`}>{nav.map(([to,label])=><Link key={to} className={location.pathname===to?'active':''} to={to}>{label}</Link>)}{authenticated&&<Link to="/rewards">Rewards</Link>}{authenticated&&<Link to="/business/dashboard">Business</Link>}{admin&&<Link to="/admin/data">Admin</Link>}<Link to="/business" className="business-link">For Businesses</Link></nav><div className="header-actions">{authenticated?<button className="secondary compact" onClick={()=>signOut()}>Sign out</button>:<button className="primary compact" onClick={()=>setAuthOpen(true)}>Sign in</button>}<button className="icon-button menu-button" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button></div></header><main><Routes><Route path="/" element={<Home/>}/><Route path="/map" element={<MapPage/>}/><Route path="/place/:id" element={<PlaceDetails onSignIn={()=>setAuthOpen(true)}/>}/><Route path="/discover" element={<Discover/>}/><Route path="/profile" element={<Profile onSignIn={()=>setAuthOpen(true)}/>}/><Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage/></RouteGuard>}/><Route path="/check-in" element={<RouteGuard requireAuth><QrCheckIn onSignIn={()=>setAuthOpen(true)}/></RouteGuard>}/><Route path="/business" element={<Business/>}/><Route path="/business/dashboard" element={<RouteGuard requireAuth roles={['business','owner','admin']}><BusinessDashboardPage/></RouteGuard>}/><Route path="/business/dashboard/reviews" element={<RouteGuard requireAuth roles={['business','owner','admin']}><BusinessReviewsPage/></RouteGuard>}/><Route path="/admin/data" element={<RouteGuard requireAuth roles={['admin']}><AdminDataPage/></RouteGuard>}/></Routes></main><footer><span>© {new Date().getFullYear()} Kleenest</span><span>Find it. Check it. Know it.</span></footer>{authOpen&&<AuthModal onClose={()=>setAuthOpen(false)}/>}</div>}
// Existing consumer pages/components continue below unchanged.
