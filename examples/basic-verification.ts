import { BizVerify } from '@bizverify/sdk';

const biz = new BizVerify({ apiKey: 'bv_live_...' });

// Quick pre-check (1 credit)
const result = await biz.verification.verify({
  entity_name: 'Acme Corporation',
  jurisdiction: 'us-fl',
});

console.log('Status:', result.status);
console.log('Credits charged:', result.credits_charged);

if (result.status === 'completed') {
  console.log('Result:', result.data);
}
