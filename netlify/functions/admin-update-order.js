import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';
async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis);
  try { const mod = await import('node-fetch'); return mod.default || mod; } catch (e) { console.warn('[admin-update-order] node-fetch not available'); return null; }
}

async function sendEmailViaSendGrid(to, subject, html) {
  const key = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM || `no-reply@${process.env.SITE_HOST || 'example.com'}`;
  if (!key) {
    console.warn('[admin-update-order] SENDGRID_API_KEY not configured');
    return false;
  }
  try {
    const fetchFn = await getFetch();
    if (!fetchFn) { console.warn('[admin-update-order] no fetch available'); return false; }
    const res = await fetchFn('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: 'text/html', value: html }]
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn('[admin-update-order] sendgrid failed', res.status, txt);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[admin-update-order] sendgrid error', err);
    return false;
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { orderId, trackingNumber, password, sendEmail } = payload || {};
  if (!orderId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId' }) };

  try {
    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (trackingNumber !== undefined) updates.trackingNumber = String(trackingNumber).trim();
    if (password !== undefined) updates.password = String(password).trim();

    await updateOrderRecord(record.id, updates);

    const order = airtableRecordToOrder({ id: record.id, fields: { ...record.fields, ...updates } });

    let emailSent = false;
    if (sendEmail && order.customerEmail) {
      const subject = `Your GreenHub order ${orderId}`;
      const html = `
        <p>Hi ${order.customerName || 'Customer'},</p>
        <p>Your order <strong>${orderId}</strong> has been updated.</p>
        <p><strong>Tracking number:</strong> ${order.trackingNumber || 'N/A'}</p>
        <p><strong>Password / collection code:</strong> ${order.password || 'N/A'}</p>
        <p>Please retain this information for collection.</p>
        <p>Thanks — GreenHub</p>
      `;
      emailSent = await sendEmailViaSendGrid(order.customerEmail, subject, html);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, orderId, emailSent })
    };
  } catch (err) {
    console.error('[admin-update-order] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not update order' }) };
  }
}
