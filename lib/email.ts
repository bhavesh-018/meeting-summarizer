import nodemailer from 'nodemailer';

export async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration missing');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for 587/25/2525
    auth: { user, pass },
  });

  // Optional: verify connection configuration
  // await transporter.verify();

  return transporter;
}
