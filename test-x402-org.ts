import { createSigner } from 'x402-fetch';
import { exact } from 'x402/schemes';
import { toJsonSafe } from 'x402/shared';
import { createPaymentHeader } from 'x402/client';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;

// Try the default x402.org facilitator
const FACILITATOR = 'https://x402.org/facilitator';

const signer = await createSigner('base-sepolia', AGENT_KEY);

const paymentRequirements = {
  scheme: "exact" as const,
  network: "base-sepolia" as const,
  maxAmountRequired: "10000",
  payTo: "0x02EeeEF62b90Df6ACDd73c050DA4f97E3785Cf92" as `0x${string}`,
  asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  resource: "http://localhost:3000/test",
  description: "Test",
  mimeType: "application/json",
  maxTimeoutSeconds: 300,
  outputSchema: {},
  extra: { name: "USDC", version: "2" }
};

const x402Version = 1;
const paymentHeader = await createPaymentHeader(signer, x402Version, paymentRequirements as any);
const decoded = exact.evm.decodePayment(paymentHeader);
decoded.x402Version = x402Version;

const verifyBody = {
  x402Version: decoded.x402Version,
  paymentPayload: toJsonSafe(decoded),
  paymentRequirements: toJsonSafe(paymentRequirements),
};

console.log('Testing with:', FACILITATOR);

const res = await fetch(`${FACILITATOR}/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verifyBody),
});

console.log('Status:', res.status);
const text = await res.text();
console.log('Response:', text.slice(0, 500));
