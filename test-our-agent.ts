import {
  wrapFetchWithPayment,
  createSigner,
  type Hex,
} from "x402-fetch";

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as Hex;
const targetUrl = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

if (!privateKey) {
  console.error("❌ Missing AGENT_WALLET_PRIVATE_KEY");
  process.exit(1);
}

async function main() {
  console.log("🔐 Creating signer for base-sepolia...");
  const signer = await createSigner("base-sepolia", privateKey);
  
  console.log("💳 Wrapping fetch with payment...");
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log("📡 Invoking OUR market-sentiment-agent...");
  
  const response = await fetchWithPayment(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: {} }),
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("\n📊 Response:");
  console.log(text.substring(0, 500) + "...");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
