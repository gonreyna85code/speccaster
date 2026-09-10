// Reference adapter for the Lemon Squeezy API (fiat payout provider).
// Copy to lemon-squeezy.js, fill credentials via environment variables only.
// Never commit this file with values. Ownership: the human/company.
const LS_API = 'https://api.lemonsqueezy.com/v1';

function headers() {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key) throw new Error('LEMON_SQUEEZY_API_KEY not set');
  return { Authorization: 'Bearer ' + key, Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json' };
}

async function getBalance() {
  const r = await fetch(LS_API + '/admin/money', { headers: headers() });
  if (!r.ok) throw new Error('LS getBalance ' + r.status);
  return await r.json();
}

async function getTransactions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(LS_API + '/transactions?' + qs, { headers: headers() });
  if (!r.ok) throw new Error('LS getTransactions ' + r.status);
  return await r.json();
}

// Payouts are initiated from the Lemon Squeezy dashboard / payout tool.
// This method documents the intent so the operator can flag threshold crossings.
async function createPayout() {
  throw new Error('createPayout: Lemon Squeezy does not expose payout initiation via public API; payout must occur in the owner's dashboard. Record once provider-confirmed.');
}

module.exports = { getBalance, getTransactions, createPayout, getTransactionsPaged: getTransactions };