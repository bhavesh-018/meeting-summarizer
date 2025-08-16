'use client';

import React, { useState } from 'react';

type SummarizeResponse = { summary: string };
type SendEmailResponse = { ok: boolean; messageId?: string; error?: string };

export default function HomePage() {
  const [transcript, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('Summarize in bullet points for executives.');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const [to, setTo] = useState(''); // comma-separated
  const [subject, setSubject] = useState('Meeting Summary');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setEmailResult(null);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, instruction }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Summarization failed');
      }
      const data: SummarizeResponse = await res.json();
      setSummary(data.summary);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? 'Unknown error');
      alert(msg);
    }finally {
      setLoading(false);
    }
  };

  const onSendEmail = async () => {
    setEmailSending(true);
    setEmailResult(null);
    try {
      const recipients = to.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipients, subject, body: summary }),
      });
      const data: SendEmailResponse = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      setEmailResult('Email sent successfully.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? 'Error sending email');
      alert(msg);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '24px auto', padding: '0 12px' }}>
      <h1>AI Meeting Summarizer & Sharer</h1>

      <section style={{ marginTop: 16 }}>
        <label>Transcript</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript text here..."
          rows={12}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <label>Custom Instruction</label>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Summarize in bullet points for executives"
          style={{ width: '100%' }}
        />
      </section>

      <button onClick={onGenerate} disabled={loading || !transcript} style={{ marginTop: 12 }}>
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>

      <section style={{ marginTop: 24 }}>
        <label>Editable Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Generated summary will appear here..."
          rows={12}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <label>Recipients (comma-separated)</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="[email protected], [email protected]"
          style={{ width: '100%' }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <label>Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Meeting Summary"
          style={{ width: '100%' }}
        />
      </section>

      <button onClick={onSendEmail} disabled={emailSending || !summary || !to} style={{ marginTop: 12 }}>
        {emailSending ? 'Sending...' : 'Send Email'}
      </button>

      {emailResult && <p style={{ marginTop: 12 }}>{emailResult}</p>}
    </main>
  );
}
