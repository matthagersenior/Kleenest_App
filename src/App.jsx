import { useEffect,useMemo,useState } from 'react';
import { Link,Route,Routes,useLocation,useNavigate,useParams } from 'react-router-dom';
import { ArrowLeft,CheckCircle2,Map,Search,ShieldCheck,Star,Store,Trophy,UserRound,Menu,X,LocateFixed,SlidersHorizontal,Heart,Navigation,Bell } from 'lucide-react';
import { listCategories,listPlaces,getPlace } from './services/places';
import { listReviews,createReview,checkIn,favoritePlace,recordPlaceArrival,requestPlaceDirections } from './services/community';
import { getContributorReputation,refreshContributorReputation,reputationLabel } from './services/reputation';
import { signOut } from './services/auth';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AdminDataPage from './components/AdminDataPage';
import MapSurface from './components/MapSurface';
import RewardsPage from './pages/RewardsPage';
import NotificationsPage from './pages/NotificationsPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import BusinessReviewsPage from './pages/BusinessReviewsPage';
import RouteGuard from './components/RouteGuard';
import { redeemQr } from './services/qr';
import { cleanlinessLabel,verificationLabel,restroomSignal } from './domain/contracts';
// Existing application implementation continues below unchanged.
