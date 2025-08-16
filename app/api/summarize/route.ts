import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { buildPrompt } from '@/lib/prompt';
import { validateSummarizeBody } from '@/lib/validators';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, instruction } = validateSummarizeBody(body);

    const prompt = buildPrompt({ instruction, transcript });

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      temperature: 0.2,
    });

    return NextResponse.json({ summary: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Summarization failed';
    return new NextResponse(JSON.stringify({ error: message }), { status: 502 });
  }
}