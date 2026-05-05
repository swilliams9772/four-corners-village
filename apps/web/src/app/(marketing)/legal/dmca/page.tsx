import { LongForm } from "@/components/ui/long-form";
import { Eyebrow } from "@/components/ui/typography";

export const metadata = {
  title: "DMCA Policy",
  description: "How to file a DMCA takedown notice or counter-notice with Four Corners Village.",
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24 lg:px-10">
      <Eyebrow>Legal</Eyebrow>
      <LongForm>
        <h1>DMCA Policy</h1>
        <p className="text-caption uppercase tracking-widest text-ink-muted">
          Last updated · April 30, 2026
        </p>

        <p>
          Four Corners Village respects the intellectual property rights of others. Per the Digital
          Millennium Copyright Act (17 U.S.C. § 512), we will respond expeditiously to claims of
          copyright infringement.
        </p>

        <h2>Designated agent</h2>
        <address className="not-italic">
          Four Corners Village — DMCA Agent
          <br />
          Email:{" "}
          <a href="mailto:dmca@fourcorners.village">dmca@fourcorners.village</a>
        </address>

        <h2>Notice requirements</h2>
        <ul>
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the material to be removed and its URL on our service</li>
          <li>Your contact information (name, address, phone, email)</li>
          <li>A statement of good-faith belief that the use is unauthorized</li>
          <li>A statement, under penalty of perjury, that you are authorized to act</li>
          <li>Your physical or electronic signature</li>
        </ul>

        <h2>Counter-notice</h2>
        <p>
          If your content was removed in error, you may submit a counter-notice with the same
          elements above plus a consent to jurisdiction in the federal district court for our
          principal place of business.
        </p>

        <h2>Repeat infringers</h2>
        <p>We terminate accounts of repeat infringers in appropriate circumstances.</p>
      </LongForm>
    </div>
  );
}
