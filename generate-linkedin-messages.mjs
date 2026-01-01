import { getDb } from './server/db.ts';
import { generateConnectionRequest, generateLaunchMessage } from './server/linkedinMessaging.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();

const installers = await db.execute(sql`
  SELECT 
    id, companyName, contactName, email, state, linkedinUrl
  FROM installers
  WHERE isVerified = 1 
    AND isActive = 1
    AND linkedinUrl IS NOT NULL
    AND linkedinUrl != ''
  ORDER BY createdAt DESC
`);

const installerList = installers[0];

console.log('📝 LINKEDIN MESSAGES FOR MANUAL SENDING');
console.log('========================================\n');
console.log(`Found ${installerList.length} installers with LinkedIn profiles\n`);

const stats = {
  totalLeads: 637,
  avgQuality: 87,
  states: ['QLD', 'NSW', 'WA', 'SA', 'VIC', 'TAS'],
};

installerList.forEach((installer, index) => {
  const usernameMatch = installer.linkedinUrl?.match(/linkedin\.com\/(?:in|company)\/([^\/\?]+)/);
  const username = usernameMatch ? usernameMatch[1] : 'unknown';

  const profile = {
    username,
    fullName: installer.contactName || installer.companyName,
    headline: 'Solar Installation Professional',
    companyName: installer.companyName,
    location: installer.state,
  };

  const connectionRequest = generateConnectionRequest(profile);
  const directMessage = generateLaunchMessage(profile, stats);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`INSTALLER #${index + 1}: ${installer.companyName}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`LinkedIn: ${installer.linkedinUrl}`);
  console.log(`Contact: ${installer.contactName}`);
  console.log(`State: ${installer.state}\n`);
  
  console.log(`📤 CONNECTION REQUEST:`);
  console.log(`${'─'.repeat(80)}`);
  console.log(connectionRequest);
  console.log();
  
  console.log(`💬 DIRECT MESSAGE (send after connection accepted):`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`Subject: ${directMessage.subject}\n`);
  console.log(directMessage.message);
  console.log();
});

console.log(`\n${'='.repeat(80)}`);
console.log('✅ All messages generated!');
console.log('Copy and paste these into LinkedIn to send manually.');
console.log(`${'='.repeat(80)}\n`);
