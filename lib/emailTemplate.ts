// lib/emailTemplate.ts

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Very small markdown-ish formatter:
// - Lines starting with "## " => h2
// - Lines starting with "### " => h3
// - Lines starting with "* " => bullet item
// - Blank lines => paragraph breaks
export function renderSummaryHtml(summary: string, title = 'Meeting Summary') {
  const lines = summary.split(/\r?\n/);

  const blocks: string[] = [];
  let ulOpen = false;

  const flushUl = () => {
    if (ulOpen) {
      blocks.push('</ul>');
      ulOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushUl();
      blocks.push('<div style="height:10px"></div>');
      continue;
    }

    if (line.startsWith('### ')) {
      flushUl();
      const text = escapeHtml(line.replace(/^###\s+/, ''));
      blocks.push(`<h3 style="margin:16px 0 8px;font-size:14px;color:#0f172a">${text}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushUl();
      const text = escapeHtml(line.replace(/^##\s+/, ''));
      blocks.push(`<h2 style="margin:18px 0 10px;font-size:16px;color:#0f172a">${text}</h2>`);
      continue;
    }

    if (line.startsWith('* ')) {
      const text = escapeHtml(line.replace(/^\*\s+/, ''));
      if (!ulOpen) {
        blocks.push('<ul style="margin:6px 0 6px 20px;padding:0;color:#111827">');
        ulOpen = true;
      }
      blocks.push(`<li style="margin:4px 0;line-height:1.5">${text}</li>`);
      continue;
    }

    // default paragraph
    flushUl();
    blocks.push(
      `<p style="margin:8px 0;line-height:1.6;color:#111827">${escapeHtml(line)}</p>`
    );
  }
  flushUl();

  // Email wrapper table (safe for most clients)
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6;padding:24px 0">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <tr>
              <td style="padding:16px 20px;background:#0f172a">
                <h1 style="margin:0;font-size:18px;color:#f8fafc">Meeting Summary</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px">
                ${blocks.join('\n')}
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;background:#f8fafc;color:#475569;font-size:12px">
                Sent from AI Meeting Summarizer
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}