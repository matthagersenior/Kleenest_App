import RewardNotificationBridge from './RewardNotificationBridge';
import LocationActivityBridge from './LocationActivityBridge';
import LocationVerificationBridge from './LocationVerificationBridge';
import PushNotificationBridge from './PushNotificationBridge';
import NetworkRealtimeBridge from './NetworkRealtimeBridge';
import NetworkEventToast from './NetworkEventToast';
import NotificationRealtimeBridge from './NotificationRealtimeBridge';
import IntelligenceNotificationEventBridge from './IntelligenceNotificationEventBridge';

// Cross-cutting integrations only; application routes remain in AppRuntime.
export default function FeatureIntegration(){
  return <>
    <RewardNotificationBridge/>
    <LocationActivityBridge/>
    <LocationVerificationBridge/>
    <PushNotificationBridge/>
    <NetworkRealtimeBridge/>
    <NetworkEventToast/>
    <NotificationRealtimeBridge/>
    <IntelligenceNotificationEventBridge/>
  </>;
}
