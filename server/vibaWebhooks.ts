/**
 * Viba Webhook System
 * Sends real-time event notifications to Viba business manager
 */

interface WebhookEvent {
  event: string;
  timestamp: string;
  data: any;
}

/**
 * Send webhook notification to Viba
 */
export async function sendVibaWebhook(event: string, data: any): Promise<boolean> {
  const webhookUrl = process.env.VIBA_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('[VibaWebhook] Webhook URL not configured, skipping notification');
    return false;
  }

  const payload: WebhookEvent = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'SolarlyAU',
        'X-API-Key': process.env.VIBA_API_KEY || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[VibaWebhook] Failed to send ${event} webhook:`, response.statusText);
      return false;
    }

    console.log(`[VibaWebhook] ✅ Sent ${event} webhook to Viba`);
    return true;
  } catch (error) {
    console.error(`[VibaWebhook] Error sending ${event} webhook:`, error);
    return false;
  }
}

/**
 * Webhook event types
 */
export const VibaWebhookEvents = {
  // Transaction events
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_REFUNDED: 'transaction.refunded',
  
  // Lead events
  LEAD_CREATED: 'lead.created',
  LEAD_PURCHASED: 'lead.purchased',
  LEAD_QUALITY_UPDATED: 'lead.quality_updated',
  
  // Installer events
  INSTALLER_REGISTERED: 'installer.registered',
  INSTALLER_VERIFIED: 'installer.verified',
  INSTALLER_SUSPENDED: 'installer.suspended',
  
  // Revenue milestones
  REVENUE_MILESTONE: 'revenue.milestone',
  DAILY_REVENUE_SUMMARY: 'revenue.daily_summary',
  
  // System events
  SYSTEM_ALERT: 'system.alert',
  AUTONOMOUS_OPERATION_COMPLETE: 'system.autonomous_operation_complete',
} as const;

/**
 * Helper functions for common webhook notifications
 */

export async function notifyTransactionCompleted(transactionId: number, amount: number, installerName: string, leadDetails: any) {
  return sendVibaWebhook(VibaWebhookEvents.TRANSACTION_COMPLETED, {
    transactionId,
    amount,
    installerName,
    leadDetails,
  });
}

export async function notifyLeadPurchased(leadId: number, installerId: number, price: number) {
  return sendVibaWebhook(VibaWebhookEvents.LEAD_PURCHASED, {
    leadId,
    installerId,
    price,
  });
}

export async function notifyInstallerRegistered(installerId: number, companyName: string, state: string) {
  return sendVibaWebhook(VibaWebhookEvents.INSTALLER_REGISTERED, {
    installerId,
    companyName,
    state,
  });
}

export async function notifyRevenueMilestone(milestone: number, currentRevenue: number) {
  return sendVibaWebhook(VibaWebhookEvents.REVENUE_MILESTONE, {
    milestone,
    currentRevenue,
    achievedAt: new Date().toISOString(),
  });
}

export async function notifyDailyRevenueSummary(date: string, revenue: number, transactions: number, newLeads: number, newInstallers: number) {
  return sendVibaWebhook(VibaWebhookEvents.DAILY_REVENUE_SUMMARY, {
    date,
    revenue,
    transactions,
    newLeads,
    newInstallers,
  });
}

export async function notifySystemAlert(severity: 'info' | 'warning' | 'error', message: string, details?: any) {
  return sendVibaWebhook(VibaWebhookEvents.SYSTEM_ALERT, {
    severity,
    message,
    details,
  });
}
