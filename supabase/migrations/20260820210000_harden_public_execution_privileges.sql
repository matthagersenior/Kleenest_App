-- These functions are server/trigger workers, not client-callable APIs.
revoke execute on function public.ingest_external_locations(text,jsonb) from anon, authenticated;
revoke execute on function public.enqueue_notification_push_delivery() from anon, authenticated;
revoke execute on function public.process_intelligence_action_jobs(integer) from anon, authenticated;
revoke execute on function public.seed_location_verification_campaign(text,integer) from anon, authenticated;
