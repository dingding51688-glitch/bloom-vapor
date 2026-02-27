import twilio from 'twilio';

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID || '';
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || '';

let client = null;
function getClient() {
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    throw new Error('Missing Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN).');
  }
  if (!client) {
    client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
  return client;
}

export async function sendOtpSms({ to, body }) {
  if (!to) throw new Error('Missing SMS destination number');
  if (!body) throw new Error('Missing SMS body');
  if (!MESSAGING_SERVICE_SID && !FROM_NUMBER) {
    throw new Error('Configure TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER');
  }
  const clientInstance = getClient();
  const payload = {
    to,
    body
  };
  if (MESSAGING_SERVICE_SID) {
    payload.messagingServiceSid = MESSAGING_SERVICE_SID;
  } else if (FROM_NUMBER) {
    payload.from = FROM_NUMBER;
  }
  const res = await clientInstance.messages.create(payload);
  return res?.sid || null;
}
