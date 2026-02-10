import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
import { http, createWalletClient } from "viem";
import { base } from "viem/chains";

const PRIVATE_KEY = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const x402Fetch = wrapFetchWithPayment(fetch, walletClient);

async function test() {
  console.log("Testing paid endpoint with wallet:", account.address);
  
  const response = await x402Fetch(
    "https://market-sentiment-agent-production-a942.up.railway.app/full-report"
  );
  
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response text:", text.slice(0, 2000));
}

test().catch(console.error);
