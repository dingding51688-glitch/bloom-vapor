import { airtableRecordToOrder, findOrderByOrderId, updateOrderRecord } from './_airtable.js';
import { sendTelegram, sendFastTelegram } from './_telegram.js';

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const params = event.queryStringParameters || {};
  const orderId = params.orderId ? String(params.orderId).trim() : '';
  const token = params.token ? String(params.token).trim() : '';
  if (!orderId || !token) {
    return jsonResponse(400, { error: 'Missing orderId or token' });
  }

  try {
    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return jsonResponse(404, { error: 'Order not found' });
    }
    const order = airtableRecordToOrder(record);

    if (order.otpVerifiedAt) {
      return jsonResponse(200, { ok: true, alreadyVerified: true, orderId });
    }

    if (!order.otpToken || order.otpToken !== token) {
      return jsonResponse(400, { error: 'Invalid or expired token' });
    }

    if (order.otpExpiresAt && new Date(order.otpExpiresAt).getTime() < Date.now()) {
      return jsonResponse(400, { error: 'Token expired' });
    }

    const verifiedAt = new Date().toISOString();
    await updateOrderRecord(record.id, {
      otpToken: '',
      otpExpiresAt: null,
      otpVerifiedAt: verifiedAt,
      updatedAt: verifiedAt
    });

    const pickupLine = order.pickupOption
      ? `\nPickup: ${order.pickupOption}${order.pickupSurchargeGbp ? ` (surcharge £${order.pickupSurchargeGbp})` : ''}`
      : '';
    const emailLine = order.customerEmail ? `\nEmail: ${order.customerEmail}` : '';
    const text = `✅ OTP verified for <b>${order.orderId}</b>\nStatus: Ready for payment\nProduct: ${order.productName}\nTotal: £${order.priceGbp}${pickupLine}\nHub: ${order.hubName} ${order.hubPostcode || ''}\nName: ${order.customerName}\nPhone: ${order.customerPhone}${emailLine}`;

    sendTelegram(text).catch((err) => console.error('[verify-otp-link] telegram error', err));
    const pickupLower = (order.pickupOption || '').toLowerCase();
    const isFastPickup = pickupLower.includes('same') || pickupLower.includes('next');
    if (isFastPickup) {
      sendFastTelegram(text).catch((err) => console.error('[verify-otp-link] fast telegram error', err));
    }

    return jsonResponse(200, { ok: true, verifiedAt, orderId });
  } catch (err) {
    console.error('[verify-otp-link] error', err);
    return jsonResponse(500, { error: err.message || 'Could not verify link' });
  }
}
