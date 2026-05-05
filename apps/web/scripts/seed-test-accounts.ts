/**
 * Seed test accounts at every access tier so you can preview the full app.
 *
 * Creates six users (idempotent — re-running just re-syncs their entitlements):
 *
 *   member@fourcorners.test       — vanilla logged-in member, no subs
 *   tv@fourcorners.test           — Vintage TV monthly active subscriber
 *   initiate@fourcorners.test     — practitioner, Initiate tier, approved
 *   guide@fourcorners.test        — practitioner, Guide tier, approved + course published
 *   sanctuary@fourcorners.test    — practitioner, Sanctuary tier, approved + Connect onboarded
 *   admin@fourcorners.test        — admin (also has TV access)
 *
 * Every account uses the password `Forest!Sun42` (printed at the end).
 *
 * Usage:
 *   pnpm --filter @four-corners/web tsx scripts/seed-test-accounts.ts
 *
 * Requires (in apps/web/.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   ADMIN_EMAILS=admin@fourcorners.test     // surface admin UI on web
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "[seed] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in apps/web/.env.local",
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Forest!Sun42";

type Account = {
  email: string;
  fullName: string;
  displayName: string;
  role: "member" | "practitioner" | "admin";
  tvSubscription?: boolean;
  practitioner?: {
    slug: string;
    tagline: string;
    bio: string;
    primaryDirection: "east" | "south" | "west" | "north";
    modalities: string[];
    tier: "initiate" | "guide" | "sanctuary";
    connectOnboarded?: boolean;
    publishCourse?: boolean;
  };
};

const ACCOUNTS: Account[] = [
  {
    email: "member@fourcorners.test",
    fullName: "Aria Field",
    displayName: "Aria",
    role: "member",
  },
  {
    email: "tv@fourcorners.test",
    fullName: "Wren Holloway",
    displayName: "Wren",
    role: "member",
    tvSubscription: true,
  },
  {
    email: "initiate@fourcorners.test",
    fullName: "Sage Marin",
    displayName: "Sage",
    role: "practitioner",
    practitioner: {
      slug: "sage-marin",
      tagline: "Sound healer, breath-work guide, river-witch.",
      bio: "Sage trained in oceanic sound healing on the coast of Sintra and now offers monthly group breath sessions and 1:1 attunements.",
      primaryDirection: "west",
      modalities: ["Sound Healing", "Breath Work", "Water Ritual"],
      tier: "initiate",
    },
  },
  {
    email: "guide@fourcorners.test",
    fullName: "Linnea Ash",
    displayName: "Linnea",
    role: "practitioner",
    practitioner: {
      slug: "linnea-ash",
      tagline: "Astrologer, ancestral medicine keeper, course-teacher.",
      bio: "Linnea reads charts in the Hellenistic lineage and teaches a six-week course on ancestral healing through the lunar nodes.",
      primaryDirection: "north",
      modalities: ["Astrology", "Ancestral Healing", "Course Teaching"],
      tier: "guide",
      publishCourse: true,
    },
  },
  {
    email: "sanctuary@fourcorners.test",
    fullName: "Iris Caldwell",
    displayName: "Iris",
    role: "practitioner",
    practitioner: {
      slug: "iris-caldwell",
      tagline: "Embodiment teacher, retreat host, fire keeper.",
      bio: "Iris hosts week-long embodiment retreats in northern New Mexico and offers private container work via Zoom for established students.",
      primaryDirection: "south",
      modalities: ["Embodiment", "Retreats", "Private Container"],
      tier: "sanctuary",
      connectOnboarded: true,
    },
  },
  {
    email: "admin@fourcorners.test",
    fullName: "Ezra Vale",
    displayName: "Ezra",
    role: "admin",
    tvSubscription: true,
  },
];

async function findUserIdByEmail(email: string): Promise<string | null> {
  // listUsers supports paging; for our six accounts we'll page until we find or exhaust.
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
    page++;
  }
}

async function ensureUser(account: Account): Promise<string> {
  const existing = await findUserIdByEmail(account.email);
  if (existing) {
    // Reset password + meta so the doc is always accurate.
    await sb.auth.admin.updateUserById(existing, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    return existing;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: account.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: account.fullName },
  });
  if (error || !data.user) throw error ?? new Error("create user failed");
  return data.user.id;
}

async function ensureProfile(userId: string, account: Account) {
  const { error } = await sb.from("profiles").upsert(
    {
      id: userId,
      email: account.email,
      full_name: account.fullName,
      display_name: account.displayName,
      role: account.role,
      bio:
        account.practitioner?.bio ??
        (account.role === "admin"
          ? "Village stewards. Reachable in the admin console."
          : "Member of the village."),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

async function ensureTvSubscription(userId: string) {
  const stripeId = `seed_sub_tv_${userId.slice(0, 8)}`;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const { error } = await sb.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: stripeId,
      stripe_price_id: "seed_price_tv_monthly",
      product: "tv",
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) throw error;
}

async function ensurePractitioner(userId: string, account: Account) {
  if (!account.practitioner) return null;
  const p = account.practitioner;
  const { data, error } = await sb
    .from("practitioners")
    .upsert(
      {
        user_id: userId,
        slug: p.slug,
        display_name: account.displayName,
        tagline: p.tagline,
        bio: p.bio,
        primary_direction: p.primaryDirection,
        modalities: p.modalities,
        status: "approved",
        tier: p.tier,
        stripe_connect_account_id: p.connectOnboarded
          ? `seed_acct_${userId.slice(0, 8)}`
          : null,
        stripe_connect_onboarded: !!p.connectOnboarded,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();
  if (error) throw error;

  // Tier subscription so the entitlement check shows the right tier.
  const tierStripeId = `seed_sub_${p.tier}_${userId.slice(0, 8)}`;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await sb.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: tierStripeId,
      stripe_price_id: `seed_price_${p.tier}`,
      product: p.tier,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (p.publishCourse && data?.id) {
    await ensureSampleCourse(data.id, account);
  }
  return data?.id ?? null;
}

async function ensureSampleCourse(practitionerId: string, account: Account) {
  const courseSlug = "ancestral-lunar-nodes";
  const { data: course, error: courseErr } = await sb
    .from("courses")
    .upsert(
      {
        practitioner_id: practitionerId,
        slug: courseSlug,
        title: "Ancestral Healing Through the Lunar Nodes",
        description:
          "A six-week journey into the karmic axis of the moon's nodes, with weekly chart readings, ancestral journaling, and group altar work.",
        price_cents: 24900,
        is_published: true,
      },
      { onConflict: "practitioner_id,slug" },
    )
    .select("id")
    .single();
  if (courseErr) throw courseErr;
  if (!course) return;

  const modules = [
    { title: "Foundations · The Karmic Axis", display_order: 1 },
    { title: "South Node · Inherited Patterns", display_order: 2 },
    { title: "North Node · Soul Direction", display_order: 3 },
  ];
  for (const m of modules) {
    const { data: existing } = await sb
      .from("course_modules")
      .select("id")
      .eq("course_id", course.id)
      .eq("title", m.title)
      .maybeSingle();
    if (!existing) {
      await sb.from("course_modules").insert({ course_id: course.id, ...m });
    }
  }
  void account;
}

async function ensureAltarOffering(userId: string, account: Account) {
  const offeringTypes = ["candle", "prayer", "flower", "crystal", "intention"] as const;
  const idx = account.email.charCodeAt(0) % offeringTypes.length;
  const { data: existing } = await sb
    .from("altar_offerings")
    .select("id")
    .eq("user_id", userId)
    .eq("altar_id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();
  if (existing) return;
  await sb.from("altar_offerings").insert({
    altar_id: "00000000-0000-0000-0000-000000000001",
    user_id: userId,
    offering_type: offeringTypes[idx],
    message:
      account.role === "practitioner"
        ? "May our students find their thresholds."
        : "Holding the village in light.",
  });
}

async function main() {
  console.log("[seed] Connecting to", SUPABASE_URL);
  for (const account of ACCOUNTS) {
    process.stdout.write(`[seed] ${account.email} … `);
    try {
      const userId = await ensureUser(account);
      await ensureProfile(userId, account);
      if (account.tvSubscription) await ensureTvSubscription(userId);
      if (account.practitioner) await ensurePractitioner(userId, account);
      await ensureAltarOffering(userId, account);
      console.log("ok");
    } catch (err) {
      console.log("FAIL");
      console.error(err);
      process.exitCode = 1;
    }
  }

  console.log("");
  console.log("─────────────────────────────────────────────");
  console.log("Test accounts (password for all: " + PASSWORD + ")");
  console.log("─────────────────────────────────────────────");
  for (const a of ACCOUNTS) {
    const tags = [
      a.role,
      a.tvSubscription ? "TV active" : null,
      a.practitioner ? `${a.practitioner.tier} practitioner` : null,
      a.practitioner?.connectOnboarded ? "Connect onboarded" : null,
      a.practitioner?.publishCourse ? "course published" : null,
    ].filter(Boolean);
    console.log(`  ${a.email.padEnd(34)} ${tags.join(" · ")}`);
  }
  console.log("");
  if (ACCOUNTS.some((a) => a.role === "admin")) {
    console.log("Note: to surface the admin console, add to apps/web/.env.local:");
    console.log("  ADMIN_EMAILS=admin@fourcorners.test");
  }
}

void main();
