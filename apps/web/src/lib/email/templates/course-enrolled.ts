import { emailShell, escapeHtml, type Email } from "@/lib/email";

export function CourseEnrolledEmail(opts: {
  recipientName: string | null;
  courseTitle: string;
  practitionerName: string | null;
  courseUrl: string;
}): Email {
  const name = opts.recipientName ? escapeHtml(opts.recipientName) : "friend";
  const title = escapeHtml(opts.courseTitle);
  const practitioner = opts.practitionerName ? escapeHtml(opts.practitionerName) : null;

  const lineFromPractitioner = practitioner
    ? `<p style="margin:0 0 16px;color:#cbd5e1;">Hosted by ${practitioner}.</p>`
    : "";

  const textPractitioner = practitioner ? `Hosted by ${opts.practitionerName}.\n\n` : "";

  const text = `You're enrolled in ${opts.courseTitle}, ${name}.

${textPractitioner}Open the course: ${opts.courseUrl}

— 4 Corners Village`;

  const bodyHtml = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#34d399;">You're enrolled, ${name}.</h1>
    <p style="margin:0 0 8px;font-size:18px;color:#fbbf24;font-weight:500;">${title}</p>
    ${lineFromPractitioner}
    <p style="margin:0 0 24px;">All modules and lessons are unlocked for you. Take it at your pace.</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td>
        <a href="${opts.courseUrl}" style="display:inline-block;padding:10px 18px;background:#34d399;color:#0f172a;text-decoration:none;border-radius:8px;font-weight:600;">Open course</a>
      </td></tr>
    </table>
  `;

  return {
    html: emailShell({ previewText: `You're enrolled in ${opts.courseTitle}.`, bodyHtml }),
    text,
  };
}
