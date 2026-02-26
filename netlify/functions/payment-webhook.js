import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { sendTelegram, sendPaymentTelegram } from './_telegram.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_DIR = path.resolve(__dirname, '../../data/orders');
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || '';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

function verifyLegacySignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET) return true; // no secret configured, skip verification
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
    const expected = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET).update(rawBody).digest('hex');
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

async function loadOrder(orderId) {
  if (!orderId) return null;
  const filePath = path.join(ORDERS_DIR, `${orderId}.json`);
  const raw = await readFile(filePath, 'utf8');
  return { filePath, order: JSON.parse(raw) };
}

async function findOrderByInvoiceId(invoiceId) {
  if (!invoiceId) return null;
  const fs = await import('node:fs');
  const files = fs.readdirSync(ORDERS_DIR).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const p = path.join(ORDERS_DIR, f);
    try {
      const rawFile = await readFile(p, 'utf8');
      const o = JSON.parse(rawFile);
      if (o.payment && (o.payment.invoiceId === invoiceId || o.payment.paymentId === invoiceId)) {
        return { filePath: p, order: o };
      }
    } catch (err) {
      // ignore bad files
    }
  }
  return null;
}

async function handleLegacy(payload) {
  const { invoiceId, orderId, status } = payload;
  let context = null;

  if (orderId) context = await loadOrder(orderId).catch(() => null);
  if (!context && invoiceId) context = await findOrderByInvoiceId(invoiceId);
  if (!context) {
    console.warn('[payment-webhook] order not found (legacy)');
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }

  const { filePath, order } = context;

  if (order.status === 'paid') {
    return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'Already paid' }) };
  }

  if (String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'confirmed') {
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    await writeFile(filePath, JSON.stringify(order, null, 2), 'utf8');

    const text = `✅ Order <b>${order.orderId}</b>\nStatus: 已付款\nProduct: ${order.productName}\nAmount: £${order.priceGbp}`;
    sendTelegram(text).catch(() => {});

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, status: 'ignored' }) };
}

async function handleNowPayments(payload) {
  const orderId = payload.order_id;
  let context = null;

  if (orderId) context = await loadOrder(orderId).catch(() => null);
  if (!context && payload.invoice_id) context = await findOrderByInvoiceId(payload.invoice_id);
  if (!context && payload.payment_id) context = await findOrderByInvoiceId(payload.payment_id);
  if (!context) {
    console.warn('[payment-webhook] order not found for NOWPayments');
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }

  const { filePath, order } = context;
  order.payment = {
    ...(order.payment || {}),
    provider: 'nowpayments',
    paymentId: payload.payment_id,
    invoiceId: payload.invoice_id || order.payment?.invoiceId,
    payCurrency: payload.pay_currency,
    payAmount: payload.pay_amount,
    actuallyPaid: payload.actually_paid,
    txId: payload.payment_status === 'finished' ? payload.txid || payload.transaction_hash : order.payment?.txId,
    status: payload.payment_status,
    updatedAt: new Date().toISOString()
  };

  const successStatuses = new Set(['finished', 'confirmed', 'paid', 'completed']);

  if (successStatuses.has(String(payload.payment_status || '').toLowerCase())) {
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
  }

  await writeFile(filePath, JSON.stringify(order, null, 2), 'utf8');

  if (order.status === 'paid') {
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
