// Let's directly test the facilitator verify endpoint

const FACILITATOR = 'https://facilitator.daydreams.systems';

// First, let's see what happens when we call /verify with a fake payload
const testPayload = {
  x402Version: 1,
  paymentPayload: {
    // Minimal payload
  },
  paymentRequirements: {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "10000",
    payTo: "0x02EeeEF62b90Df6ACDd73c050DA4f97E3785Cf92",
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  }
};

console.log('Testing facilitator verify endpoint...');
console.log('Payload:', JSON.stringify(testPayload, null, 2));

const res = await fetch(`${FACILITATOR}/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testPayload),
});

console.log('Status:', res.status);
const text = await res.text();
console.log('Response:', text);
