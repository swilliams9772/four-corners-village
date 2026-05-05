import { LongForm } from "@/components/ui/long-form";
import { Eyebrow } from "@/components/ui/typography";

export const metadata = {
  title: "Terms of Service",
  description: "The agreement between you and Four Corners Village.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-10">
      <Eyebrow>Legal</Eyebrow>
      <LongForm>
        <h1>Terms of Service</h1>
        <p className="text-caption uppercase tracking-widest text-ink-muted">
          Last updated · April 30, 2026
        </p>

        <p>
          Welcome to Four Corners Village (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the
          Village&rdquo;). By creating an account or using any part of our services — including Four
          Corners Vintage TV, practitioner spaces, the Oracle, and Digital Altars — you agree to
          these terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>You must be at least 18 years old to use Four Corners Village.</p>

        <h2>2. Membership & Subscriptions</h2>
        <p>
          Membership accounts are free. Vintage TV is a separate paid subscription
          (<strong>$5.55/month</strong> or <strong>$55.55/year</strong>). Practitioner tiers
          (Initiate, Guide, Sanctuary) are billed monthly to leaseholders.
        </p>

        <h2>3. Vintage TV Streaming</h2>
        <p>
          Vintage TV content is licensed for streaming-only use within the Village app. You may not
          download, copy, redistribute, or publicly perform any video. Doing so terminates your
          subscription without refund and may incur additional civil liability.
        </p>

        <h2>4. Practitioner Conduct</h2>
        <p>
          Practitioners are independent contractors, not employees. Four Corners Village does not
          provide medical, psychological, or legal advice. Practitioners must comply with all
          applicable professional licensing in their jurisdiction.
        </p>

        <h2>5. Payments</h2>
        <p>
          Payments are processed by Stripe, Inc. Practitioner payouts route via Stripe Connect with
          a 15% platform fee. Member subscriptions are billed automatically and renew until
          canceled.
        </p>

        <h2>6. Cancellation</h2>
        <p>
          You may cancel any subscription at any time via the Account → Billing page. Access
          continues until the end of the current billing period. Refunds are at our discretion.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          Practitioners retain ownership of content they upload. Four Corners is granted a
          non-exclusive license to host and display practitioner content within the platform.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these terms or community guidelines,
          with or without notice.
        </p>

        <h2>9. Disclaimer</h2>
        <p>
          Spiritual practice is personal. Content on this platform — oracle readings, lunar
          guidance, practitioner sessions — is for reflection and inspiration. It is not a
          substitute for medical, psychological, or financial advice.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions: <a href="mailto:hello@fourcorners.village">hello@fourcorners.village</a>
        </p>
      </LongForm>
    </div>
  );
}
