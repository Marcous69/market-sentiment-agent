import { wrapFetchWithPayment } from "x402-fetch";
import { createSigner } from "x402/types";

const PRIVATE_KEY = process.env.AGENT_WALLET_PRIVATE_KEY as `0x${string}`;

async function test() {
  console.log("Creating signer for 'base' network...");
  const signer = await createSigner("base", PRIVATE_KEY);
  console.log("Signer account:", signer.account?.address);

  const x402Fetch = wrapFetchWithPayment(fetch, signer);

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
