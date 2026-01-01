import { appRouter } from './server/routers.ts';

const ctx = {
  user: null,
  req: { protocol: 'https', headers: {} },
  res: {},
};

const caller = appRouter.createCaller(ctx);

console.log('🚀 Launching LinkedIn Campaign...\n');

try {
  const result = await caller.linkedinCampaign.launchCampaign({
    testMode: false,
  });

  console.log('\n📊 CAMPAIGN RESULTS');
  console.log('==================');
  console.log(`✅ Messages Sent: ${result.sent}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log(`📈 Total: ${result.total}`);
  console.log(`\n${result.message}\n`);

  console.log('📋 DETAILS:');
  console.log('===========');
  result.details.forEach(detail => console.log(detail));

} catch (error) {
  console.error('❌ Campaign failed:', error.message);
}
