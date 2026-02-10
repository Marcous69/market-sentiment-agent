import {
  wrapFetchWithPayment,
  createSigner,
  decodeXPaymentResponse,
  type Hex,
} from "x402-fetch";

const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY as Hex;
const targetUrl = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

async function main() {
  console.log("🔐 Creating signer for BASE MAINNET...");
  const signer = await createSigner("base", privateKey);
  
  console.log("💳 Wrapping fetch with payment...");
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);

  console.log("📡 Paying $0.02 to our agent...\n");
  
  const response = await fetchWithPayment(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: {} }),
  });

  console.log("Status:", response.status);
  const text = await response.text();
  console.log("\n📊 Response:");
  console.log(text);

  const paymentHeader = response.headers.get("x-payment-response");
  if (paymentHeader) {
    console.log("\n💰 Payment Receipt:");
    console.log(JSON.stringify(decodeXPaymentResponse(paymentHeader), null, 2));
  } else {
    console.log("\n❌ No payment receipt received");
  }
}

main().catch(console.error);
