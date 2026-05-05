import { Resend } from "resend";
import { env } from "@/lib/env";

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (!env.resend.configured) return null;
  if (!cached) cached = new Resend(env.resend.apiKey);
  return cached;
}

export type Email = {
  /** HTML body. */
  html: string;
  /** Plain-text fallback for clients that can't render HTML. */
  text: string;
};

export type EmailPayload = {
  to: string | string[];
  subject: string;
  /** Either an Email object (preferred) or just html. */
  body: Email | { html: string; text?: string };
  /** Override the default from address per-message. */
  from?: string;
};

/**
 * Sends an email via Resend. When the API key isn't configured (zero-config
 * dev mode), this no-ops and just logs the subject + recipients so you can
 * still see emails would have fired during local testing.
 *
 * Failures NEVER throw — callers running inside webhooks rely on this.
 */
export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string }> {
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const resend = getResend();

  if (!resend) {
    console.info(
      `[email] (no RESEND_API_KEY) would send "${payload.subject}" to ${recipients.join(", ")}`,
    );
    return { ok: false };
  }

  try {
    const res = await resend.emails.send({
      from: payload.from ?? env.resend.from,
      to: recipients,
      subject: payload.subject,
      html: payload.body.html,
      text: payload.body.text,
    });
    if (res.error) {
      console.error("[email] resend error", res.error);
      return { ok: false };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false };
  }
}

/**
 * Wraps an HTML body in a minimal email shell. Inline styles only — most email
 * clients still strip <style> blocks. Keep it sober and centered.
 */
export function emailShell(opts: { previewText: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>4 Corners Village</title>
  </head>
  <body style="margin:0;padding:0;background:#0f172a;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${escapeHtml(opts.previewText)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px 32px;border-bottom:1px solid #334155;">
                <p style="margin:0;font-size:14px;letter-spacing:2px;color:#fbbf24;text-transform:uppercase;">4 Corners Village</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;line-height:1.6;color:#e2e8f0;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #334155;color:#64748b;font-size:12px;">
                You're receiving this because you have a 4 Corners Village account.
                <br />
                <a href="${env.app.url}" style="color:#fbbf24;text-decoration:none;">${env.app.url}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
