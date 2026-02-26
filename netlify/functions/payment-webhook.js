import crypto from 'node:crypto';
import { sendTelegram, sendPaymentTelegram } from './_telegram.js';
import {
  airtableRecordToOrder,
  findOrderByInvoiceId,
  findOrderByOrderId,
  findOrderByPaymentId,
  serializePaymentPayload,
  updateOrderRecord
} from './_airtable.js';

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || '';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

function verifyLegacySignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET) return true;
  if (!signatureHeader) return false;
  try {
    const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
    return signatureHeader === expected;
  } catch (err) {
    return false;
  }
}

function verifyNowPaymentsSignature(rawBody, signatureHeader) {
  if (!NOWPAYMENTS_IPN_SECRET) return true;
  if (!signatureHeader) return false;
  try {
    const expected = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
      .update(rawBody)
      .digest('hex');
    return expected === signatureHeader;
  } catch (err) {
    console.warn('[payment-webhook] failed to verify NOWPayments signature', err);
    return false;
  }
}

function normalizePayload(payload) {
  if (!payload) return null;
  if (payload.invoiceId || payload.status) {
    return { type: 'legacy', payload };
  }
  if (payload.payment_id || payload.order_id) {
    return { type: 'nowpayments', payload };
  }
  return null;
}

async function findOrderContext({ orderId, invoiceId, paymentId }) {
  let record = null;
  if (orderId) record = await findOrderByOrderId(orderId).catch(() => null);
  if (!record && invoiceId) record = await findOrderByInvoiceId(invoiceId).catch(() => null);
  if (!record && paymentId) record = await findOrderByPaymentId(paymentId).catch(() => null);
  return record ? { record, order: airtableRecordToOrder(record) } : null;
}

async function handleLegacy(payload) {
  const { invoiceId, orderId, status } = payload;
  const context = await findOrderContext({ orderId, invoiceId, paymentId: null });
  if (!context) {
    console.warn('[payment-webhook] order not found (legacy)');
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }

  const { record, order } = context;
  if (order.status === 'paid') {
    return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Already paid' }) };
  }

  const success = String(status || '').toLowerCase();
  if (success === 'paid' || success === 'confirmed') {
    const now = new Date().toISOString();
    await updateOrderRecord(record.id, { status: 'paid', paidAt: now, updatedAt: now });

    const text = `✅ Order <b>${order.orderId}</b>\nStatus: 已付款\nProduct: ${order.productName}\nAmount: £${order.priceGbp}`;
    sendTelegram(text).catch(() => {});
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, status: 'ignored' }) };
}

async function handleNowPayments(payload) {
  const context = await findOrderContext({
    orderId: payload.order_id,
    invoiceId: payload.invoice_id,
    paymentId: payload.payment_id
  });

  if (!context) {
    console.warn('[payment-webhook] order not found for NOWPayments');
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }

  const { record, order } = context;
  const payment = {
    ...(order.payment || {}),
    provider: 'nowpayments',
    paymentId: payload.payment_id || order.payment?.paymentId || '',
    invoiceId: payload.invoice_id || order.payment?.invoiceId || '',
    payCurrency: payload.pay_currency,
    payAmount: payload.pay_amount,
    actuallyPaid: payload.actually_paid,
    txId:
      String(payload.payment_status || '').toLowerCase() === 'finished'
        ? payload.txid || payload.transaction_hash || order.payment?.txId
        : order.payment?.txId,
    status: payload.payment_status,
    updatedAt: new Date().toISOString()
  };

  const successStatuses = new Set(['finished', 'confirmed', 'paid', 'completed']);
  const updates = {
    paymentPayload: serializePaymentPayload(payment),
    paymentInvoiceId: payment.invoiceId || '',
    paymentPaymentId: payment.paymentId || '',
    paymentNetwork: payload.pay_currency || order.payment?.network || '',
    updatedAt: new Date().toISOString()
  };

  if (successStatuses.has(String(payload.payment_status || '').toLowerCase())) {
    updates.status = 'paid';
    updates.paidAt = new Date().toISOString();
  }

  await updateOrderRecord(record.id, updates);

  if (updates.status === 'paid') {
    const text = `✅ Order <b>${order.orderId}</b>\nStatus: 已付款\nProduct: ${order.productName}\nAmount: £${order.priceGbp}\nPay: ${payload.pay_amount} ${payload.pay_currency}`;
    sendTelegram(text).catch(() => {});
    const fullInfo = `${text}\nEmail: ${order.customerEmail || 'N/A'}\nPhone: ${order.customerPhone || 'N/A'}`;
    sendPaymentTelegram(fullInfo).catch(() => {});
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const raw = event.body || '';
  const signatureLegacy =
    (event.headers && (event.headers['x-signature'] || event.headers['X-Signature'])) || null;
  const signatureNowPayments =
    (event.headers && (event.headers['x-nowpayments-sig'] || event.headers['X-Nowpayments-Sig'])) || null;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (err) {
    console.warn('[payment-webhook] invalid json');
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const normalized = normalizePayload(payload);
  if (!normalized) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported payload' }) };
  }

  if (normalized.type === 'legacy') {
    if (!verifyLegacySignature(raw, signatureLegacy)) {
      console.warn('[payment-webhook] invalid legacy signature');
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
    return handleLegacy(normalized.payload);
  }

  if (normalized.type === 'nowpayments') {
    if (!verifyNowPaymentsSignature(raw, signatureNowPayments)) {
      console.warn('[payment-webhook] invalid NOWPayments signature');
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
    return handleNowPayments(normalized.payload);
  }

  return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported payload' }) };
}
