import { LongForm } from "@/components/ui/long-form";
import { Eyebrow } from "@/components/ui/typography";

export const metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your data at 4 Corners Village.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-10">
      <Eyebrow>Legal</Eyebrow>
      <LongForm>
        <h1>Privacy Policy</h1>
        <p className="text-caption uppercase tracking-widest text-ink-muted">
          Last updated · April 30, 2026
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Email address, name, and profile details you provide</li>
          <li>Optional birth-chart data (date, time, location) for astrological matching</li>
          <li>Subscription and payment metadata (handled by Stripe — we never see card numbers)</li>
          <li>Vintage TV viewing history (which titles you&apos;ve started, paused, or finished)</li>
          <li>Standard logs (IP address hashed for security, user agent, requested URL)</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To provide the services you request and personalize your experience</li>
          <li>To process subscriptions and route payouts via Stripe</li>
          <li>To detect abuse and enforce content licensing on Vintage TV</li>
          <li>To send transactional and (with consent) marketing emails via Resend</li>
        </ul>

        <h2>Who we share with</h2>
        <p>
          We share data only with infrastructure providers (Vercel, Supabase, Stripe, Cloudflare,
          Resend, Sentry) under strict data-processing agreements, or with practitioners you book.
          We never sell personal data.
        </p>

        <h2>Your rights</h2>
        <p>
          You may export, correct, or delete your data at any time by writing to{" "}
          <a href="mailto:privacy@fourcorners.village">privacy@fourcorners.village</a>. EU/UK
          residents have GDPR rights; California residents have CCPA rights.
        </p>

        <h2>Cookies</h2>
        <p>
          We use first-party cookies for authentication and minimal analytics. We do not use
          third-party advertising trackers.
        </p>

        <h2>Children</h2>
        <p>
          4 Corners Village is for users 18+. We do not knowingly collect data from minors.
        </p>
      </LongForm>
    </div>
  );
}
