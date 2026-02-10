#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';

const HONO_FILE = 'node_modules/@lucid-agents/hono/dist/index.js';

if (!existsSync(HONO_FILE)) {
  console.log('Patch: @lucid-agents/hono not found, skipping');
  process.exit(0);
}

let content = readFileSync(HONO_FILE, 'utf-8');

// Check if already patched
if (content.includes('ExactEvmScheme')) {
  console.log('Patch: Already applied to @lucid-agents/hono');
  process.exit(0);
}

console.log('Patch: Applying fix to @lucid-agents/hono...');

// Add import
content = content.replace(
  "import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';",
  "import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';\nimport { ExactEvmScheme } from '@x402/evm/exact/server';"
);

// Fix the middlewareFactory call
content = content.replace(
  'const baseMiddleware = middlewareFactory(routes, facilitatorClient, []);',
  "const schemes = [{ network: 'eip155:*', server: new ExactEvmScheme() }];\n  const baseMiddleware = middlewareFactory(routes, facilitatorClient, schemes);"
);

writeFileSync(HONO_FILE, content);
console.log('Patch: Successfully applied!');
