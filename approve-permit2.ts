import { createWalletClient, createPublicClient, http, parseAbi, maxUint256, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

const PRIVATE_KEY = 'PRIVATE_KEY_REMOVED';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

async function approve() {
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log('Wallet:', account.address);
  
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  });
  
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  });
  
  console.log('Approving USDC for Permit2...');
  
  const hash = await walletClient.writeContract({
    address: USDC,
    abi: parseAbi(['function approve(address spender, uint256 amount) returns (bool)']),
    functionName: 'approve',
    args: [PERMIT2, maxUint256],
    maxFeePerGas: parseGwei('0.1'),
    maxPriorityFeePerGas: parseGwei('0.05'),
  });
  
  console.log('Tx hash:', hash);
  console.log('Waiting for confirmation...');
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash, timeout: 30000 });
  console.log('Status:', receipt.status);
}

approve().catch(e => console.error('Error:', e.message));
