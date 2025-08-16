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

  const transcript = body.transcript.trim();
  const instruction = (body.instruction ?? 'Summarize the transcript.').trim();

  if (transcript.length === 0) throw new Error('transcript is required');
  if (instruction.length === 0) throw new Error('instruction must be a non-empty string');
  if (transcript.length > 200_000) throw new Error('transcript too large');

  return { transcript, instruction };
}
