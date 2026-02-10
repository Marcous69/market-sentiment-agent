# Market Sentiment Agent 📊

**Fear & Greed Index (0-100) in simple bullet points**

Built with Lucid Agents SDK and x402 payments.

## Features

- 🆓 **Free Endpoint**: Get current market sentiment across crypto, stocks, and global markets
- 💰 **5 Paid Endpoints**: Detailed breakdowns, comparisons, context, and reports

## Scale

- **0-20**: EXTREME FEAR 😱
- **21-40**: FEAR 😰
- **41-60**: NEUTRAL 😐
- **61-80**: GREED 😏
- **81-100**: EXTREME GREED 🤑

## Endpoints

### Free
- `/entrypoints/sentiment/invoke` - Current sentiment in bullet points

### Paid (x402)
- `/entrypoints/detailed/invoke` - Detailed breakdown ($0.001)
- `/entrypoints/compare/invoke` - Market comparison ($0.002)
- `/entrypoints/context/invoke` - Trading context ($0.002)
- `/entrypoints/market/invoke` - Specific market data ($0.003)
- `/entrypoints/full-report/invoke` - Comprehensive report ($0.005)

## Data Source

Live data from https://sentimentstack.vercel.app/

## Tech Stack

- Lucid Agents SDK
- Bun runtime
- x402 payments
- Base network

## Development

```bash
bun install
bun run src/index.ts
```

## Environment Variables

```env
PAYMENTS_RECEIVABLE_ADDRESS=<your-wallet-address>
FACILITATOR_URL=https://facilitator.daydreams.systems
NETWORK=base
PORT=3000
```

---

Built by **Marcous69** 🚀
