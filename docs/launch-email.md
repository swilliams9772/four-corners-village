# Founding-circle launch email

Plain-text + HTML versions for the soft-launch announcement to waitlist members. Pull recipients from `waitlist` table where `created_at < launch_date` and order by `created_at ASC` so the earliest signups feel honored. Send through Resend with a 50-message-per-batch cadence.

---

## Subject line options

- **A.** `the four corners are open`
- **B.** `you're invited inside`
- **C.** `we lit the candle`

A/B test A vs. B with the first two batches.

---

## Body — plain text

```
You signed up to be among the first.
Today the village opens — small, quiet, and only to you for now.

4 Corners Village is a digital sanctuary for sacred living:
  · Vintage TV — curated documentaries on lineage, ceremony, and inner work
  · Practitioner Spaces — sovereign sub-spaces for guides, healers, and teachers
  · Digital Altars + Oracle — collective intention, lunar timing, daily reflection

We built it slowly, in collaboration with practitioners we trust, and tuned every
surface to the moon's rhythm. The full village will open later this season; for now,
we're sharing it with the founding circle so we can listen, refine, and tend.

Your invite link (active for 7 days):
  https://fourcorners.village/welcome?invite={{INVITE_CODE}}

Three first steps inside:

  1.  Light a candle on the village altar — leave an intention you've been carrying.
  2.  Watch one Vintage TV piece — we recommend "The Old Way" or "Slow Burn."
  3.  Reply to this email with the one thing you wish a sanctuary like this did.
      We read every reply, and we're listening before adding anything.

If anything feels off — broken, too fast, too noisy — tell us. We'd rather fix it
together than launch louder.

In rhythm,
The 4 Corners Village team
hello@fourcorners.village

---
You're receiving this because you joined the waitlist on {{SIGNUP_DATE}}. We won't
share your email or send anything beyond village updates. Reply STOP to be removed.
```

---

## Body — HTML (Resend template)

Use the template engine in `apps/web/src/lib/email/founding-launch.tsx`. Variables:

- `{{INVITE_CODE}}` — generated from `lib/auth.ts` `mintInviteCode(email)` and stored on the waitlist row
- `{{SIGNUP_DATE}}` — formatted as `MMMM D, YYYY`
- `{{FIRST_NAME}}` — pulled from waitlist if collected; else "friend"

The HTML version mirrors the plain text but adds:

- Lunar orb SVG inline at the top (matches the dashboard orb, ~120px)
- Three cards (Vintage TV, Altars, Oracle) below the body
- Soft fade-in not used — many email clients strip CSS animations; rely on still imagery

---

## Send checklist

- [ ] Resend domain verified for `fourcorners.village`
- [ ] DKIM/SPF/DMARC pass on `mail-tester.com` (target ≥ 9/10)
- [ ] Invite codes minted + persisted to `waitlist.invite_code`
- [ ] Test send to your own + one teammate's inbox; render in Gmail web, Apple Mail, Outlook web
- [ ] Schedule batches of 50 every 30 min; first batch limited to 10 to catch any deliverability issues early
- [ ] Tag campaign in PostHog as `launch_invite_v1` so we can attribute opens/clicks/signups
- [ ] After 24h, pull conversion stats from PostHog + Resend, decide whether to send batch 2
