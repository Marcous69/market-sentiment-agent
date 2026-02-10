import { createSigner } from 'x402-fetch';
import { exact } from 'x402/schemes';
import { createPaymentHeader } from 'x402/client';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;
const FACILITATOR = process.env.FACILITATOR_URL!;

const signer = await createSigner('base-sepolia', AGENT_KEY);

// Try with eip155:84532 format (x402 v2)
const paymentRequirements = {
  scheme: "exact" as const,
  network: "eip155:84532" as const,  // EIP155 format
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

const x402Version = 2;
const paymentHeader = await createPaymentHeader(signer, x402Version, paymentRequirements as any);
const decoded = exact.evm.decodePayment(paymentHeader);
decoded.x402Version = x402Version;

console.log('Testing with x402Version:', x402Version, 'network:', paymentRequirements.network);

const verifyPayload = {
  x402Version,
  paymentPayload: decoded,
  paymentRequirements,
};

const res = await fetch(`${FACILITATOR}/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verifyPayload),
});

console.log('Status:', res.status);
const text = await res.text();
console.log('Response:', text);
