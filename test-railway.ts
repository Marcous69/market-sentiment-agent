import { wrapFetchWithPayment, createSigner } from 'x402-fetch';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;
const signer = await createSigner('base-sepolia', AGENT_KEY);

const paidFetch = wrapFetchWithPayment(
  fetch, 
  signer,
  BigInt(1 * 10 ** 6),
  undefined,
  { facilitatorUrl: 'https://x402.org/facilitator' }
);

const res = await paidFetch('https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

const data = await res.json();
console.log(data.output.full_report);
