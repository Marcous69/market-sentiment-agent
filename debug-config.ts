import { paymentsFromEnv } from '@lucid-agents/payments';

console.log('Environment variables:');
console.log('  PAYMENTS_RECEIVABLE_ADDRESS:', process.env.PAYMENTS_RECEIVABLE_ADDRESS);
console.log('  FACILITATOR_URL:', process.env.FACILITATOR_URL);
console.log('  NETWORK:', process.env.NETWORK);

console.log('\nResolved payments config:');
const config = paymentsFromEnv();
console.log('  payTo:', config.payTo);
console.log('  facilitatorUrl:', config.facilitatorUrl);
console.log('  network:', config.network);
