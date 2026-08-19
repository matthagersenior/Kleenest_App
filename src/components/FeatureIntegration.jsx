import {Routes,Route} from 'react-router-dom';
import RouteGuard from './RouteGuard';
import RewardNotificationBridge from './RewardNotificationBridge';
import ContestsPage from '../pages/ContestsPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import RewardsPage from '../pages/RewardsPage';
import NotificationsPage from '../pages/NotificationsPage';
import BusinessEntitlementsPage from '../pages/BusinessEntitlementsPage';
import BusinessPerformancePage from '../pages/BusinessPerformancePage';
import BusinessContestAnalyticsPage from '../pages/BusinessContestAnalyticsPage';

const businessRoles=['business','owner','admin'];
export default function FeatureIntegration(){return <><RewardNotificationBridge/><Routes><Route path="/rewards" element={<RouteGuard requireAuth><RewardsPage/></RouteGuard>}/><Route path="/notifications" element={<RouteGuard requireAuth><NotificationsPage/></RouteGuard>}/><Route path="/contests" element={<RouteGuard requireAuth><ContestsPage/></RouteGuard>}/><Route path="/leaderboard" element={<RouteGuard requireAuth><LeaderboardPage/></RouteGuard>}/><Route path="/business/entitlements" element={<RouteGuard requireAuth roles={businessRoles}><BusinessEntitlementsPage/></RouteGuard>}/><Route path="/business/performance" element={<RouteGuard requireAuth roles={businessRoles}><BusinessPerformancePage/></RouteGuard>}/><Route path="/business/contests/analytics" element={<RouteGuard requireAuth roles={businessRoles}><BusinessContestAnalyticsPage/></RouteGuard>}/></Routes></>}
