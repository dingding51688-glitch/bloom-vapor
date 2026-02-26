import { airtableRecordToOrder, findOrderByOrderId } from './_airtable.js';

export async function handler(event) {
  try {
    const orderId = event.queryStringParameters?.orderId;
    if (!orderId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing orderId' }) };
    }

    const record = await findOrderByOrderId(orderId);
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const order = airtableRecordToOrder(record);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    };
  } catch (err) {
    console.error('[get-order] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load order' }) };
  }
}
