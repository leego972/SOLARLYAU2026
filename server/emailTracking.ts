import { randomBytes } from 'crypto';
import { getDb } from './db';

export interface EmailTrackingData {
  installerId: number;
  emailType: 'launch' | 'welcome' | 'follow_up' | 'reminder';
  trackingToken?: string;
}

export interface EmailOpenData {
  trackingToken: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Generate tracking token and store in database
 */
export async function createEmailTracking(data: EmailTrackingData): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const trackingToken = data.trackingToken || randomBytes(32).toString('hex');

  await db.execute(
    `INSERT INTO email_tracking (installer_id, email_type, tracking_token, sent_at)
     VALUES (${data.installerId}, '${data.emailType}', '${trackingToken}', NOW())`
  );

  return trackingToken;
}

/**
 * Record email open event
 */
export async function recordEmailOpen(data: EmailOpenData): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db.execute(
      `UPDATE email_tracking 
       SET opened_at = NOW(), 
           ip_address = COALESCE(ip_address, ${data.ipAddress ? `'${data.ipAddress}'` : 'NULL'}),
           user_agent = COALESCE(user_agent, ${data.userAgent ? `'${data.userAgent.replace(/'/g, "''")}'` : 'NULL'})
       WHERE tracking_token = '${data.trackingToken}' AND opened_at IS NULL`
    );

    return true;
  } catch (error) {
    console.error('[EmailTracking] Failed to record open:', error);
    return false;
  }
}

/**
 * Record email click event
 */
export async function recordEmailClick(trackingToken: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.execute(
      `UPDATE email_tracking 
       SET clicked_at = NOW()
       WHERE tracking_token = '${trackingToken}' AND clicked_at IS NULL`
    );

    return true;
  } catch (error) {
    console.error('[EmailTracking] Failed to record click:', error);
    return false;
  }
}

/**
 * Get warm leads (opened but didn't click/convert)
 */
export async function getWarmLeads(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const [rows] = await db.execute(
      `SELECT 
         et.installer_id,
         et.email_type,
         et.sent_at,
         et.opened_at,
         i.companyName,
         i.contactName,
         i.email,
         i.state
       FROM email_tracking et
       JOIN installers i ON et.installer_id = i.id
       WHERE et.opened_at IS NOT NULL 
         AND et.clicked_at IS NULL
         AND et.sent_at > DATE_SUB(NOW(), INTERVAL 7 DAYS)
       ORDER BY et.opened_at DESC`
    );

    return rows as unknown as any[];
  } catch (error) {
    console.error('[EmailTracking] Failed to get warm leads:', error);
    return [];
  }
}

/**
 * Get email tracking stats
 */
export async function getEmailStats(): Promise<{
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}> {
  const db = await getDb();
  if (!db) {
    return { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 };
  }

  try {
    const [rows] = await db.execute(
      `SELECT 
         COUNT(*) as sent,
         SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
         SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked
       FROM email_tracking
       WHERE sent_at > DATE_SUB(NOW(), INTERVAL 30 DAYS)`
    );

    const stats = (rows as unknown as any[])[0];
    const sent = stats.sent || 0;
    const opened = stats.opened || 0;
    const clicked = stats.clicked || 0;

    return {
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
    };
  } catch (error) {
    console.error('[EmailTracking] Failed to get stats:', error);
    return { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 };
  }
}

/**
 * Generate tracking pixel URL
 */
export function getTrackingPixelUrl(trackingToken: string, baseUrl: string): string {
  return `${baseUrl}/api/track/open/${trackingToken}`;
}

/**
 * Generate tracking link URL
 */
export function getTrackingLinkUrl(trackingToken: string, targetUrl: string, baseUrl: string): string {
  return `${baseUrl}/api/track/click/${trackingToken}?redirect=${encodeURIComponent(targetUrl)}`;
}
