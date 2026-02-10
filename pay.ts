import { wrapFetchWithPayment, createSigner, type Hex } from "x402-fetch";

const pk = "PRIVATE_KEY_REMOVED" as Hex;
const url = "https://market-sentiment-agent-production-a942.up.railway.app/entrypoints/full-report/invoke";

const signer = await createSigner("base-sepolia", pk);
const pay = wrapFetchWithPayment(fetch, signer);

console.log("💳 Paying...");
const r = await pay(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ input: {} }),
});

console.log("Status:", r.status);
console.log("Receipt:", r.headers.get("x-payment-response") || "NONE");
console.log("Body:", await r.text());
