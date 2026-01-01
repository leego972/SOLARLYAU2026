import { getDb } from './server/db.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();

// Count leads
const leadsResult = await db.execute(sql`SELECT COUNT(*) as count FROM leads WHERE isActive = 1`);
const leadsCount = leadsResult[0][0].count;

// Count verified installers
const installersResult = await db.execute(sql`SELECT COUNT(*) as count FROM installers WHERE isVerified = 1 AND isActive = 1`);
const installersCount = installersResult[0][0].count;

// Count transactions
const transactionsResult = await db.execute(sql`SELECT COUNT(*) as count, SUM(amount) as revenue FROM transactions WHERE status = 'completed'`);
const transactionsCount = transactionsResult[0][0].count;
const revenue = transactionsResult[0][0].revenue || 0;

// Average lead quality
const qualityResult = await db.execute(sql`SELECT AVG(qualityScore) as avg FROM leads WHERE isActive = 1`);
const avgQuality = Math.round(qualityResult[0][0].avg);

console.log('📊 SYSTEM STATUS');
console.log('================');
console.log(`🎯 Active Leads: ${leadsCount}`);
console.log(`✅ Verified Installers: ${installersCount}`);
console.log(`💰 Completed Transactions: ${transactionsCount}`);
console.log(`💵 Total Revenue: $${revenue}`);
console.log(`⭐ Average Lead Quality: ${avgQuality}/100`);
