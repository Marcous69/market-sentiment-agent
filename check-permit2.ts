import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const WALLET = '0x8F891013580B0ADDFb7CbCa395AFc39fFB46BC5A';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

const client = createPublicClient({
  chain: base,
  transport: http('https://base.llamarpc.com')
});

async function check() {
  // Check USDC allowance for Permit2
  const allowance = await client.readContract({
    address: USDC,
    abi: [{
      name: 'allowance',
      type: 'function',
      inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view'
    }],
    functionName: 'allowance',
    args: [WALLET, PERMIT2]
  });
  
  console.log('USDC allowance to Permit2:', allowance.toString());
  console.log('Needs approval:', allowance === 0n ? 'YES' : 'NO');
}

check().catch(console.error);
