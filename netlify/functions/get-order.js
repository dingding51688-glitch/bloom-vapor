import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ORDERS_DIR = path.resolve(__dirname, '../../data/orders');

export async function handler(event) {
  try {
    const orderId = event.queryStringParameters?.orderId;
    if (!orderId) return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId' }) };
    const filePath = path.join(ORDERS_DIR, `${orderId}.json`);
    const raw = await readFile(filePath, 'utf8');
    const order = JSON.parse(raw);
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) };
  } catch (err) {
    console.error('[get-order] error', err);
    return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
  }
}
