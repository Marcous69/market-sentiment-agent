# Deployment Guide

## What's Built ✅

**Market Sentiment Agent** - Fear & Greed Index in bullet points
- ✅ 1 FREE endpoint + 5 PAID endpoints
- ✅ All endpoints tested and working
- ✅ Fetches REAL data from sentimentstack API
- ✅ GitHub repo created and pushed
- ✅ Ready for Railway deployment

## GitHub Repository

https://github.com/Marcous69/market-sentiment-agent

## Test Results

All endpoints return `status: "succeeded"` with live data:

### FREE Endpoint
```bash
curl -X POST http://localhost:3000/entrypoints/sentiment/invoke \
  -H "Content-Type: application/json" -d '{}'
```

Returns:
- Global sentiment (0-100)
- Crypto market sentiment
- US Stocks sentiment
- Fear/Greed scale legend
- Timestamp

### PAID Endpoints
1. `/entrypoints/detailed/invoke` - Full breakdown ($0.001)
2. `/entrypoints/compare/invoke` - Market comparison ($0.002)
3. `/entrypoints/context/invoke` - Trading context ($0.002)
4. `/entrypoints/market/invoke` - Specific market ($0.003)
5. `/entrypoints/full-report/invoke` - Complete report ($0.005)

## Railway Deployment

### Option 1: Railway CLI

```bash
cd market-sentiment-agent

# Login to Railway
railway login

# Create new project
railway init

# Set environment variables
railway variables set \
  PAYMENTS_RECEIVABLE_ADDRESS=0x02EeeEF62b90Df6ACDd73c050DA4f97E3785Cf92 \
  FACILITATOR_URL=https://facilitator.daydreams.systems \
  NETWORK=base \
  PORT=8080

# Deploy
railway up
```

### Option 2: Railway Dashboard

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Marcous69/market-sentiment-agent`
4. Add environment variables:
   - `PAYMENTS_RECEIVABLE_ADDRESS`: `0x02EeeEF62b90Df6ACDd73c050DA4f97E3785Cf92`
   - `FACILITATOR_URL`: `https://facilitator.daydreams.systems`
   - `NETWORK`: `base`
   - `PORT`: `8080`
5. Deploy!

## After Deployment

Test the live endpoint:
```bash
curl https://market-sentiment-agent-production.up.railway.app/health

curl -X POST https://market-sentiment-agent-production.up.railway.app/entrypoints/sentiment/invoke \
  -H "Content-Type: application/json" -d '{}'
```

## Features Summary

📊 **Data Source**: https://sentimentstack.vercel.app/
🔗 **API**: https://responsible-stillness-production.up.railway.app/api/v1/meta-index/free
💰 **Payments**: x402 on Base network
🏗️ **Built with**: Lucid Agents SDK + Bun

## Next Steps

- [ ] Deploy to Railway
- [ ] Test live endpoints
- [ ] Add to portfolio
- [ ] Announce on X/Twitter

---

Built by Marcous69 🚀
