import { wrapFetchWithPayment, createSigner, type Hex } from "x402-fetch";

const pk = "PRIVATE_KEY_REMOVED" as Hex;
const url = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

async function main() {
  try {
    console.log("Creating signer...");
    const signer = await createSigner("base-sepolia", pk);
    console.log("Signer address:", await signer.account.address);
    
    console.log("\nWrapping fetch...");
    const pay = wrapFetchWithPayment(fetch, signer);

    console.log("\nSending request to:", url);
    const r = await pay(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: {} }),
    });

    console.log("\nResponse status:", r.status);
    console.log("Response headers:");
    r.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));
    console.log("\nBody:", await r.text());
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.error("Stack:", error.stack);
  }
}

main();
