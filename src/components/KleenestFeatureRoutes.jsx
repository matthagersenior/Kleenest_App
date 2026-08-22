import { Navigate, Route } from 'react-router-dom';
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
const FLEET_CAPABILITIES = ['fleet'];
const ENTERPRISE_CAPABILITIES = ['enterprise'];

const businessRoute = (element) => (
  <RouteGuard requireAuth roles={BUSINESS_ROLES}>
    <WorkspaceShell>{element}</WorkspaceShell>
  </RouteGuard>
);

export default function KleenestFeatureRoutes() {
  return (
    <>
      <Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage /></RouteGuard>} />
      <Route path="/progression" element={<RouteGuard requireAuth><GamificationActionsPage /></RouteGuard>} />
      <Route path="/contests" element={<RouteGuard requireAuth><ContestsPage /></RouteGuard>} />
      <Route path="/leaderboard" element={<RouteGuard requireAuth><LeaderboardPage /></RouteGuard>} />
      <Route path="/route" element={<RouteGuard requireAuth><WorkspaceShell><RoutePlannerPage /></WorkspaceShell></RouteGuard>} />

      <Route path="/business" element={businessRoute(<BusinessDashboardPage />)} />
      <Route path="/business/dashboard" element={<Navigate to="/business" replace />} />
      <Route path="/business/intelligence" element={businessRoute(<BusinessIntelligencePage />)} />
      <Route path="/business/manage" element={businessRoute(<BusinessManagePage />)} />
      <Route path="/business/reviews" element={businessRoute(<BusinessReviewsPage />)} />
      <Route path="/business/entitlements" element={businessRoute(<BusinessEntitlementsPage />)} />
      <Route path="/business/performance" element={businessRoute(<BusinessPerformancePage />)} />

      <Route path="/fleet" element={<RouteGuard requireAuth capabilities={FLEET_CAPABILITIES}><WorkspaceShell><FleetReviewPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/fleet-operations" element={<Navigate to="/fleet" replace />} />
      <Route path="/enterprise" element={<RouteGuard requireAuth capabilities={ENTERPRISE_CAPABILITIES}><WorkspaceShell><EnterpriseCommandCenterPage /></WorkspaceShell></RouteGuard>} />

      <Route path="/admin/data" element={<RouteGuard requireAuth roles={ADMIN_ROLES}><WorkspaceShell><AdminDataPage /></WorkspaceShell></RouteGuard>} />
      <Route path="/admin/crud" element={<RouteGuard requireAuth roles={ADMIN_ROLES}><WorkspaceShell><AdminCrudPage /></WorkspaceShell></RouteGuard>} />
    </>
  );
}
