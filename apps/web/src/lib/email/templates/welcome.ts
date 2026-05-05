import { emailShell, escapeHtml, type Email } from "@/lib/email";
import { env } from "@/lib/env";

export function WelcomeEmail(opts: { recipientName: string | null }): Email {
  const name = opts.recipientName ? escapeHtml(opts.recipientName) : "traveler";
  const dashboardUrl = `${env.app.url}/dashboard`;
  const tvUrl = `${env.app.url}/tv`;
  const oracleUrl = `${env.app.url}/oracle`;

  const text = `Welcome to Four Corners Village, ${name}.

Your account is live. From your dashboard you can browse practitioners, watch Vintage TV, and consult the Oracle.

Dashboard: ${dashboardUrl}
Vintage TV: ${tvUrl}
Oracle: ${oracleUrl}

— Four Corners Village`;

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#fbbf24;">Welcome, ${name}.</h1>
    <p style="margin:0 0 16px;">Your account is live. Four corners — east, south, west, and north — each with its own keepers, teachers, and ceremonies.</p>
    <p style="margin:0 0 24px;">Start where you're called:</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td style="padding:0 0 12px;">
        <a href="${dashboardUrl}" style="display:inline-block;padding:10px 18px;background:#fbbf24;color:#0f172a;text-decoration:none;border-radius:8px;font-weight:600;">Open dashboard</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:14px;">
      Or jump straight to <a href="${tvUrl}" style="color:#fbbf24;">Vintage TV</a> or <a href="${oracleUrl}" style="color:#fbbf24;">the Oracle</a>.
    </p>
  `;

  return {
    html: emailShell({ previewText: `Welcome to Four Corners Village, ${name}.`, bodyHtml }),
    text,
  };
}
