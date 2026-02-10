import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentMiddleware, type Network } from "x402-hono";

// Wallet address for receiving payments (NO private key needed on server!)
const payTo = "0x647595A7456c7659329C8AA78a16f616325E47dd";

// x402 config
const facilitatorUrl = "https://x402.dexter.cash";
const network: Network = (process.env.NETWORK as Network) || "base";

// === HELPER: Fetch sentiment data ===
async function fetchSentiment() {
  const response = await fetch('https://responsible-stillness-production.up.railway.app/api/v1/meta-index/free');
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

// === Helper: Format sentiment as bullets ===
function formatSentimentBullets(data: any): string[] {
  const bullets: string[] = [];
  
  bullets.push(`🌍 GLOBAL SENTIMENT: ${data.meta_index.global.value}/100 - ${data.meta_index.global.classification.toUpperCase()}`);
  bullets.push(`   └─ Confidence: ${data.meta_index.global.confidence}`);
  bullets.push('');
  
  if (data.meta_index.crypto) {
    bullets.push(`₿ CRYPTO MARKET: ${data.meta_index.crypto.value}/100 - ${data.meta_index.crypto.classification.toUpperCase()}`);
    bullets.push(`   ├─ Sources: ${data.meta_index.crypto.sources_count} indices`);
    bullets.push(`   └─ Agreement: ${(data.meta_index.crypto.agreement_score * 100).toFixed(0)}%`);
    bullets.push('');
  }
  
  if (data.meta_index.stocks_us) {
    bullets.push(`📈 US STOCKS: ${data.meta_index.stocks_us.value}/100 - ${data.meta_index.stocks_us.classification.toUpperCase()}`);
    bullets.push(`   ├─ Sources: ${data.meta_index.stocks_us.sources_count} indices`);
    bullets.push(`   └─ Agreement: ${(data.meta_index.stocks_us.agreement_score * 100).toFixed(0)}%`);
    bullets.push('');
  }
  
  bullets.push('📊 SCALE:');
  bullets.push('   0-20: EXTREME FEAR 😱');
  bullets.push('   21-40: FEAR 😰');
  bullets.push('   41-60: NEUTRAL 😐');
  bullets.push('   61-80: GREED 😏');
  bullets.push('   81-100: EXTREME GREED 🤑');
  bullets.push('');
  bullets.push(`⏰ Updated: ${new Date(data.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })} UTC`);
  
  return bullets;
}

// === HTTP Server ===
const app = new Hono();

// Payment middleware - only /full-report is paid
app.use(
  paymentMiddleware(
    payTo,
    {
      "/full-report": {
        price: "$0.02",
        network,
      },
    },
    { url: facilitatorUrl }
  )
);

// === FREE: Health check ===
app.get("/", (c) => {
  return c.json({
    service: "Market Sentiment Agent",
    version: "2.0.0",
    wallet: payTo,
    endpoints: {
      "/": "Service info (free)",
      "/health": "Health check (free)",
      "/sentiment": "Market sentiment summary (free)",
      "/full-report": "Comprehensive report (paid - $0.02)",
    },
    network,
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// === FREE: Market Sentiment Summary ===
app.get("/sentiment", async (c) => {
  try {
    const data = await fetchSentiment();
    const bullets = formatSentimentBullets(data);
    
    return c.json({
      summary: bullets.join('\n'),
      bullets,
      raw_data: data.meta_index,
      timestamp: data.timestamp,
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch sentiment data" }, 500);
  }
});

// === PAID: Full Report ($0.02) ===
app.get("/full-report", async (c) => {
  try {
    const data = await fetchSentiment();
    const bullets: string[] = [];
    
    bullets.push('╔════════════════════════════════════════════════════╗');
    bullets.push('║   COMPREHENSIVE MARKET SENTIMENT REPORT            ║');
    bullets.push('╚════════════════════════════════════════════════════╝');
    bullets.push('');
    
    // Global overview
    bullets.push('🌍 GLOBAL MARKET SENTIMENT:');
    bullets.push(`   Value: ${data.meta_index.global.value}/100`);
    bullets.push(`   Status: ${data.meta_index.global.classification.toUpperCase()}`);
    bullets.push(`   Confidence: ${data.meta_index.global.confidence.toUpperCase()}`);
    bullets.push('');
    
    // Individual markets
    bullets.push('📊 MARKET BREAKDOWN:');
    for (const [market, info] of Object.entries(data.meta_index)) {
      if (market === 'global') continue;
      const m = info as any;
      bullets.push('');
      bullets.push(`   ${market === 'crypto' ? '₿' : '📈'} ${market.toUpperCase().replace('_', ' ')}`);
      bullets.push(`   ├─ Sentiment: ${m.value}/100 (${m.classification.toUpperCase()})`);
      bullets.push(`   ├─ Sources: ${m.sources_count} indices`);
      bullets.push(`   └─ Agreement: ${(m.agreement_score * 100).toFixed(1)}%`);
    }
    
    bullets.push('');
    
    // Cross-market comparison
    const markets = Object.entries(data.meta_index)
      .filter(([key]) => key !== 'global')
      .map(([name, info]: [string, any]) => ({
        name: name.toUpperCase().replace('_', ' '),
        value: info.value,
        classification: info.classification
      }))
      .sort((a, b) => b.value - a.value);
    
    if (markets.length >= 2) {
      const divergence = Math.abs(markets[0].value - markets[markets.length - 1].value);
      bullets.push('📈 CROSS-MARKET ANALYSIS:');
      bullets.push(`   Market Divergence: ${divergence} points`);
      if (divergence > 20) {
        bullets.push('   ⚠️  HIGH DIVERGENCE - Markets showing significant disagreement');
      } else {
        bullets.push('   ✅ LOW DIVERGENCE - Markets relatively aligned');
      }
      bullets.push('');
    }
    
    // Trading context
    const globalValue = data.meta_index.global.value;
    bullets.push('💡 TRADING CONTEXT:');
    if (globalValue <= 25) {
      bullets.push('   • Extreme fear often presents buying opportunities');
      bullets.push('   • Contrarian signal: Consider accumulating quality assets');
    } else if (globalValue <= 45) {
      bullets.push('   • Fear zone - markets uncertain');
      bullets.push('   • Good time to dollar-cost average');
    } else if (globalValue <= 55) {
      bullets.push('   • Neutral zone - no strong directional bias');
      bullets.push('   • Follow trend signals rather than sentiment');
    } else if (globalValue <= 75) {
      bullets.push('   • Greed building - markets optimistic');
      bullets.push('   • Consider taking some profits on winners');
    } else {
      bullets.push('   • EXTREME GREED - markets potentially overextended');
      bullets.push('   • High risk of pullback, consider reducing exposure');
    }
    
    bullets.push('');
    bullets.push('💡 INTERPRETATION GUIDE:');
    bullets.push('   0-20   = EXTREME FEAR 😱  → Potential buying opportunity');
    bullets.push('   21-40  = FEAR 😰          → Cautious accumulation');
    bullets.push('   41-60  = NEUTRAL 😐       → Follow trends');
    bullets.push('   61-80  = GREED 😏         → Consider profit-taking');
    bullets.push('   81-100 = EXTREME GREED 🤑 → High risk, reduce exposure');
    bullets.push('');
    bullets.push(`⏰ Report Generated: ${new Date().toISOString()}`);
    bullets.push(`📡 Data Timestamp: ${data.timestamp}`);
    
    return c.json({
      full_report: bullets.join('\n'),
      summary_bullets: formatSentimentBullets(data),
      raw_data: data,
    });
  } catch (error) {
    return c.json({ error: "Failed to generate report" }, 500);
  }
});

// Start server
const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port,
});

console.log(`\n🚀 Market Sentiment Agent v2.0.0`);
console.log(`💰 Payments to: ${payTo}`);
console.log(`🌐 Network: ${network}`);
console.log(`📡 Port: ${port}`);
console.log(`\nEndpoints:`);
console.log(`  FREE:  GET /sentiment`);
console.log(`  PAID:  GET /full-report ($0.02)`);
