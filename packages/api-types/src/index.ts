/**
 * Shared API types — Supabase row shapes, Stripe enums, domain types.
 *
 * The web app re-exports these via its `@/lib/supabase/types` path; the mobile
 * app imports them directly. When the schema changes, regenerate via
 * `supabase gen types typescript` and update this file.
 */

export type Direction = "east" | "south" | "west" | "north";
export type Element = "air" | "fire" | "water" | "earth";

export const directionToElement: Record<Direction, Element> = {
  east: "air",
  south: "fire",
  west: "water",
  north: "earth",
};

export const elementToDirection: Record<Element, Direction> = {
  air: "east",
  fire: "south",
  water: "west",
  earth: "north",
};

// ============================================================
//   Profiles + auth
// ============================================================
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

// ============================================================
//   Subscriptions / billing
// ============================================================
export type SubscriptionProduct = "tv" | "initiate" | "guide" | "sanctuary";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  product: SubscriptionProduct;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export const isActiveSubscription = (sub: Pick<Subscription, "status"> | null | undefined) =>
  !!sub && (sub.status === "active" || sub.status === "trialing");

// ============================================================
//   Practitioners + Connect
// ============================================================
export type ZoomTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  scope: string;
};

export type PractitionerTier = "initiate" | "guide" | "sanctuary";
export type PractitionerStatus = "pending" | "approved" | "suspended" | "archived";

export type Practitioner = {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  primary_direction: Direction | null;
  modalities: string[];
  status: PractitionerStatus;
  tier: PractitionerTier;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarded: boolean;
  custom_domain: string | null;
  zoom_tokens: ZoomTokens | null;
  zoom_connected_at: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================
//   Vintage TV
// ============================================================
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

// ============================================================
//   Courses
// ============================================================
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

// ============================================================
//   Sacred tools — Altars + Oracle
// ============================================================
export type AltarOfferingType = "candle" | "prayer" | "flower" | "crystal" | "intention";

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
  offering_type: AltarOfferingType;
  message: string | null;
  expires_at: string;
  created_at: string;
};

export type OracleCard = {
  id: string;
  name: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  meaning_upright: string;
  meaning_reversed: string;
  keywords: string[];
};

export type OracleReading = {
  id: string;
  user_id: string;
  question: string | null;
  cards: { card: OracleCard; reversed: boolean; position: string }[];
  interpretation: string | null;
  created_at: string;
};

// ============================================================
//   Lunar
// ============================================================
export type LunarPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export type LunarPhase = {
  /** 0..1 — fraction of lunar cycle, 0 = new moon, 0.5 = full moon */
  progress: number;
  /** 0..1 — illuminated fraction */
  illumination: number;
  name: LunarPhaseName;
  /** Glyph for display (🌑🌒🌓🌔🌕🌖🌗🌘) */
  glyph: string;
};

// ============================================================
//   Waitlist
// ============================================================
export type WaitlistEntry = {
  id: string;
  email: string;
  interest: "member" | "practitioner" | "tv" | "all" | null;
  source: string | null;
  created_at: string;
};
