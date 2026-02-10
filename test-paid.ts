import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
import { http, createWalletClient } from "viem";
import { base } from "viem/chains";

const PRIVATE_KEY = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

console.log("Payer wallet:", account.address);
console.log("Receiver wallet: 0x647595A7456c7659329C8AA78a16f616325E47dd");

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const x402Fetch = wrapFetchWithPayment(fetch, walletClient);

async function test() {
  console.log("\nMaking payment request...");
  
  const response = await x402Fetch(
    "https://market-sentiment-agent-production-a942.up.railway.app/full-report",
    { method: "GET" }
  );
  
  console.log("Status:", response.status);
  const text = await response.text();
  console.log("Response:", text.slice(0, 2000));
}

test().catch(e => console.error("Error:", e.message));
