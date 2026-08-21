revoke execute on function public.ingest_external_locations(text,jsonb) from public, anon, authenticated;
revoke execute on function public.enqueue_notification_push_delivery() from public, anon, authenticated;
revoke execute on function public.process_intelligence_action_jobs(integer) from public, anon, authenticated;
revoke execute on function public.seed_location_verification_campaign(text,integer) from public, anon, authenticated;
