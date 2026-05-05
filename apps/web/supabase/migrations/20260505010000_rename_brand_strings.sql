-- Brand rename: "Four Corners" → "4 Corners Village"
-- The original initial-schema migration seeded a category and the Village
-- Altar with the old long-form brand string. Update the live values to
-- match the new spelling without rewriting an already-applied migration.

UPDATE public.video_categories
SET description = 'Documentaries produced exclusively for 4 Corners Village'
WHERE slug = 'village-originals';

UPDATE public.altars
SET description = 'A shared sacred space for the entire 4 Corners Village community'
WHERE id = '00000000-0000-0000-0000-000000000001';
