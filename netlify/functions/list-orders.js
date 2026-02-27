import { listOrderRecords, escapeFormulaValue } from './_airtable.js';

function buildFilterFormula({ status, search }) {
  const filters = [];
  if (status && status !== 'all') {
    filters.push(`(LOWER({status})='${escapeFormulaValue(status.toLowerCase())}')`);
  }
  if (search) {
    const value = escapeFormulaValue(search);
    const clauses = [
      `FIND('${value}', {orderId})`,
      `FIND('${value}', {customerName})`,
      `FIND('${value}', {customerPhone})`,
      `FIND('${value}', {customerEmail})`
    ].map((clause) => `(${clause})`);
    filters.push(`OR(${clauses.join(',')})`);
  }
  if (!filters.length) return undefined;
  if (filters.length === 1) return filters[0];
  return `AND(${filters.join(',')})`;
}

export async function handler(event) {
  try {
    const qs = event.queryStringParameters || {};
    const limit = Math.min(Math.max(parseInt(qs.limit, 10) || 25, 1), 100);
    const offset = qs.offset || undefined;
    const status = (qs.status || '').trim().toLowerCase();
    const search = (qs.search || '').trim();

    const filterByFormula = buildFilterFormula({ status: status || undefined, search: search || undefined });
    const { orders, offset: nextOffset } = await listOrderRecords({
      pageSize: limit,
      offset,
      filterByFormula
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({ orders, nextOffset })
    };
  } catch (err) {
    console.error('[list-orders] error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Could not load orders' })
    };
  }
}
