import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';
import { sendTemplatedEmail } from './_email.js';

const OTP_EXPIRY_MINUTES = 10;

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskEmail(email = '') {
  if (!email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (!user) return `***@${domain}`;
  const prefix = user.slice(0, 2);
  return `${prefix}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`;
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
  if (!orderId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId' }) };
  }

  try {
    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }
    const order = airtableRecordToOrder(record);
    const email = (payload?.email || order.customerEmail || '').trim();
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email required for verification' }) };
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    await updateOrderRecord(record.id, {
      otpCode,
      otpExpiresAt: expiresAt,
      otpVerifiedAt: null,
      updatedAt: new Date().toISOString()
    });

    const emailSent = await sendTemplatedEmail({
      to: email,
      subject: `Your Green Hub verification code (${orderId})`,
      template: 'order-otp-code.html',
      vars: {
        customerName: order.customerName || 'there',
        orderId,
        otpCode,
        expiresMinutes: OTP_EXPIRY_MINUTES,
        year: new Date().getFullYear()
      }
    });
    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, expiresAt, email: maskEmail(email) })
    };
  } catch (err) {
    console.error('[request-otp] error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Could not send OTP' })
    };
  }
}
