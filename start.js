#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Apply patch first (before any imports from the patched module)
const HONO_FILE = 'node_modules/@lucid-agents/hono/dist/index.js';

if (existsSync(HONO_FILE)) {
  let content = readFileSync(HONO_FILE, 'utf-8');
  
  if (!content.includes('ExactEvmScheme')) {
    console.log('[patch] Applying fix to @lucid-agents/hono...');
    
    content = content.replace(
      "import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';",
      "import { resolvePrice, validatePaymentsConfig, extractSenderDomain, evaluateSender, extractPayerAddress, parsePriceAmount, findMostSpecificIncomingLimit } from '@lucid-agents/payments';\nimport { ExactEvmScheme } from '@x402/evm/exact/server';"
    );
    
    content = content.replace(
      'const baseMiddleware = middlewareFactory(routes, facilitatorClient, []);',
      "const schemes = [{ network: 'eip155:*', server: new ExactEvmScheme() }];\n  const baseMiddleware = middlewareFactory(routes, facilitatorClient, schemes);"
    );
    
    writeFileSync(HONO_FILE, content);
    console.log('[patch] Applied successfully!');
  } else {
    console.log('[patch] Already applied');
  }
}

// Now dynamically import the app (after patch is applied)
await import('./src/index.ts');
