/**
 * Dev/demo seed data. Used when Supabase is not configured so the
 * UI can be exercised end-to-end without provisioning a project.
 * Do not import in production paths.
 */

import type { Video, VideoCategory, VideoSeries, Practitioner } from "@/lib/supabase/types";

export const DEV_CATEGORIES: VideoCategory[] = [
  { id: "c1", slug: "spiritual-documentaries", name: "Spiritual Documentaries", description: "Long-form films exploring sacred traditions", display_order: 1, created_at: new Date().toISOString() },
  { id: "c2", slug: "healers-mystics", name: "Healers & Mystics", description: "Profiles of contemporary spiritual leaders", display_order: 2, created_at: new Date().toISOString() },
  { id: "c3", slug: "ancestral-knowledge", name: "Ancestral Knowledge", description: "Indigenous wisdom and lineage teachings", display_order: 3, created_at: new Date().toISOString() },
  { id: "c4", slug: "cosmic-consciousness", name: "Cosmic Consciousness", description: "Astrology and the science of awakening", display_order: 4, created_at: new Date().toISOString() },
  { id: "c5", slug: "rituals-ceremonies", name: "Rituals & Ceremonies", description: "Witnessed sacred rituals", display_order: 5, created_at: new Date().toISOString() },
  { id: "c6", slug: "village-originals", name: "Village Originals", description: "Documentaries produced exclusively for 4 Corners Village", display_order: 6, created_at: new Date().toISOString() },
];

const dev = (slug: string, title: string, synopsis: string, category_id: string, durationMin = 52): Video => ({
  id: `v-${slug}`,
  slug,
  title,
  synopsis,
  stream_uid: null,
  duration_seconds: durationMin * 60,
  poster_url: `https://images.unsplash.com/photo-${slug.charCodeAt(0) * 1000000 + slug.length}?w=600&q=80`,
  backdrop_url: null,
  category_id,
  series_id: null,
  episode_number: null,
  season_number: 1,
  is_published: true,
  release_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const DEV_VIDEOS: Video[] = [
  dev("the-water-keepers", "The Water Keepers", "An immersive journey with indigenous elders protecting sacred waters across the four directions.", "c1", 78),
  dev("medicine-of-the-stars", "Medicine of the Stars", "How astrology became science, science became spirit, and the cosmos became kin.", "c4", 64),
  dev("inside-the-yurt", "Inside the Yurt", "Three days with a Mongolian shaman as she conducts a community healing ceremony.", "c5", 54),
  dev("breath-as-architecture", "Breath as Architecture", "A pranayama master rebuilds the body from the inside out.", "c2", 47),
  dev("returning-to-the-altar", "Returning to the Altar", "Black women reclaiming ancestral practices in the diaspora.", "c3", 71),
  dev("the-feminine-fire", "The Feminine Fire", "Five women, five lineages, one rising flame.", "c6", 96),
  dev("threshold", "Threshold", "Death doulas at work in the contemplative tradition.", "c1", 58),
  dev("ceremony-in-the-city", "Ceremony in the City", "Sacred space in a Brooklyn brownstone.", "c5", 39),
  dev("mother-tongue", "Mother Tongue", "Restoring lost prayer languages through song.", "c3", 52),
  dev("the-oracle-speaks", "The Oracle Speaks", "Modern tarot readers reclaim a 600-year-old technology.", "c2", 44),
];

export const DEV_PRACTITIONERS: Practitioner[] = [
  {
    id: "p1",
    user_id: "u1",
    slug: "amara-storm",
    display_name: "Amara Storm",
    tagline: "Vedic astrologer & breathwork facilitator",
    bio: "Amara has guided over 5,000 students through the inner architecture of the breath. Trained in Mysore, India, she now teaches from her sanctuary in the Hudson Valley.",
    avatar_url: null,
    cover_url: null,
    primary_direction: "east",
    modalities: ["Vedic Astrology", "Breathwork", "Yoga Nidra"],
    status: "approved",
    tier: "guide",
    stripe_connect_account_id: null,
    stripe_connect_onboarded: false,
    custom_domain: null,
    zoom_tokens: null,
    zoom_connected_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p2",
    user_id: "u2",
    slug: "river-okafor",
    display_name: "River Okafor",
    tagline: "Ancestral healing & dream tending",
    bio: "Drawing on Yoruba lineage and Jungian depth psychology, River works at the intersection of ancestry and the unconscious.",
    avatar_url: null,
    cover_url: null,
    primary_direction: "north",
    modalities: ["Ancestral Healing", "Dream Work", "Ritual"],
    status: "approved",
    tier: "sanctuary",
    stripe_connect_account_id: null,
    stripe_connect_onboarded: false,
    custom_domain: null,
    zoom_tokens: null,
    zoom_connected_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "p3",
    user_id: "u3",
    slug: "sage-thunderbird",
    display_name: "Sage Thunderbird",
    tagline: "Plant medicine & somatic embodiment",
    bio: "Twenty-year initiate of the Shipibo tradition. Sage holds space for embodied transformation through ceremony and somatic practice.",
    avatar_url: null,
    cover_url: null,
    primary_direction: "south",
    modalities: ["Plant Medicine", "Somatic Therapy", "Ceremony"],
    status: "approved",
    tier: "initiate",
    stripe_connect_account_id: null,
    stripe_connect_onboarded: false,
    custom_domain: null,
    zoom_tokens: null,
    zoom_connected_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEV_SERIES: VideoSeries[] = [
  {
    id: "s1",
    slug: "four-corners-originals",
    title: "4 Corners: Origins",
    synopsis: "A six-part documentary series tracing the indigenous roots of the four directions across continents.",
    poster_url: null,
    backdrop_url: null,
    category_id: "c6",
    is_published: true,
    release_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
