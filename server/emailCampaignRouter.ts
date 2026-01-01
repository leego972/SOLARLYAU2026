/**
 * tRPC Router for Autonomous Email Campaign
 */

import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import { runAutonomousEmailCampaign } from './autonomousEmailCampaign';

export const emailCampaignRouter = router({
  /**
   * Launch autonomous email campaign
   * Enriches emails with Hunter.io and sends launch emails
   */
  launchCampaign: protectedProcedure
    .input(
      z.object({
        hunterApiKey: z.string().min(1, 'Hunter.io API key is required'),
        enableEmailSending: z.boolean().default(true),
        dryRun: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const result = await runAutonomousEmailCampaign({
        hunterApiKey: input.hunterApiKey,
        enableEmailSending: input.enableEmailSending,
        dryRun: input.dryRun,
      });

      return result;
    }),

  /**
   * Test Hunter.io API key
   */
  testHunterApiKey: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(1, 'API key is required'),
      })
    )
    .mutation(async ({ input }) => {
      const { findEmailWithHunter } = await import('./emailEnrichment');
      
      // Test with a known email
      const result = await findEmailWithHunter({
        firstName: 'Alexis',
        lastName: 'Ohanian',
        domain: 'reddit.com',
        apiKey: input.apiKey,
      });

      return {
        valid: result.success,
        testEmail: result.email,
        score: result.score,
        error: result.error,
      };
    }),
});
