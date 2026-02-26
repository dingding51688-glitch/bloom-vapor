import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { sendTelegram } from './_telegram.js';

const ORDERS_DIR = path.resolve(__dirname, '../../data/orders');
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';

async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis);
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (err) {
    console.warn('[create-payment] fetch not available');
    return null;
  }
}

function resolveBaseUrl(event) {
  return (
    process.env.SITE_URL ||
    process.env.URL ||
    (event && event.headers && (event.headers.origin || event.headers.referer)) ||
    ''
  ).replace(/\/$/, '');
}

function getPayCurrency(network) {
  return network === 'TRC20' ? 'USDTTRC20' : 'USDTERC20';
}

async function createNowPaymentsInvoice(order, network, baseUrl) {
  if (!NOWPAYMENTS_API_KEY) throw new Error('NOWPayments API key missing');
  const fetchFn = await getFetch();
  if (!fetchFn) throw new Error('fetch unavailable');

  const payload = {
    price_amount: Number(order.priceGbp),
    price_currency: 'GBP',
    pay_currency: getPayCurrency(network),
    order_id: order.orderId,
    ipn_callback_url:
      process.env.NOWPAYMENTS_IPN_URL || `${baseUrl}/.netlify/functions/payment-webhook`,
    success_url: `${baseUrl}/payment-success.html?orderId=${order.orderId}`,
    cancel_url: `${baseUrl}/payment.html?orderId=${order.orderId}`,
    is_fee_paid_by_user: true
  };

  const res = await fetchFn('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': NOWPAYMENTS_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data || !data.id || !data.invoice_url) {
    throw new Error(
      data?.message || data?.error || data?.errors?.[0] || 'NOWPayments invoice creation failed'
    );
  }
  return data;
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

  const { orderId, network } = payload;
  if (!orderId || !network) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId or network' }) };
  }
  if (!['ERC20', 'TRC20'].includes(network)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported network' }) };
  }

  try {
    const filePath = path.join(ORDERS_DIR, `${orderId}.json`);
    const raw = await readFile(filePath, 'utf8');
    const order = JSON.parse(raw);

    if (!order || !order.orderId) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }
    if (order.status === 'paid') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Order already paid' }) };
    }
    if (!order.priceGbp || Number(order.priceGbp) <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Order amount invalid' }) };
    }

    const baseUrl = resolveBaseUrl(event);
    const invoice = await createNowPaymentsInvoice(order, network, baseUrl);

    order.payment = {
      provider: 'nowpayments',
      network,
      invoiceId: invoice.id,
      invoiceTokenId: invoice.token_id,
      invoiceUrl: invoice.invoice_url,
      payCurrency: invoice.pay_currency,
      priceAmount: Number(invoice.price_amount),
      priceCurrency: invoice.price_currency,
      status: 'invoice_created',
      createdAt: new Date().toISOString(),
      successUrl: invoice.success_url,
      cancelUrl: invoice.cancel_url
    };

    if (order.bankDetails) {
      order.bankDetails = {
        accountName: order.bankDetails.accountName,
        sortCode: order.bankDetails.sortCode,
        accountNumber: order.bankDetails.accountNumber
      };
    }

    await writeFile(filePath, JSON.stringify(order, null, 2), 'utf8');

    const pickupInfo = order.pickupOption ? `\nPickup: ${order.pickupOption}${order.pickupSurchargeGbp ? ` (surcharge £${order.pickupSurchargeGbp})` : ''}` : '';
    const text = `💳 Invoice created for <b>${orderId}</b>\nNetwork: ${network}\nAmount: £${order.priceGbp}${pickupInfo}\nLink: ${invoice.invoice_url}`;
    sendTelegram(text).catch(() => {});

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice.id,
        payUrl: invoice.invoice_url,
        priceAmount: Number(invoice.price_amount),
        priceCurrency: invoice.price_currency,
        payCurrency: invoice.pay_currency
      })
    };
  } catch (err) {
    console.error('[create-payment] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Could not create payment' }) };
  }
}
