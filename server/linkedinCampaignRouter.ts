/**
 * LinkedIn Campaign Router
 * tRPC endpoints for LinkedIn direct messaging campaigns
 */

import { router, publicProcedure } from './_core/trpc';
import { z } from 'zod';
import { getDb } from './db';
import { launchLinkedInCampaign, generateLaunchMessage, generateConnectionRequest } from './linkedinMessaging';
import { sql } from 'drizzle-orm';

export const linkedinCampaignRouter = router({
  /**
   * Launch LinkedIn campaign to all verified installers
   */
  launchCampaign: publicProcedure
    .input(z.object({
      testMode: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database unavailable');
      }

      // Get all verified installers with LinkedIn profiles
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

      const installerList = installers[0] as any;

      if (installerList.length === 0) {
        return {
          success: false,
          message: 'No verified installers with LinkedIn profiles found',
          sent: 0,
          failed: 0,
          details: [],
        };
      }

      console.log(`[LinkedIn Campaign] Found ${installerList.length} installers with LinkedIn profiles`);

      // Launch campaign
      const result = await launchLinkedInCampaign(
        input.testMode ? installerList.slice(0, 3) : installerList
      );

      return {
        success: result.success,
        message: `LinkedIn campaign ${result.success ? 'completed' : 'failed'}`,
        sent: result.sent,
        failed: result.failed,
        total: installerList.length,
        details: result.details,
      };
    }),

  /**
   * Preview LinkedIn message for an installer
   */
  previewMessage: publicProcedure
    .input(z.object({
      installerId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database unavailable');
      }

      const installer = await db.execute(sql`
        SELECT 
          id, companyName, contactName, state, linkedinUrl
        FROM installers
        WHERE id = ${input.installerId}
        LIMIT 1
      `);

      const installerData = (installer[0] as any)[0];

      if (!installerData) {
        throw new Error('Installer not found');
      }

      // Extract LinkedIn username
      const usernameMatch = installerData.linkedinUrl?.match(/linkedin\.com\/(?:in|company)\/([^\/\?]+)/);
      const username = usernameMatch ? usernameMatch[1] : 'unknown';

      const profile = {
        username,
        fullName: installerData.contactName || installerData.companyName,
        headline: 'Solar Installation Professional',
        companyName: installerData.companyName,
        location: installerData.state,
      };

      const stats = {
        totalLeads: 637,
        avgQuality: 87,
        states: ['QLD', 'NSW', 'WA', 'SA', 'VIC', 'TAS'],
      };

      const connectionRequest = generateConnectionRequest(profile);
      const directMessage = generateLaunchMessage(profile, stats);

      return {
        installer: {
          id: installerData.id,
          companyName: installerData.companyName,
          contactName: installerData.contactName,
          linkedinUrl: installerData.linkedinUrl,
        },
        connectionRequest,
        directMessage,
      };
    }),

  /**
   * Get campaign statistics
   */
  getCampaignStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database unavailable');
    }

    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as totalInstallers,
        SUM(CASE WHEN linkedinUrl IS NOT NULL AND linkedinUrl != '' THEN 1 ELSE 0 END) as withLinkedIn,
        SUM(CASE WHEN isVerified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as active
      FROM installers
    `);

    const result = (stats[0] as any)[0];

    return {
      totalInstallers: Number(result.totalInstallers),
      withLinkedInProfiles: Number(result.withLinkedIn),
      verified: Number(result.verified),
      active: Number(result.active),
      eligibleForCampaign: Number(result.withLinkedIn),
    };
  }),
});
