/**
 * Hand-rolled lightweight types matching supabase/migrations/*.
 * Replace with `supabase gen types typescript` output once a real
 * project is provisioned.
 */

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_location: string | null;
  role: "member" | "practitioner" | "admin";
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionProduct = "tv" | "initiate" | "guide" | "sanctuary";

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  product: SubscriptionProduct;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type ZoomTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  /** Absolute expiry as ms-since-epoch; computed at exchange time. */
  expires_at: number;
  scope: string;
};

export type Practitioner = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  primary_direction: "east" | "south" | "west" | "north" | null;
  modalities: string[];
  status: "pending" | "approved" | "suspended" | "archived";
  tier: "initiate" | "guide" | "sanctuary";
  stripe_connect_account_id: string | null;
  stripe_connect_onboarded: boolean;
  custom_domain: string | null;
  zoom_tokens: ZoomTokens | null;
  zoom_connected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
};

export type VideoSeries = {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  category_id: string | null;
  is_published: boolean;
  release_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  stream_uid: string | null;
  duration_seconds: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  category_id: string | null;
  series_id: string | null;
  episode_number: number | null;
  season_number: number;
  is_published: boolean;
  release_date: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoProgress = {
  user_id: string;
  video_id: string;
  position_seconds: number;
  completed: boolean;
  last_watched_at: string;
};

export type Course = {
  id: string;
  practitioner_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  price_cents: number;
  is_published: boolean;
  created_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
};

export type CourseLesson = {
  id: string;
  module_id: string;
  title: string;
  body: string | null;
  stream_uid: string | null;
  duration_seconds: number | null;
  display_order: number;
};

export type Altar = {
  id: string;
  practitioner_id: string | null;
  name: string;
  description: string | null;
  is_global: boolean;
  created_at: string;
};

export type AltarOffering = {
  id: string;
  altar_id: string;
  user_id: string;
  offering_type: "candle" | "prayer" | "flower" | "crystal" | "intention";
  message: string | null;
  expires_at: string;
  created_at: string;
};

export type OracleReading = {
  id: string;
  user_id: string;
  question: string | null;
  cards: unknown;
  interpretation: string | null;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  email: string;
  interest: "member" | "practitioner" | "tv" | "all" | null;
  source: string | null;
  created_at: string;
};
