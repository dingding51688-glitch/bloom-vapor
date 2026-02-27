import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOrderRecord, serializePaymentPayload } from './_airtable.js';
import { sendTemplatedEmail } from './_email.js';
import { sendTelegram, sendFastTelegram } from './_telegram.js';

const CURRENT_DIR = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));
const BANK_PATH = path.resolve(CURRENT_DIR, '../../data/bank.json');
const FALLBACK_SITE_URL = 'https://marvelous-pothos-05456a.netlify.app';
const OTP_EXPIRY_MINUTES = 10;

function resolveSiteUrl(event) {
  const envUrl = process.env.SITE_URL || process.env.URL;
  const headerUrl = event?.headers?.origin || event?.headers?.referer;
  const url = envUrl || headerUrl || FALLBACK_SITE_URL;
  return url.replace(/\/$/, '');
}

function resolveLogoUrl(siteUrl) {
  return (process.env.EMAIL_LOGO_URL || `${siteUrl}/uploads/logo.png`).replace(/\/$/, '');
}

function sanitizeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function parsePrice(value) {
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateOrderId() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${suffix}`;
}

async function getBankDetails() {
  try {
    const raw = await readFile(BANK_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
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

  const required = ['productId', 'productName', 'priceGbp', 'hubId', 'hubName', 'customerName', 'customerPhone', 'customerEmail'];
  for (const key of required) {
    const value = payload[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      return { statusCode: 400, body: JSON.stringify({ error: `Missing field: ${key}` }) };
    }
  }

  const orderId = generateOrderId();
  const now = new Date().toISOString();
  const basePrice = parsePrice(payload.basePriceGbp);
  const totalPrice = parsePrice(payload.priceGbp);
  const surcharge = parsePrice(payload.pickupSurcharge);
  const otpCode = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const order = {
    orderId,
    status: 'pending',
    productId: sanitizeString(payload.productId),
    productName: sanitizeString(payload.productName),
    basePriceGbp: basePrice,
    priceGbp: totalPrice,
    hubId: sanitizeString(payload.hubId),
    hubName: sanitizeString(payload.hubName),
    hubPostcode: sanitizeString(payload.hubPostcode || ''),
    customerName: sanitizeString(payload.customerName),
    customerPhone: sanitizeString(payload.customerPhone),
    customerEmail: sanitizeString(payload.customerEmail || ''),
    notes: sanitizeString(payload.notes || ''),
    pickupOption: sanitizeString(payload.pickupOption || ''),
    pickupSurchargeGbp: surcharge,
    trackingNumber: '',
    password: '',
    payment: null,
    otpCode,
    otpExpiresAt,
    otpVerifiedAt: null,
    createdAt: now,
    updatedAt: now
  };

  try {
    await createOrderRecord({
      ...order,
      paymentPayload: serializePaymentPayload(null),
      paymentInvoiceId: '',
      paymentPaymentId: ''
    });

    if (order.customerEmail) {
      await sendTemplatedEmail({
        to: order.customerEmail,
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
    }

    const bankDetails = await getBankDetails();

    const statusLabel = 'Awaiting email verification';
    const pickupLine = order.pickupOption
      ? `\nPickup: ${order.pickupOption}${order.pickupSurchargeGbp ? ` (surcharge £${order.pickupSurchargeGbp})` : ''}`
      : '';
    const emailLine = order.customerEmail ? `\nEmail: ${order.customerEmail}` : '';
    const telegramText = `🆕 New order <b>${orderId}</b>\nStatus: ${statusLabel}\nProduct: ${order.productName}\nTotal: £${order.priceGbp}${pickupLine}\nHub: ${order.hubName} ${order.hubPostcode || ''}\nName: ${order.customerName}\nPhone: ${order.customerPhone}${emailLine}`;
    let telegramSent = false;
    let fastTelegramSent = false;
    try {
      telegramSent = await sendTelegram(telegramText);
    } catch (err) {
      console.error('[create-order] telegram send error', err);
    }
    const pickupLower = (order.pickupOption || '').toLowerCase();
    const isFastPickup = pickupLower.includes('same') || pickupLower.includes('next');
    if (isFastPickup) {
      try {
        fastTelegramSent = await sendFastTelegram(telegramText);
      } catch (err) {
        console.error('[create-order] fast telegram send error', err);
      }
    }

    const siteUrl = resolveSiteUrl(event);
    const logoUrl = resolveLogoUrl(siteUrl);
    const paymentUrl = `${siteUrl}/payment.html?orderId=${orderId}`;
    if (order.customerEmail) {
      await sendTemplatedEmail({
        to: order.customerEmail,
        subject: `Your Green Hub order ${orderId} is awaiting payment`,
        template: 'order-awaiting-payment.html',
        vars: {
          customerName: order.customerName || 'there',
          orderId,
          productName: order.productName,
          priceAmount: order.priceGbp,
          pickupOption: order.pickupOption || 'Standard (3-5 days)',
          paymentUrl,
          logoUrl,
          year: new Date().getFullYear()
        }
      });
    }

    const responseBody = { orderId, status: 'pending', telegramSent };
    if (bankDetails) responseBody.bankDetails = bankDetails;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseBody)
    };
  } catch (err) {
    console.error('[create-order] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not create order' }) };
  }
}
