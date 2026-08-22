import { Route } from 'react-router-dom';
import RouteGuard from './RouteGuard';
import WorkspaceShell from './WorkspaceShell';
import RewardsPage from '../pages/RewardsPage';
import GamificationActionsPage from '../pages/GamificationActionsPage';
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

const BUSINESS_ROLES = ['business', 'owner', 'admin'];
const ADMIN_ROLES = ['admin'];

export default function KleenestFeatureRoutes() {
  return (
    <>
      <Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage /></RouteGuard>} />
      <Route path="/progression" element={<RouteGuard requireAuth><GamificationActionsPage /></RouteGuard>} />
      <Route path="/contests" element={<RouteGuard requireAuth><ContestsPage /></RouteGuard>} />
      <Route path="/leaderboard" element={<RouteGuard requireAuth><LeaderboardPage /></RouteGuard>} />
      <Route path="/route" element={<RouteGuard requireAuth><WorkspaceShell><RoutePlannerPage /></WorkspaceShell></RouteGuard>} />

      <Route path="/business/dashboard" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessDashboardPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/business/intelligence" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessIntelligencePage /></WorkspaceShell></RouteGuard>} />
      <Route path="/business/manage" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessManagePage /></WorkspaceShell></RouteGuard>} />
      <Route path="/business/reviews" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessReviewsPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/business/entitlements" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessEntitlementsPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/business/performance" element={<RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell><BusinessPerformancePage /></WorkspaceShell></RouteGuard>} />

      <Route path="/fleet" element={<RouteGuard requireAuth capabilities={['fleet']}><WorkspaceShell><FleetReviewPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/enterprise" element={<RouteGuard requireAuth capabilities={['enterprise']}><WorkspaceShell><EnterpriseCommandCenterPage /></WorkspaceShell></RouteGuard>} />

      <Route path="/admin/data" element={<RouteGuard requireAuth roles={ADMIN_ROLES}><WorkspaceShell><AdminDataPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/admin/crud" element={<RouteGuard requireAuth roles={ADMIN_ROLES}><WorkspaceShell><AdminCrudPage /></WorkspaceShell></RouteGuard>} />
    </>
  );
}
