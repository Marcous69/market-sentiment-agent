import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const privateKey = '0x3050e9df2309616bddbc62e2a58795aed5830580bd5a86b9dde17a1a998cb53b';
const account = privateKeyToAccount(privateKey);

console.log('Wallet:', account.address);

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const x402Fetch = wrapFetchWithPayment(fetch, walletClient);

async function buyPack() {
  console.log('Buying a Focus pack for $0.01...');
  
  const res = await x402Fetch('https://fpacks.store/shop/focus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: 'marcous' })
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

buyPack().catch(e => console.error('Error:', e.message));
