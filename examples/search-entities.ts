import { BizVerify } from '@bizverify/sdk';

const biz = new BizVerify({ apiKey: 'bv_live_...' });

// Single page search
const page = await biz.search.find({
  entity_name: 'Acme',
  jurisdiction: 'us-fl',
  limit: 10,
});

console.log(`Found ${page.total} results (showing ${page.results.length})`);
for (const entity of page.results) {
  console.log(`- ${entity.entity_name} (${entity.status}, ${entity.confidence})`);
}

// Auto-paginate all results
console.log('\nAll results:');
for await (const entity of biz.search.findAll({ entity_name: 'Acme' })) {
  console.log(`- ${entity.entity_name} [${entity.jurisdiction}]`);
}
