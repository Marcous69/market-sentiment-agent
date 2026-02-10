import {
  decodeXPaymentResponse,
  wrapFetchWithPayment,
  createSigner,
  type Hex,
} from "x402-fetch";

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as Hex;
const targetUrl = "https://sentimentstack-production.up.railway.app/entrypoints/premium/invoke";

if (!privateKey) {
  console.error("❌ Missing AGENT_WALLET_PRIVATE_KEY");
  process.exit(1);
}

async function main() {
  console.log("🔐 Creating signer for base-sepolia...");
  const signer = await createSigner("base-sepolia", privateKey);  // testnet
  
  console.log("💳 Wrapping fetch with payment...");
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log("📡 Invoking sentimentstack premium endpoint...");
  
  const response = await fetchWithPayment(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { refresh: true } }),
  });

  console.log("Status:", response.status);
  
  // Get raw text first
  const text = await response.text();
  console.log("\n📊 Raw Response:");
  console.log(text);

  const paymentHeader = response.headers.get("x-payment-response");
  if (paymentHeader) {
    console.log("\n💰 Payment Receipt:");
    const paymentResponse = decodeXPaymentResponse(paymentHeader);
    console.log(JSON.stringify(paymentResponse, null, 2));
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
