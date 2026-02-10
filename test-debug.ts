import { wrapFetchWithPayment, createSigner, type Hex } from "x402-fetch";

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as Hex;
const targetUrl = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

async function main() {
  const signer = await createSigner("base-sepolia", privateKey);
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log("Sending payment request...");
  const response = await fetchWithPayment(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: {} }),
  });

  console.log("Status:", response.status);
  console.log("\nAll Headers:");
  response.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
  console.log("\nBody:", await response.text());
}

main().catch(e => console.error("Error:", e.message || e));
