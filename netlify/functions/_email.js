import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM =
  process.env.SENDGRID_FROM || `no-reply@${process.env.SITE_HOST || 'example.com'}`;

const EMAIL_DIR = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(EMAIL_DIR, '../../data/email-templates');

async function ensureFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis);
  const mod = await import('node-fetch');
  return mod.default || mod;
}

async function loadTemplate(templateName) {
  const filePath = path.join(TEMPLATE_DIR, templateName);
  return readFile(filePath, 'utf8');
}

function renderTemplate(raw = '', vars = {}) {
  return raw.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
    const value = vars[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

export async function sendTemplatedEmail({ to, subject, template, vars = {} }) {
  if (!SENDGRID_API_KEY || !to) {
    console.warn('[email] missing sendgrid config or recipient');
    return false;
  }

  try {
    const fetchFn = await ensureFetch();
    const rawTemplate = await loadTemplate(template);
    const html = renderTemplate(rawTemplate, vars);
    const res = await fetchFn('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_FROM, name: vars.fromName || 'Green Hub' },
        subject,
        content: [{ type: 'text/html', value: html }]
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => 'Unable to read response');
      console.warn('[email] sendgrid request failed', res.status, txt);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] send error', err);
    return false;
  }
}
