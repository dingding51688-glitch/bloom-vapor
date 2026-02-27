import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const orderId = payload?.orderId ? String(payload.orderId).trim() : '';
  const code = payload?.code ? String(payload.code).trim() : '';
  if (!orderId || !code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId or code' }) };
  }

  try {
    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }
    const order = airtableRecordToOrder(record);

    if (order.otpVerifiedAt) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, alreadyVerified: true })
      };
    }

    if (!order.otpCode) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No OTP issued for this order' }) };
    }

    if (order.otpExpiresAt && new Date(order.otpExpiresAt).getTime() < Date.now()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Code expired' }) };
    }

    if (String(order.otpCode).trim() !== code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code' }) };
    }

    const verifiedAt = new Date().toISOString();
    await updateOrderRecord(record.id, {
      otpCode: '',
      otpExpiresAt: null,
      otpVerifiedAt: verifiedAt,
      updatedAt: verifiedAt
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, verifiedAt })
    };
  } catch (err) {
    console.error('[verify-otp] error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Could not verify code' })
    };
  }
}
