-- Phase 4: Zoom token storage on practitioners + altar_offerings cleanup job

alter table public.practitioners
  add column if not exists zoom_tokens jsonb,
  add column if not exists zoom_connected_at timestamptz;

-- Schedule a daily cleanup of expired altar offerings via pg_cron
-- (requires pg_cron extension; uncomment in Supabase dashboard).
-- select cron.schedule(
--   'expire-altar-offerings',
--   '0 3 * * *',
--   $$delete from public.altar_offerings where expires_at < now()$$
-- );
