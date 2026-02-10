import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { x402Client, x402HTTPClient } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';

const PRIVATE_KEY = 'PRIVATE_KEY_REMOVED';
const AGENT_URL = 'https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke';

async function test() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log('Wallet:', account.address);
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http()
  }).extend(publicActions);
  
  const signer = {
    address: account.address,
    signTypedData: walletClient.signTypedData.bind(walletClient),
  };
  
  const coreClient = new x402Client()
    .register('eip155:*', new ExactEvmScheme(signer));
  
  const httpClient = new x402HTTPClient(coreClient);
  
  // Step 1: Get 402
  console.log('\n=== Step 1: Initial request ===');
  const res1 = await fetch(AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  console.log('Status:', res1.status);
  
  // Step 2: Parse payment required
  console.log('\n=== Step 2: Parse requirements ===');
  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name) => res1.headers.get(name),
    {}
  );
  console.log('Parsed:', JSON.stringify(paymentRequired, null, 2).slice(0, 500));
  
  // Step 3: Create payment
  console.log('\n=== Step 3: Create payment ===');
  const payment = await httpClient.createPaymentPayload(paymentRequired);
  console.log('Payment created:', JSON.stringify(payment, null, 2).slice(0, 500));
  
  // Step 4: Encode header
  console.log('\n=== Step 4: Encode header ===');
  const headers = httpClient.encodePaymentSignatureHeader(payment);
  console.log('Headers:', Object.entries(headers).map(([k,v]) => `${k}: ${(v as string).slice(0,100)}...`));
  
  // Step 5: Send payment
  console.log('\n=== Step 5: Send with payment ===');
  const res2 = await fetch(AGENT_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({})
  });
  console.log('Status:', res2.status);
  console.log('Response headers:');
  res2.headers.forEach((v, k) => console.log(`  ${k}: ${v.slice(0, 100)}`));
  
  const body = await res2.text();
  console.log('Body:', body.slice(0, 500));
}

test().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
});
