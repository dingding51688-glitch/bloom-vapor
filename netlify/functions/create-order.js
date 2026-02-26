import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { sendTelegram } from './_telegram.js';

const ORDERS_DIR = path.resolve(__dirname, '../../data/orders');

function sanitizeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function generateOrderId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${suffix}`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const required = ['productId', 'productName', 'priceGbp', 'hubId', 'hubName', 'customerName', 'customerPhone'];
  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || String(payload[key]).trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: `Missing field: ${key}` }) };
    }
  }

  const orderId = generateOrderId();
  const now = new Date().toISOString();

  function parsePrice(value) {
    if (value === null || value === undefined) return 0;
    const raw = String(value).replace(/[^0-9.]/g, '');
    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  }

  const order = {
    orderId,
    createdAt: now,
    status: 'pending',
    productId: sanitizeString(payload.productId),
    productName: sanitizeString(payload.productName),
    basePriceGbp: parsePrice(payload.basePriceGbp),
    pickupOption: sanitizeString(payload.pickupOption || ''),
    pickupSurchargeGbp: parsePrice(payload.pickupSurcharge),
    priceGbp: parsePrice(payload.priceGbp),
    hubId: sanitizeString(payload.hubId),
    hubName: sanitizeString(payload.hubName),
    hubPostcode: sanitizeString(payload.hubPostcode || ''),
    customerName: sanitizeString(payload.customerName),
    customerPhone: sanitizeString(payload.customerPhone),
    customerEmail: sanitizeString(payload.customerEmail || ''),
    notes: sanitizeString(payload.notes || ''),
    payment: null
  };

  try {
    await mkdir(ORDERS_DIR, { recursive: true });
    const filePath = path.join(ORDERS_DIR, `${orderId}.json`);

    let bankDetails = null;
    try {
      const bankPath = path.resolve(__dirname, '../../data/bank.json');
      const bankRaw = await readFile(bankPath, 'utf8');
      bankDetails = JSON.parse(bankRaw);
    } catch (err) {
      console.warn('[create-order] bank details not found', err.message);
    }
    if (bankDetails) {
      order.bankDetails = bankDetails;
    }

    await writeFile(filePath, JSON.stringify(order, null, 2), 'utf8');

    // send telegram (await result so caller can see status)
    const statusLabel = order.status === 'paid' ? '已付款' : '等待付款';
    const emailLine = order.customerEmail ? `\nEmail: ${order.customerEmail}` : '';
    const pickupLine = order.pickupOption ? `\nPickup: ${order.pickupOption}${order.pickupSurchargeGbp ? ` (surcharge £${order.pickupSurchargeGbp})` : ''}` : '';
    const text = `🆕 New order <b>${orderId}</b>\nStatus: ${statusLabel}\nProduct: ${order.productName}\nBase price: £${order.basePriceGbp || order.priceGbp}\nTotal: £${order.priceGbp}${pickupLine}\nHub: ${order.hubName} ${order.hubPostcode || ''}\nName: ${order.customerName}\nPhone: ${order.customerPhone}${emailLine}`;
    let telegramSent = false;
    try {
      telegramSent = await sendTelegram(text);
      if (!telegramSent) console.warn('[create-order] telegram send returned false');
    } catch (err) {
      console.error('[create-order] telegram send error', err);
      telegramSent = false;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: 'pending', telegramSent })
    };
  } catch (err) {
    console.error('[create-order] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not create order' }) };
  }
}
