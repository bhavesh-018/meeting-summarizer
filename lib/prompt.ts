export function buildPrompt(input: { instruction: string; transcript: string }) {
  const { instruction, transcript } = input;
  return [
    'You are an assistant that creates concise, structured meeting summaries.',
    'Requirements:',
    '- Use clear section headers.',
    '- Use bullet points where useful.',
    '- Extract action items, owners, and deadlines if stated.',
    '- Be faithful to the transcript; do not invent content.',
    '',
    `User instruction: ${instruction}`,
    '',
    'Transcript:',
    transcript,
  ].join('\n');
}
