import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '@/lib/email';
import { validateEmailBody } from '@/lib/validators';
import { renderSummaryHtml } from '@/lib/emailTemplate';

export const runtime = 'nodejs';

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, body: emailBody } = validateEmailBody(body);

    const transporter = await createTransporter();

    // Build professional HTML from the plain summary
    const html = renderSummaryHtml(emailBody, subject);
    const text = stripHtml(emailBody);

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: to.join(','),
      subject,
      text,
      html,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Email failed';
    return new NextResponse(JSON.stringify({ ok: false, error: message }), { status: 502 });
  }
}
