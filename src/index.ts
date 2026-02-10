import { createAgent } from '@lucid-agents/core';
import { http } from '@lucid-agents/http';
import { createAgentApp } from '@lucid-agents/hono';
import { payments, paymentsFromEnv } from '@lucid-agents/payments';
import { z } from 'zod';

const agent = await createAgent({
  name: 'market-sentiment-agent',
  version: '1.0.0',
  description: 'Market sentiment analysis (Fear & Greed Index 0-100) presented in simple bullet points',
})
  .use(http())
  .use(payments({ config: paymentsFromEnv() }))
  .build();

const { app, addEntrypoint } = await createAgentApp(agent);

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

// === FREE ENDPOINT: Market Sentiment Summary ===
addEntrypoint({
  key: 'sentiment',
  description: 'Get current market sentiment (Fear & Greed 0-100) in simple bullet points - FREE',
  input: z.object({}),
  handler: async () => {
    const data = await fetchSentiment();
    const bullets = formatSentimentBullets(data);
    
    return { 
      output: { 
        summary: bullets.join('\n'),
        bullets,
        raw_data: data.meta_index,
        timestamp: data.timestamp
      } 
    };
  },
});

// === PAID ENDPOINT: Full Report ($0.02) ===
addEntrypoint({
  key: 'full-report',
  description: 'Comprehensive sentiment report with all data points and analysis',
  input: z.object({}),
  price: "0.02",
  handler: async () => {
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
    
    return { 
      output: { 
        full_report: bullets.join('\n'),
        summary_bullets: formatSentimentBullets(data),
        raw_data: data 
      } 
    };
  },
});

const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Market Sentiment Agent running on port ${port}`);
console.log(`FREE: /entrypoints/sentiment/invoke`);
console.log(`PAID: /entrypoints/full-report/invoke ($0.02)`);
