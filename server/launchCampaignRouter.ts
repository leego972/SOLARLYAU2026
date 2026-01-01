/**
 * Launch Campaign Router
 * Admin endpoint to trigger installer email campaign
 */

import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { sendLaunchCampaign } from './launchCampaign';

export const launchCampaignRouter = router({
  /**
   * Send launch email campaign to all verified installers
   * Admin only
   */
  sendCampaign: protectedProcedure.mutation(async ({ ctx }) => {
    // Only admin can trigger campaigns
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin can send campaigns',
      });
    }

    try {
      const stats = await sendLaunchCampaign();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error('[LaunchCampaignRouter] Error sending campaign:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to send campaign',
      });
    }
  }),
});
