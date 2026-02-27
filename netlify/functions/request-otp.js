import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';
import { sendOtpSms } from './_twilio.js';

function normalizePhone(phone) {
  if (!phone) return '';
  let value = String(phone).trim();
  if (!value) return '';
  if (value.startsWith('+')) return value;
  let digits = value.replace(/[^0-9+]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('0')) {
    return `+44${digits.slice(1)}`;
  }
  return `+${digits}`;
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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
  const phoneOverride = payload?.phone ? String(payload.phone).trim() : '';
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId' }) };
  }

  try {
    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }
    const order = airtableRecordToOrder(record);
    const phone = normalizePhone(phoneOverride || order.customerPhone);
    if (!phone) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Phone number required for OTP' }) };
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await updateOrderRecord(record.id, {
      otpCode,
      otpExpiresAt: expiresAt,
      otpVerifiedAt: null,
      updatedAt: new Date().toISOString()
    });

    const maskedPhone = `${phone.slice(0, 4)}****${phone.slice(-2)}`;
    await sendOtpSms({
      to: phone,
      body: `Your Green Hub verification code is ${otpCode}. It expires in 10 minutes.`
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, expiresAt, phone: maskedPhone })
    };
  } catch (err) {
    console.error('[request-otp] error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Could not send OTP' })
    };
  }
}
