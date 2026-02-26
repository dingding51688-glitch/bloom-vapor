import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';
import { sendTemplatedEmail } from './_email.js';

const FALLBACK_SITE_URL = 'https://marvelous-pothos-05456a.netlify.app';
const SITE_URL = (process.env.SITE_URL || process.env.URL || FALLBACK_SITE_URL).replace(/\/$/, '');
const LOGO_URL = (process.env.EMAIL_LOGO_URL || `${SITE_URL}/uploads/logo.png`).replace(/\/$/, '');

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
      emailSent = await sendTemplatedEmail({
        to: order.customerEmail,
        subject: `Your Green Hub order ${orderId} is ready for pickup`,
        template: 'order-ready-for-collection.html',
        vars: {
          customerName: order.customerName || 'Customer',
          orderId,
          pickupWindow: order.pickupOption || 'Standard (3-5 days)',
          trackingNumber: order.trackingNumber || 'Not provided',
          collectionCode: order.password || 'Provided at pickup',
          hubAddress: [order.hubName, order.hubPostcode].filter(Boolean).join(' · '),
          hubName: order.hubName || 'Green Hub Locker',
          logoUrl: LOGO_URL,
          year: new Date().getFullYear()
        }
      });
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
