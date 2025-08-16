// lib/validators.ts

// --- Summarize ---
type SummarizeBody = {
  transcript: string;
  instruction?: string;
};

function isSummarizeBody(x: unknown): x is SummarizeBody {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  if (typeof o.transcript !== 'string') return false;
  if ('instruction' in o && o.instruction !== undefined && typeof o.instruction !== 'string') return false;
  return true;
}

export function validateSummarizeBody(body: unknown) {
  if (!isSummarizeBody(body)) throw new Error('Invalid body');
  const parsed: SummarizeBody = body;

  const transcript = parsed.transcript.trim();
  const instruction = (parsed.instruction ?? 'Summarize the transcript.').trim();

  if (transcript.length === 0) throw new Error('transcript is required');
  if (instruction.length === 0) throw new Error('instruction must be a non-empty string');
  if (transcript.length > 200_000) throw new Error('transcript too large');

  return { transcript, instruction };
}

// --- Email ---
type EmailBody = {
  to: string[];
  subject?: string;
  body: string;
};

function isEmailBody(x: unknown): x is EmailBody {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.to) || !o.to.every((v) => typeof v === 'string')) return false;
  if ('subject' in o && o.subject !== undefined && typeof o.subject !== 'string') return false;
  if (typeof o.body !== 'string') return false;
  return true;
}

export function validateEmailBody(body: unknown) {
  if (!isEmailBody(body)) throw new Error('Invalid body');
  const parsed: EmailBody = body;

  const to = parsed.to.map((s) => s.trim()).filter(Boolean);
  if (to.length === 0) throw new Error('at least one recipient is required');
  if (to.length > 10) throw new Error('too many recipients');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to.every((e) => emailRe.test(e))) throw new Error('invalid recipient email(s)');

  const subject = (parsed.subject ?? 'Meeting Summary').trim();
  const emailBody = parsed.body.trim();
  if (!emailBody) throw new Error('body must be non-empty');

  return { to, subject, body: emailBody };
}
