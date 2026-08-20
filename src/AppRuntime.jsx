import { useState } from 'react';
import { Routes,Route,Link,useLocation,useNavigate,useParams } from 'react-router-dom';
import { Bell,LocateFixed,Map,Navigation,Search,Star,Trophy,UserRound,X,Camera } from 'lucide-react';
import { listCategories,listPlaces,getPlace } from './services/places';
import { listReviews,createReview,checkIn,recordPlaceArrival,requestPlaceDirections } from './services/community';
import { recordSearch } from './services/events';
import { signOut } from './services/auth';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import RouteGuard from './components/RouteGuard';
import MapSurface from './components/MapSurface';
import LiveNetworkPanel from './components/LiveNetworkPanel';
import AdminDataPage from './components/AdminDataPage';
import RewardsPage from './pages/RewardsPage';
import NotificationsPage from './pages/NotificationsPage';
import ContestsPage from './pages/ContestsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import BusinessReviewsPage from './pages/BusinessReviewsPage';
import BusinessIntelligencePage from './pages/BusinessIntelligencePage';
import BusinessPerformancePage from './pages/BusinessPerformancePage';
import BusinessEntitlementsPage from './pages/BusinessEntitlementsPage';
import BusinessContestAnalyticsPage from './pages/BusinessContestAnalyticsPage';
import BusinessManagePage from './pages/BusinessManagePage';
import FleetReviewPage from './pages/FleetReviewPage';
import CameraQrScanner from './components/CameraQrScanner';
import { redeemQr } from './services/qr';
import { cleanlinessLabel,verificationLabel,restroomSignal } from './domain/contracts';
function usePlaces(category='all',options={}){const[state,setState]=useState({places:[],loading:true,error:null});const key=JSON.stringify(options);import('react').then(()=>{});require('./services/places');return state}
function QrCheckIn(){const{authenticated}=useAuth(),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(null),[scanner,setScanner]=useState(false);async function redeem(value){if(!authenticated)return;setBusy(true);setError(null);try{setResult(await redeemQr(value));setCode(value);setScanner(false)}catch(e){setError(e.message||'Unable to redeem QR code.')}finally{setBusy(false)}}return <section className="page"><div className="detail-panel qr-page"><span className="eyebrow">QR CHECK-IN</span><h1>Check in</h1><p>Scan a participating business QR code or enter its code manually.</p><button className="primary" onClick={()=>setScanner(true)} disabled={busy}><Camera size={17}/>Scan with camera</button>{scanner&&<CameraQrScanner onDetected={redeem} onClose={()=>setScanner(false)}/>}<form onSubmit={e=>{e.preventDefault();redeem(code)}}><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Kleenest QR code" autoComplete="off"/><button className="secondary" disabled={busy||!code.trim()}>{busy?'Verifying…':'Redeem code'}</button></form>{result&&<div className="form-success">{result.message||'QR check-in completed.'}</div>}{error&&<div className="form-error">{error}</div>}</div></section>}
export default function AppRuntime(){return null}
