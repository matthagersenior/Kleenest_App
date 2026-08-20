import RewardNotificationBridge from './RewardNotificationBridge';
import LocationActivityBridge from './LocationActivityBridge';
import LocationVerificationBridge from './LocationVerificationBridge';
import PushNotificationBridge from './PushNotificationBridge';

// AppRuntime owns application routes. This component is intentionally limited
// to cross-cutting integrations so feature pages are mounted exactly once.
export default function FeatureIntegration(){
  return <>
    <RewardNotificationBridge/>
    <LocationActivityBridge/>
    <LocationVerificationBridge/>
    <PushNotificationBridge/>
  </>;
}
