import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const AGENT_KEY = process.env.AGENT_WALLET_PRIVATE_KEY! as `0x${string}`;
const account = privateKeyToAccount(AGENT_KEY);

// USDC on Base mainnet
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const client = createPublicClient({
  chain: base,
  transport: http(),
});

console.log('Wallet:', account.address);

// Check ETH balance
const ethBalance = await client.getBalance({ address: account.address });
console.log('ETH Balance:', formatUnits(ethBalance, 18), 'ETH');

// Check USDC balance
const usdcBalance = await client.readContract({
  address: USDC_ADDRESS,
  abi: [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }],
  functionName: 'balanceOf',
  args: [account.address],
});
console.log('USDC Balance:', formatUnits(usdcBalance as bigint, 6), 'USDC');
