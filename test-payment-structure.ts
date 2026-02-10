import { createSigner } from 'x402-fetch';
import { exact } from 'x402/schemes';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;

const signer = await createSigner('base-sepolia', AGENT_KEY);
console.log('Signer address:', signer.account?.address);

// Build a payment header for a hypothetical 402 response
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

console.log('\nPayment requirements:', JSON.stringify(paymentRequirements, null, 2));

// Create payment header using x402's EVM client
import { createPaymentHeader } from 'x402/client';
const x402Version = 1;

const paymentHeader = await createPaymentHeader(signer, x402Version, paymentRequirements as any);
console.log('\nPayment header (base64):', paymentHeader.slice(0, 100) + '...');

// Decode to see structure
const decoded = exact.evm.decodePayment(paymentHeader);
console.log('\nDecoded payment payload:', JSON.stringify(decoded, null, 2));
