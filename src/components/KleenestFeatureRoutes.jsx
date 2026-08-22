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
const consumerRoute = (element) => <RouteGuard requireAuth><WorkspaceShell workspace="consumer">{element}</WorkspaceShell></RouteGuard>;
const businessRoute = (element) => <RouteGuard requireAuth roles={BUSINESS_ROLES}><WorkspaceShell workspace="business">{element}</WorkspaceShell></RouteGuard>;
const fleetRoute = (element) => <RouteGuard requireAuth capabilities={FLEET_CAPABILITIES}><WorkspaceShell workspace="fleet">{element}</WorkspaceShell></RouteGuard>;
const enterpriseRoute = (element) => <RouteGuard requireAuth capabilities={ENTERPRISE_CAPABILITIES}><WorkspaceShell workspace="enterprise">{element}</WorkspaceShell></RouteGuard>;
const adminRoute = (element) => <RouteGuard requireAuth roles={ADMIN_ROLES}><WorkspaceShell workspace="admin">{element}</WorkspaceShell></RouteGuard>;

export default function KleenestFeatureRoutes() {
  return (
    <>
      <Route path="/rewards" element={consumerRoute(<RewardsPage />)} />
      <Route path="/progression" element={consumerRoute(<GamificationActionsPage />)} />
      <Route path="/contests" element={consumerRoute(<ContestsPage />)} />
      <Route path="/leaderboard" element={consumerRoute(<LeaderboardPage />)} />
      <Route path="/route" element={consumerRoute(<RoutePlannerPage />)} />
      <Route path="/business" element={businessRoute(<BusinessDashboardPage />)} />
      <Route path="/business/dashboard" element={<Navigate to="/business" replace />} />
      <Route path="/business/intelligence" element={businessRoute(<BusinessIntelligencePage />)} />
      <Route path="/business/manage" element={businessRoute(<BusinessManagePage />)} />
      <Route path="/business/reviews" element={businessRoute(<BusinessReviewsPage />)} />
      <Route path="/business/entitlements" element={businessRoute(<BusinessEntitlementsPage />)} />
      <Route path="/business/performance" element={businessRoute(<BusinessPerformancePage />)} />
      <Route path="/fleet" element={fleetRoute(<FleetReviewPage />)} />
      <Route path="/fleet-operations" element={<Navigate to="/fleet" replace />} />
      <Route path="/fleet/routes" element={fleetRoute(<RoutePlannerPage />)} />
      <Route path="/fleet/performance" element={fleetRoute(<FleetReviewPage />)} />
      <Route path="/fleet/opportunities" element={fleetRoute(<FleetReviewPage />)} />
      <Route path="/fleet/goals" element={fleetRoute(<FleetReviewPage />)} />
      <Route path="/enterprise" element={enterpriseRoute(<EnterpriseCommandCenterPage />)} />
      <Route path="/admin/data" element={adminRoute(<AdminDataPage />)} />
      <Route path="/admin/crud" element={adminRoute(<AdminCrudPage />)} />
    </>
  );
}
