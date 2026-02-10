#!/bin/bash
# Apply patches to node_modules after install

HONO_FILE="node_modules/@lucid-agents/hono/dist/index.js"

# Check if patch already applied (look for ExactEvmScheme import)
if grep -q "ExactEvmScheme" "$HONO_FILE" 2>/dev/null; then
  echo "Patch already applied to @lucid-agents/hono"
  exit 0
fi

echo "Applying patch to @lucid-agents/hono..."

# Add import for ExactEvmScheme
sed -i "s|import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';|import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';\nimport { ExactEvmScheme } from '@x402/evm/exact/server';|" "$HONO_FILE"

# Fix the middlewareFactory call to pass schemes
sed -i 's|const baseMiddleware = middlewareFactory(routes, facilitatorClient, \[\]);|const schemes = [{ network: '"'"'eip155:*'"'"', server: new ExactEvmScheme() }];\n  const baseMiddleware = middlewareFactory(routes, facilitatorClient, schemes);|' "$HONO_FILE"

echo "Patch applied successfully!"
