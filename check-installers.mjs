import { getDb } from './server/db.js';

const db = await getDb();
const result = await db.execute('SELECT COUNT(*) as total FROM installers WHERE isVerified = 1');
const count = result[0][0].total;

console.log(`Current verified installers: ${count}`);
console.log(`Target: 50+ installers`);
console.log(`Need to recruit: ${Math.max(0, 50 - count)} more`);
