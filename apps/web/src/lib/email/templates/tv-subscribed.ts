import { emailShell, escapeHtml, type Email } from "@/lib/email";

export function TvSubscribedEmail(opts: {
  recipientName: string | null;
  watchUrl: string;
}): Email {
  const name = opts.recipientName ? escapeHtml(opts.recipientName) : "friend";
  const watchUrl = opts.watchUrl;

  const text = `You're subscribed to Four Corners Vintage TV.

Curated documentaries on consciousness, healing, the cosmos, and the ancient ways. New rotations monthly.

Start watching: ${watchUrl}

— Four Corners Village`;

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#fbbf24;">Welcome to Vintage TV, ${name}.</h1>
    <p style="margin:0 0 16px;">Your subscription is active. Documentaries, rare lectures, ceremonies, and starscapes — curated and rotating monthly.</p>
    <p style="margin:0 0 24px;">Pour a tea. Pick a frequency.</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>
        <a href="${watchUrl}" style="display:inline-block;padding:10px 18px;background:#fbbf24;color:#0f172a;text-decoration:none;border-radius:8px;font-weight:600;">Start watching</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:14px;">
      You can manage or cancel your subscription from your account settings at any time.
    </p>
  `;

  return {
    html: emailShell({ previewText: `Your Vintage TV subscription is active.`, bodyHtml }),
    text,
  };
}
