import { wrapFetchWithPayment } from "x402-fetch";
import { privateKeyToAccount } from "viem/accounts";
import { http, createWalletClient } from "viem";
import { base } from "viem/chains";

const PRIVATE_KEY = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

console.log("Payer wallet:", account.address);
console.log("Receiver wallet: 0x7f9fb5F3d7C7506aAd68bcf0482fB5F25E76c1c6");
console.log("Same wallet?", account.address === "0x7f9fb5F3d7C7506aAd68bcf0482fB5F25E76c1c6");

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http("https://mainnet.base.org"),
});

const x402Fetch = wrapFetchWithPayment(fetch, walletClient);

async function test() {
  console.log("\nMaking payment request...");
  
  try {
    const response = await x402Fetch(
      "https://market-sentiment-agent-production-a942.up.railway.app/full-report",
      { method: "GET" }
    );
    
    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers));
    const text = await response.text();
    console.log("Response:", text.slice(0, 1500));
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
