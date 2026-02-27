const ORDER_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ORDER_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PAYMENT_BOT_TOKEN = process.env.TELEGRAM_PAYMENT_BOT_TOKEN || ORDER_BOT_TOKEN;
const PAYMENT_CHAT_ID = process.env.TELEGRAM_PAYMENT_CHAT_ID || ORDER_CHAT_ID;
const FAST_BOT_TOKEN = process.env.TELEGRAM_FAST_BOT_TOKEN || ORDER_BOT_TOKEN;
const FAST_CHAT_ID = process.env.TELEGRAM_FAST_CHAT_ID || ORDER_CHAT_ID;

async function getFetch() {
  if (typeof globalThis.fetch === 'function') return globalThis.fetch.bind(globalThis);
  try {
    const mod = await import('node-fetch');
    return mod.default || mod;
  } catch (e) {
    console.warn('[telegram] node-fetch not available and global fetch missing');
    return null;
  }
}

async function sendTelegramWith(text, token, chatId) {
  if (!token || !chatId) {
    console.warn('[telegram] missing token or chatId');
    return false;
  }
  const fetchFn = await getFetch();
  if (!fetchFn) return false;
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const payload = await res.json();
    if (!res.ok || !payload.ok) {
      console.warn('[telegram] send failed', payload);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[telegram] error', err);
    return false;
  }
}

export async function sendTelegram(text) {
  return sendTelegramWith(text, ORDER_BOT_TOKEN, ORDER_CHAT_ID);
}

export async function sendPaymentTelegram(text) {
  return sendTelegramWith(text, PAYMENT_BOT_TOKEN, PAYMENT_CHAT_ID);
}

export async function sendFastTelegram(text) {
  return sendTelegramWith(text, FAST_BOT_TOKEN, FAST_CHAT_ID);
}
