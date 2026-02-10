import { createWalletClient, http, publicActions, createPublicClient, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { x402Client, x402HTTPClient } from '@x402/core/client';
import { ExactEvmScheme, toClientEvmSigner } from '@x402/evm';

const PRIVATE_KEY = 'PRIVATE_KEY_REMOVED';
const AGENT_URL = 'https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke';
const RPC = 'https://base.llamarpc.com';

async function pay() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log('Paying from:', account.address);
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(RPC)
  }).extend(publicActions);
  
  // Step 1: Get payment requirements
  console.log('\n1. Getting payment requirements...');
  const reqRes = await fetch(AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  console.log('Status:', reqRes.status);
  
  const paymentHeader = reqRes.headers.get('payment-required');
  if (!paymentHeader) {
    console.log('No payment-required header!');
    return;
  }
  
  const requirements = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  console.log('Requirements:', JSON.stringify(requirements.accepts[0], null, 2));
  
  // Step 2: Create x402 client
  console.log('\n2. Creating x402 client...');
  const signer = toClientEvmSigner({
    address: account.address,
    signTypedData: walletClient.signTypedData.bind(walletClient),
  });
  
  const coreClient = new x402Client()
    .register('eip155:*', new ExactEvmScheme(signer));
  
  const httpClient = new x402HTTPClient(coreClient);
  
  // Step 3: Create payment payload
  console.log('\n3. Creating payment payload...');
  try {
    const paymentPayload = await httpClient.createPaymentPayload(requirements);
    console.log('Payment payload created!');
    console.log('Payload:', JSON.stringify(paymentPayload, null, 2).slice(0, 500));
    
    // Step 4: Make paid request
    console.log('\n4. Making paid request with payment...');
    const headers = httpClient.encodePaymentSignatureHeader(paymentPayload);
    console.log('Payment header keys:', Object.keys(headers));
    
    const paidRes = await fetch(AGENT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({})
    });
    
    console.log('\n5. Response:');
    console.log('Status:', paidRes.status);
    console.log('Headers:', [...paidRes.headers.entries()].map(([k,v]) => `${k}: ${v.slice(0,50)}`).join('\n'));
    const data = await paidRes.json();
    console.log('Body:', JSON.stringify(data, null, 2).slice(0, 1500));
    
  } catch (e: any) {
    console.error('Error:', e.message);
    console.error('Stack:', e.stack?.slice(0, 500));
  }
}

pay().catch(e => console.error('Fatal:', e.message));
