import {
  wrapFetchWithPayment,
  createSigner,
  decodeXPaymentResponse,
  type Hex,
} from "x402-fetch";

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as Hex;
const targetUrl = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

async function main() {
  console.log("🔐 Creating signer for base mainnet...");
  const signer = await createSigner("base", privateKey);
  
  console.log("💳 Wrapping fetch with payment...");
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log("📡 Invoking paid endpoint...\n");
  
  const response = await fetchWithPayment(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: {} }),
  });

  console.log("Status:", response.status);
  console.log("Headers:");
  response.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
  
  const text = await response.text();
  console.log("\n📊 Response Body:");
  console.log(text);

  const paymentHeader = response.headers.get("x-payment-response");
  if (paymentHeader) {
    console.log("\n💰 Payment Receipt:");
    const receipt = decodeXPaymentResponse(paymentHeader);
    console.log(JSON.stringify(receipt, null, 2));
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
});
