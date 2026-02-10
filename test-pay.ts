import { wrapFetchWithPayment, createSigner } from 'x402-fetch';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;
const FACILITATOR = process.env.FACILITATOR_URL!;

const signer = await createSigner('base', AGENT_KEY);
console.log('Wallet:', signer.account?.address);
console.log('Facilitator:', FACILITATOR);

const paidFetch = wrapFetchWithPayment(
  fetch, 
  signer,
  BigInt(1 * 10 ** 6),
  undefined,
  { facilitatorUrl: FACILITATOR }
);

console.log('\n--- Calling paid endpoint ---\n');

const res = await paidFetch('http://localhost:3000/entrypoints/full-report/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

console.log('Response status:', res.status);
const text = await res.text();
console.log('Response body:', text.slice(0, 1000));
