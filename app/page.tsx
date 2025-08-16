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
    } finally {
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
    <main style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.logoDot} />
          <h1 style={styles.title}>AI Meeting Summarizer & Sharer</h1>
        </div>
        <div style={styles.headerRight}>
          {emailResult && <span style={styles.statusBadge}>{emailResult}</span>}
        </div>
      </header>

      {/* Controls Bar */}
      <section style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>Instruction</label>
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g., Summarize in bullet points for executives"
            style={styles.input}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button
            onClick={onGenerate}
            disabled={loading || !transcript}
            style={{
              ...styles.buttonPrimary,
              ...(loading || !transcript ? styles.buttonDisabled : {}),
            }}
            title={!transcript ? 'Paste a transcript to enable' : 'Generate summary'}
          >
            {loading ? 'Generating…' : 'Generate Summary'}
          </button>
        </div>
      </section>

      {/* Split Pane */}
      <section style={styles.splitWrap}>
        {/* Left: Transcript */}
        <div style={styles.pane}>
          <div style={styles.paneHeader}>
            <h2 style={styles.paneTitle}>Transcript</h2>
            <small style={styles.paneHint}>
              Paste or type the meeting transcript here
            </small>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste meeting transcript text here..."
            style={styles.textarea}
          />
        </div>

        {/* Right: Summary */}
        <div style={styles.pane}>
          <div style={styles.paneHeader}>
            <h2 style={styles.paneTitle}>Summary (Editable)</h2>
            <small style={styles.paneHint}>
              Edit before sharing
            </small>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Generated summary will appear here..."
            style={styles.textarea}
          />
        </div>
      </section>

      {/* Email Bar */}
      <section style={styles.emailBar}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <label style={styles.label}>Recipients (comma-separated)</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Enter Receipients email address"
            style={styles.input}
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={styles.label}>Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Meeting Summary"
            style={styles.input}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={onSendEmail}
            disabled={emailSending || !summary || !to}
            style={{
              ...styles.buttonSuccess,
              ...(emailSending || !summary || !to ? styles.buttonDisabled : {}),
              minWidth: 140,
            }}
            title={
              !summary
                ? 'Generate or type a summary to enable'
                : !to
                ? 'Enter at least one recipient'
                : 'Send email'
            }
          >
            {emailSending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </section>
    </main>
  );
}

/* Inline Styles */
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '20px 16px 32px',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    color: '#e5e7eb', // lighter global text for dark backgrounds
    backgroundColor: '#0b1220', // subtle dark background to improve contrast
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
    boxShadow: '0 0 10px rgba(99,102,241,0.6)',
  },
  title: {
    fontSize: 18,
    margin: 0,
    fontWeight: 700,
    letterSpacing: 0.2,
    color: '#f8fafc', // bright title
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8 },
  statusBadge: {
    background: '#064e3b',
    color: '#a7f3d0',
    border: '1px solid #10b981',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 12,
  },
  controls: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  controlGroup: { flex: 1, minWidth: 240 },
  label: {
    display: 'block',
    fontSize: 12,
    color: '#cbd5e1', // lighter label for visibility
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #334155',
    outline: 'none',
    fontSize: 14,
    background: '#0f172a', // dark input background
    color: '#e5e7eb',      // bright input text so you can see while typing
    // Improve placeholder visibility:
    // Note: inline styles can't set ::placeholder; we simulate by using a lighter default color
    // If you want even lighter placeholders, switch to a CSS class. For now, this is readable.
  },
  splitWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  pane: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0b1220', // match container background
    border: '1px solid #334155',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 360,
  },
  paneHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#0f172a',     // darker header strip
    borderBottom: '1px solid #334155',
  },
  paneTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: '#f1f5f9', // light title for better visibility
  },
  paneHint: { color: '#94a3b8', fontSize: 12 }, // lighter hint
  textarea: {
    width: '100%',
    height: '100%',
    minHeight: 300,
    resize: 'vertical',
    border: 'none',
    outline: 'none',
    padding: '12px 14px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 14,
    lineHeight: 1.5,
    background: '#0b1220',
    color: '#e5e7eb',        // bright text in editors
    // To simulate visible caret/selection on dark:
    caretColor: '#22d3ee',
  },
  emailBar: {
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: '2fr 1fr auto',
    gap: 12,
    alignItems: 'end',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(79,70,229,0.25)',
    transition: 'transform 0.05s ease, filter 0.15s ease',
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #10b981, #34d399)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(16,185,129,0.25)',
    transition: 'transform 0.05s ease, filter 0.15s ease',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    filter: 'grayscale(10%)',
  },
};
