import {Route} from 'react-router-dom';
import RouteGuard from './RouteGuard';
import RewardsPage from '../pages/RewardsPage';
import ContestsPage from '../pages/ContestsPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import RoutePlannerPage from '../pages/RoutePlannerPage';
import BusinessDashboardPage from '../pages/BusinessDashboardPage';
import BusinessEntitlementsPage from '../pages/BusinessEntitlementsPage';
import BusinessPerformancePage from '../pages/BusinessPerformancePage';
import BusinessIntelligencePage from '../pages/BusinessIntelligencePage';
import BusinessManagePage from '../pages/BusinessManagePage';
import BusinessReviewsPage from '../pages/BusinessReviewsPage';
import FleetReviewPage from '../pages/FleetReviewPage';
import EnterpriseCommandCenterPage from '../pages/EnterpriseCommandCenterPage';
import AdminDataPage from './AdminDataPage';
import AdminCrudPage from './AdminCrudPage';

const businessRoles=['business','owner','admin'];
const adminRoles=['admin'];

export default function KleenestFeatureRoutes(){return <>
 <Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage/></RouteGuard>}/>
 <Route path="/contests" element={<RouteGuard requireAuth><ContestsPage/></RouteGuard>}/>
 <Route path="/leaderboard" element={<RouteGuard requireAuth><LeaderboardPage/></RouteGuard>}/>
 <Route path="/route" element={<RouteGuard requireAuth><RoutePlannerPage/></RouteGuard>}/>
 <Route path="/business/dashboard" element={<RouteGuard requireAuth roles={businessRoles}><BusinessDashboardPage/></RouteGuard>}/>
 <Route path="/business/intelligence" element={<RouteGuard requireAuth roles={businessRoles}><BusinessIntelligencePage/></RouteGuard>}/>
 <Route path="/business/manage" element={<RouteGuard requireAuth roles={businessRoles}><BusinessManagePage/></RouteGuard>}/>
 <Route path="/business/reviews" element={<RouteGuard requireAuth roles={businessRoles}><BusinessReviewsPage/></RouteGuard>}/>
 <Route path="/fleet" element={<RouteGuard requireAuth capabilities={['fleet']}><FleetReviewPage/></RouteGuard>}/>
 <Route path="/enterprise" element={<RouteGuard requireAuth capabilities={['enterprise']}><EnterpriseCommandCenterPage/></RouteGuard>}/>
 <Route path="/business/entitlements" element={<RouteGuard requireAuth roles={businessRoles}><BusinessEntitlementsPage/></RouteGuard>}/>
 <Route path="/business/performance" element={<RouteGuard requireAuth roles={businessRoles}><BusinessPerformancePage/></RouteGuard>}/>
 <Route path="/admin/data" element={<RouteGuard requireAuth roles={adminRoles}><AdminDataPage/></RouteGuard>}/>
 <Route path="/admin/crud" element={<RouteGuard requireAuth roles={adminRoles}><AdminCrudPage/></RouteGuard>/>
</>}
