-- ============================================================
-- Four Corners Village - initial schema
-- Phases 0-5: profiles, subs, practitioners, TV, courses, altars
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  birth_date date,
  birth_time time,
  birth_location text,
  role text not null default 'member' check (role in ('member', 'practitioner', 'admin')),
  stripe_customer_id text unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_public"
  on public.profiles for select
  using (auth.uid() = id or true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- SUBSCRIPTIONS (Stripe-backed: TV add-on + practitioner tiers)
-- ------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  product text not null check (product in ('tv', 'initiate', 'guide', 'sanctuary')),
  status text not null check (
    status in (
      'trialing','active','past_due','canceled','unpaid','incomplete','incomplete_expired','paused'
    )
  ),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_product_idx on public.subscriptions(product);

alter table public.subscriptions enable row level security;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);
-- Writes only via service role (Stripe webhooks)

-- Helper: check active TV sub
create or replace function public.has_active_tv_subscription(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = uid
      and product = 'tv'
      and status in ('trialing','active')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- ------------------------------------------------------------
-- PRACTITIONERS (Phase 3)
-- ------------------------------------------------------------
create table public.practitioners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text unique not null,
  display_name text not null,
  tagline text,
  bio text,
  avatar_url text,
  cover_url text,
  primary_direction text check (primary_direction in ('east','south','west','north')),
  modalities text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','suspended','archived')),
  tier text default 'initiate' check (tier in ('initiate','guide','sanctuary')),
  stripe_connect_account_id text unique,
  stripe_connect_onboarded boolean default false,
  custom_domain text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index practitioners_status_idx on public.practitioners(status);
create index practitioners_tier_idx on public.practitioners(tier);

alter table public.practitioners enable row level security;
create policy "practitioners_select_public"
  on public.practitioners for select
  using (status = 'approved' or auth.uid() = user_id);
create policy "practitioners_update_own"
  on public.practitioners for update
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- VINTAGE TV (Phase 2)
-- ------------------------------------------------------------
create table public.video_categories (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  display_order int default 0,
  created_at timestamptz default now() not null
);

create table public.video_series (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  synopsis text,
  poster_url text,
  backdrop_url text,
  category_id uuid references public.video_categories(id) on delete set null,
  is_published boolean default false,
  release_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  synopsis text,
  -- Cloudflare Stream UID
  stream_uid text unique,
  duration_seconds int,
  poster_url text,
  backdrop_url text,
  category_id uuid references public.video_categories(id) on delete set null,
  series_id uuid references public.video_series(id) on delete set null,
  episode_number int,
  season_number int default 1,
  is_published boolean default false,
  release_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index videos_category_idx on public.videos(category_id);
create index videos_series_idx on public.videos(series_id);
create index videos_published_idx on public.videos(is_published, release_date desc);

create table public.video_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  position_seconds int default 0 not null,
  completed boolean default false,
  last_watched_at timestamptz default now() not null,
  primary key (user_id, video_id)
);

create table public.video_my_list (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  series_id uuid references public.video_series(id) on delete cascade,
  added_at timestamptz default now() not null,
  primary key (user_id, video_id, series_id),
  check (video_id is not null or series_id is not null)
);

create table public.video_views (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  video_id uuid not null references public.videos(id) on delete cascade,
  watched_seconds int default 0,
  ip_hash text,
  user_agent text,
  created_at timestamptz default now() not null
);

create index video_views_video_idx on public.video_views(video_id);
create index video_views_user_idx on public.video_views(user_id);

-- TV RLS: anyone can browse metadata of published titles, but only
-- subscribers can request signed playback (enforced in app, not DB).
alter table public.video_categories enable row level security;
alter table public.video_series enable row level security;
alter table public.videos enable row level security;
alter table public.video_progress enable row level security;
alter table public.video_my_list enable row level security;
alter table public.video_views enable row level security;

create policy "categories_public_read"
  on public.video_categories for select using (true);

create policy "series_public_read_published"
  on public.video_series for select
  using (is_published or auth.role() = 'service_role');

create policy "videos_public_read_published"
  on public.videos for select
  using (is_published or auth.role() = 'service_role');

create policy "progress_own"
  on public.video_progress for all
  using (auth.uid() = user_id);

create policy "my_list_own"
  on public.video_my_list for all
  using (auth.uid() = user_id);

create policy "views_insert_self"
  on public.video_views for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "views_select_own"
  on public.video_views for select
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- COURSES / LMS (Phase 4)
-- ------------------------------------------------------------
create table public.courses (
  id uuid primary key default uuid_generate_v4(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  cover_url text,
  price_cents int default 0,
  is_published boolean default false,
  created_at timestamptz default now() not null,
  unique (practitioner_id, slug)
);

create table public.course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  display_order int default 0
);

create table public.course_lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  body text,
  stream_uid text,
  duration_seconds int,
  display_order int default 0
);

create table public.course_enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now() not null,
  primary key (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  completed boolean default false,
  last_position_seconds int default 0,
  primary key (user_id, lesson_id)
);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "courses_public_read"
  on public.courses for select using (is_published or exists(
    select 1 from public.practitioners p
    where p.id = practitioner_id and p.user_id = auth.uid()
  ));

create policy "modules_public_read"
  on public.course_modules for select using (true);

create policy "lessons_public_read"
  on public.course_lessons for select using (true);

create policy "enrollments_own"
  on public.course_enrollments for all using (auth.uid() = user_id);

create policy "lesson_progress_own"
  on public.lesson_progress for all using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- DIGITAL ALTARS (Phase 4)
-- ------------------------------------------------------------
create table public.altars (
  id uuid primary key default uuid_generate_v4(),
  practitioner_id uuid references public.practitioners(id) on delete set null,
  name text not null,
  description text,
  is_global boolean default false,
  created_at timestamptz default now() not null
);

create table public.altar_offerings (
  id uuid primary key default uuid_generate_v4(),
  altar_id uuid not null references public.altars(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  offering_type text not null check (offering_type in ('candle','prayer','flower','crystal','intention')),
  message text,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now() not null
);

create index altar_offerings_altar_idx on public.altar_offerings(altar_id, expires_at);

alter table public.altars enable row level security;
alter table public.altar_offerings enable row level security;

create policy "altars_read" on public.altars for select using (true);
create policy "offerings_read" on public.altar_offerings for select using (true);
create policy "offerings_insert_own" on public.altar_offerings for insert
  with check (auth.uid() = user_id);
create policy "offerings_delete_own" on public.altar_offerings for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- ORACLE READINGS (Phase 4)
-- ------------------------------------------------------------
create table public.oracle_readings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text,
  cards jsonb not null,
  interpretation text,
  created_at timestamptz default now() not null
);

alter table public.oracle_readings enable row level security;
create policy "readings_own" on public.oracle_readings for all using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- WAITLIST (Phase 0 - landing page captures)
-- ------------------------------------------------------------
create table public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  interest text check (interest in ('member','practitioner','tv','all')),
  source text,
  created_at timestamptz default now() not null,
  unique (email, interest)
);

alter table public.waitlist enable row level security;
create policy "waitlist_insert_anon" on public.waitlist for insert with check (true);

-- ------------------------------------------------------------
-- SEED CATEGORIES
-- ------------------------------------------------------------
insert into public.video_categories (slug, name, description, display_order) values
  ('spiritual-documentaries','Spiritual Documentaries','Long-form films exploring sacred traditions and modern mysticism',1),
  ('healers-mystics','Healers & Mystics','Profiles of contemporary spiritual leaders, energy workers, and seers',2),
  ('ancestral-knowledge','Ancestral Knowledge','Indigenous wisdom, ancestral practices, and lineage teachings',3),
  ('cosmic-consciousness','Cosmic Consciousness','Astrology, astronomy, and the science of awakening',4),
  ('rituals-ceremonies','Rituals & Ceremonies','Witnessed sacred rituals from around the world',5),
  ('village-originals','Village Originals','Documentaries produced exclusively for Four Corners',6)
on conflict (slug) do nothing;

insert into public.altars (id, name, description, is_global) values
  ('00000000-0000-0000-0000-000000000001','The Village Altar','A shared sacred space for the entire Four Corners community',true)
on conflict (id) do nothing;
