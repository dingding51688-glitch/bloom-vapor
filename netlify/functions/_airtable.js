const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_ORDERS_TABLE = process.env.AIRTABLE_ORDERS_TABLE || 'ORDERS';

const BASE_URL = AIRTABLE_BASE_ID
  ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`
  : null;

let fetchPromise = null;
async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis);
  if (!fetchPromise) {
    fetchPromise = import('node-fetch').then((mod) => mod.default || mod);
  }
  return fetchPromise;
}

function ensureConfig() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  }
}

function encodeTable(tableName) {
  return encodeURIComponent(tableName);
}

function escapeFormulaValue(value = '') {
  return String(value).replace(/'/g, "\\'");
}

async function airtableRequest(method, tableName, { recordId, params, body } = {}) {
  ensureConfig();
  const fetchFn = await getFetch();
  let url = `${BASE_URL}/${encodeTable(tableName)}`;
  if (recordId) {
    url += `/${recordId}`;
  }
  if (params) {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => search.append(key, item));
      } else {
        search.append(key, value);
      }
    });
    const query = search.toString();
    if (query) url += `?${query}`;
  }
  const res = await fetchFn(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = payload?.error?.message || JSON.stringify(payload) || 'Airtable request failed';
    throw new Error(message);
  }
  return payload;
}

export async function createOrderRecord(fields) {
  const data = await airtableRequest('POST', AIRTABLE_ORDERS_TABLE, { body: { fields } });
  return data;
}

export async function updateOrderRecord(recordId, fields) {
  if (!recordId) throw new Error('Missing Airtable recordId');
  const data = await airtableRequest('PATCH', AIRTABLE_ORDERS_TABLE, {
    recordId,
    body: { fields }
  });
  return data;
}

export async function listOrderRecords({ pageSize = 50, offset, filterByFormula } = {}) {
  const params = {
    pageSize: Math.min(Math.max(Number(pageSize) || 1, 1), 100),
    offset,
    filterByFormula,
    'sort[0][field]': 'createdAt',
    'sort[0][direction]': 'desc'
  };
  const data = await airtableRequest('GET', AIRTABLE_ORDERS_TABLE, { params });
  const records = data.records || [];
  return {
    orders: records.map((record) => airtableRecordToOrder(record)),
    offset: data.offset || null
  };
}

async function findRecordByField(field, value) {
  if (!value) return null;
  const formula = `({${field}}='${escapeFormulaValue(value)}')`;
  const data = await airtableRequest('GET', AIRTABLE_ORDERS_TABLE, {
    params: { filterByFormula: formula, maxRecords: 1 }
  });
  return data.records?.[0] || null;
}

export async function findOrderByOrderId(orderId) {
  return findRecordByField('orderId', orderId);
}

export async function findOrderByInvoiceId(invoiceId) {
  return findRecordByField('paymentInvoiceId', invoiceId);
}

export async function findOrderByPaymentId(paymentId) {
  return findRecordByField('paymentPaymentId', paymentId);
}

export function airtableRecordToOrder(record) {
  if (!record) return null;
  const fields = record.fields || {};
  return {
    orderId: fields.orderId || '',
    status: fields.status || 'pending',
    productId: fields.productId || '',
    productName: fields.productName || '',
    basePriceGbp: fields.basePriceGbp ?? null,
    priceGbp: fields.priceGbp ?? null,
    hubId: fields.hubId || '',
    hubName: fields.hubName || '',
    hubPostcode: fields.hubPostcode || '',
    customerName: fields.customerName || '',
    customerPhone: fields.customerPhone || '',
    customerEmail: fields.customerEmail || '',
    notes: fields.notes || '',
    pickupOption: fields.pickupOption || '',
    pickupSurchargeGbp: fields.pickupSurchargeGbp ?? null,
    trackingNumber: fields.trackingNumber || '',
    password: fields.password || '',
    payment: parsePaymentPayload(fields.paymentPayload),
    otpCode: fields.otpCode || '',
    otpToken: fields.otpToken || '',
    otpExpiresAt: fields.otpExpiresAt || null,
    otpVerifiedAt: fields.otpVerifiedAt || null,
    createdAt: fields.createdAt || null,
    updatedAt: fields.updatedAt || null,
    paidAt: fields.paidAt || null,
    recordId: record.id
  };
}

export function serializePaymentPayload(payment) {
  if (!payment) return '';
  try {
    return JSON.stringify(payment);
  } catch (err) {
    return '';
  }
}

export function parsePaymentPayload(payload) {
  if (!payload) return null;
  try {
    return JSON.parse(payload);
  } catch (err) {
    return null;
  }
}

export { escapeFormulaValue };
