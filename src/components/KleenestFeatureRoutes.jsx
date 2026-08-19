import {Route} from 'react-router-dom';
import RouteGuard from './RouteGuard';
import RewardsPage from '../pages/RewardsPage';
import ContestsPage from '../pages/ContestsPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import BusinessEntitlementsPage from '../pages/BusinessEntitlementsPage';
import BusinessPerformancePage from '../pages/BusinessPerformancePage';

export default function KleenestFeatureRoutes(){return <>
  <Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage/></RouteGuard>}/>
  <Route path="/contests" element={<RouteGuard requireAuth><ContestsPage/></RouteGuard>}/>
  <Route path="/leaderboard" element={<RouteGuard requireAuth><LeaderboardPage/></RouteGuard>}/>
  <Route path="/business/entitlements" element={<RouteGuard requireAuth roles={['business','owner','admin']}><BusinessEntitlementsPage/></RouteGuard>}/>
  <Route path="/business/performance" element={<RouteGuard requireAuth roles={['business','owner','admin']}><BusinessPerformancePage/></RouteGuard>}/>
</>}
