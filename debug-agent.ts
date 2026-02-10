import { createAgent } from '@lucid-agents/core';
import { http } from '@lucid-agents/http';
import { createAgentApp } from '@lucid-agents/hono';
import { payments, paymentsFromEnv } from '@lucid-agents/payments';
import { z } from 'zod';

const paymentsConfig = paymentsFromEnv();
console.log('Payments config:', JSON.stringify(paymentsConfig, null, 2));

const agent = await createAgent({
  name: 'debug-agent',
  version: '1.0.0',
  description: 'Debug',
})
  .use(http())
  .use(payments({ config: paymentsConfig }))
  .build();

const { app, addEntrypoint } = await createAgentApp(agent);

addEntrypoint({
  key: 'test',
  description: 'Test paid endpoint',
  input: z.object({}),
  price: "0.01",
  handler: async () => ({ output: { message: 'paid!' } }),
});

Bun.serve({
  port: 3001,
  fetch: app.fetch,
});

console.log('Debug agent running on :3001');
