import { emailShell, escapeHtml, type Email } from "@/lib/email";

export function PractitionerApprovedEmail(opts: {
  practitionerName: string;
  spaceUrl: string;
  onboardingUrl: string;
}): Email {
  const name = escapeHtml(opts.practitionerName);

  const text = `Welcome, ${name}.

Your application to Four Corners Village has been approved.

Next steps:
1. Complete Stripe Connect onboarding so payouts can flow to you.
2. Subscribe to your tier (Initiate / Guide / Sanctuary).
3. Publish your space.

Continue onboarding: ${opts.onboardingUrl}
Your space (once live): ${opts.spaceUrl}

— Four Corners Village`;

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#34d399;">You're in, ${name}.</h1>
    <p style="margin:0 0 16px;">Your practitioner application has been approved by our team.</p>
    <p style="margin:0 0 16px;">A few steps remain before your space is live:</p>
    <ol style="margin:0 0 24px;padding-left:18px;color:#cbd5e1;">
      <li style="margin-bottom:8px;">Complete Stripe Connect onboarding (so we can pay you out, 85/15 split).</li>
      <li style="margin-bottom:8px;">Subscribe to your tier — Initiate, Guide, or Sanctuary.</li>
      <li style="margin-bottom:8px;">Publish your space and announce it to your community.</li>
    </ol>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>
        <a href="${opts.onboardingUrl}" style="display:inline-block;padding:10px 18px;background:#34d399;color:#0f172a;text-decoration:none;border-radius:8px;font-weight:600;">Continue onboarding</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:14px;">
      Public address: <a href="${opts.spaceUrl}" style="color:#fbbf24;">${opts.spaceUrl}</a>
    </p>
  `;

  return {
    html: emailShell({
      previewText: `Welcome to Four Corners Village. You've been approved.`,
      bodyHtml,
    }),
    text,
  };
}
