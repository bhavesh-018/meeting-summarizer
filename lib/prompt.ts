export function buildPrompt(input: { instruction: string; transcript: string }) {
  const { instruction, transcript } = input;
  return [
    'You are an assistant that creates concise, structured meeting summaries.',
    'Strict formatting:',
    '- Use markdown-style headings: ## Title, ### Section.',
    '- Use bullet points (*) for lists; each item on its own line.',
    '- Include sections when present: Overview, Key Points, Decisions, Action Items (Owner, Due), Risks.',
    '- Be faithful to the transcript; do not invent content.',
    '',
    `User instruction: ${instruction}`,
    '',
    'Transcript:',
    transcript,
  ].join('\n');
}
