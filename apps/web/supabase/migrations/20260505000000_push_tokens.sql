-- Push tokens for the Expo / native app fan-out.
--
-- One row per (user, device-token) pair; we de-dupe on `token` upserts. The
-- `revoked` flag is flipped when the device unregisters (sign-out, OS
-- permission revoked) instead of deleting the row, so we can surface "this
-- device hasn't checked in for N days" later.
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android', 'web')),
  device_name text,
  revoked boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists push_tokens_user_id_idx on public.push_tokens (user_id) where not revoked;

alter table public.push_tokens enable row level security;

create policy "users own their push tokens"
  on public.push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Notification log so we can deduplicate fan-outs and reason about delivery.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null,            -- "all", "tv-subscribers", "user:<uuid>"
  topic text not null,               -- "lunar.full", "tv.new", "altar.ping", "course.update"
  title text not null,
  body text not null,
  url text,                          -- deep-link path (e.g. "/v/lila")
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null default now(),
  delivered_count integer not null default 0,
  failed_count integer not null default 0
);

create index if not exists notifications_topic_idx on public.notifications (topic, sent_at desc);

alter table public.notifications enable row level security;

create policy "notifications are admin-only"
  on public.notifications
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
