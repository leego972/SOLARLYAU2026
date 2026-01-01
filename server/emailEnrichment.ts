/**
 * Email Enrichment System using Hunter.io
 * Finds valid email addresses for installers
 */

import axios from 'axios';

interface HunterEmailFinderResponse {
  data: {
    first_name: string;
    last_name: string;
    email: string | null;
    score: number;
    domain: string;
    accept_all: boolean;
    position: string | null;
    verification: {
      date: string;
      status: 'valid' | 'invalid' | 'accept_all' | 'webmail' | 'disposable' | 'unknown';
    } | null;
    sources: Array<{
      domain: string;
      uri: string;
      extracted_on: string;
      last_seen_on: string;
      still_on_page: boolean;
    }>;
  };
  meta: {
    params: {
      first_name: string;
      last_name: string;
      domain: string;
      company: string | null;
    };
  };
}

/**
 * Find email address using Hunter.io API
 */
export async function findEmailWithHunter(params: {
  firstName: string;
  lastName: string;
  domain?: string;
  company?: string;
  apiKey: string;
}): Promise<{
  success: boolean;
  email: string | null;
  score: number;
  verified: boolean;
  verificationStatus: string | null;
  error?: string;
}> {
  try {
    const { firstName, lastName, domain, company, apiKey } = params;

    // Build query parameters
    const queryParams: any = {
      first_name: firstName,
      last_name: lastName,
      api_key: apiKey,
    };

    if (domain) {
      queryParams.domain = domain;
    } else if (company) {
      queryParams.company = company;
    } else {
      return {
        success: false,
        email: null,
        score: 0,
        verified: false,
        verificationStatus: null,
        error: 'Either domain or company name is required',
      };
    }

    console.log(`[Hunter.io] Finding email for ${firstName} ${lastName} at ${domain || company}...`);

    const response = await axios.get<HunterEmailFinderResponse>(
      'https://api.hunter.io/v2/email-finder',
      {
        params: queryParams,
        timeout: 10000,
      }
    );

    const { data } = response.data;

    if (!data.email) {
      console.log(`[Hunter.io] No email found for ${firstName} ${lastName}`);
      return {
        success: false,
        email: null,
        score: 0,
        verified: false,
        verificationStatus: null,
        error: 'No email found',
      };
    }

    const verified = data.verification?.status === 'valid';
    console.log(`[Hunter.io] Found email: ${data.email} (score: ${data.score}, verified: ${verified})`);

    return {
      success: true,
      email: data.email,
      score: data.score,
      verified,
      verificationStatus: data.verification?.status || null,
    };
  } catch (error: any) {
    console.error('[Hunter.io] Error finding email:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        return {
          success: false,
          email: null,
          score: 0,
          verified: false,
          verificationStatus: null,
          error: 'Invalid API key',
        };
      } else if (status === 429) {
        return {
          success: false,
          email: null,
          score: 0,
          verified: false,
          verificationStatus: null,
          error: 'Rate limit exceeded',
        };
      } else if (status === 422) {
        return {
          success: false,
          email: null,
          score: 0,
          verified: false,
          verificationStatus: null,
          error: errorData?.errors?.[0]?.details || 'Invalid parameters',
        };
      }
    }

    return {
      success: false,
      email: null,
      score: 0,
      verified: false,
      verificationStatus: null,
      error: error.message,
    };
  }
}

/**
 * Extract domain from company website or email
 */
export function extractDomain(input: string): string | null {
  try {
    // Remove protocol if present
    let domain = input.replace(/^https?:\/\//, '');
    
    // Remove www. if present
    domain = domain.replace(/^www\./, '');
    
    // Remove path if present
    domain = domain.split('/')[0];
    
    // Remove port if present
    domain = domain.split(':')[0];
    
    // Validate domain format
    if (domain && domain.includes('.')) {
      return domain.toLowerCase();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Parse contact name into first and last name
 */
export function parseContactName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  } else if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  } else {
    // First word is first name, rest is last name
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }
}

/**
 * Enrich installer with email address from Hunter.io
 */
export async function enrichInstallerEmail(installer: {
  id: number;
  companyName: string;
  contactName: string;
  email: string | null;
  website: string | null;
}, apiKey: string): Promise<{
  success: boolean;
  enrichedEmail: string | null;
  score: number;
  verified: boolean;
  method: 'existing' | 'hunter' | 'failed';
  error?: string;
}> {
  // If installer already has a valid email, return it
  if (installer.email && installer.email.includes('@') && !installer.email.includes('example.com')) {
    console.log(`[Enrichment] Installer ${installer.id} already has email: ${installer.email}`);
    return {
      success: true,
      enrichedEmail: installer.email,
      score: 100,
      verified: true,
      method: 'existing',
    };
  }

  // Parse contact name
  const { firstName, lastName } = parseContactName(installer.contactName || installer.companyName);

  if (!firstName) {
    return {
      success: false,
      enrichedEmail: null,
      score: 0,
      verified: false,
      method: 'failed',
      error: 'No contact name available',
    };
  }

  // Extract domain from website
  let domain: string | null = null;
  if (installer.website) {
    domain = extractDomain(installer.website);
  }

  // Try Hunter.io with domain
  if (domain) {
    const result = await findEmailWithHunter({
      firstName,
      lastName: lastName || firstName, // Use first name as fallback
      domain,
      apiKey,
    });

    if (result.success && result.email) {
      return {
        success: true,
        enrichedEmail: result.email,
        score: result.score,
        verified: result.verified,
        method: 'hunter',
      };
    }
  }

  // Try Hunter.io with company name if domain failed
  const companyResult = await findEmailWithHunter({
    firstName,
    lastName: lastName || firstName,
    company: installer.companyName,
    apiKey,
  });

  if (companyResult.success && companyResult.email) {
    return {
      success: true,
      enrichedEmail: companyResult.email,
      score: companyResult.score,
      verified: companyResult.verified,
      method: 'hunter',
    };
  }

  return {
    success: false,
    enrichedEmail: null,
    score: 0,
    verified: false,
    method: 'failed',
    error: companyResult.error || 'No email found',
  };
}

/**
 * Batch enrich multiple installers
 */
export async function batchEnrichInstallers(
  installers: Array<{
    id: number;
    companyName: string;
    contactName: string;
    email: string | null;
    website: string | null;
  }>,
  apiKey: string,
  onProgress?: (current: number, total: number, installer: any, result: any) => void
): Promise<{
  enriched: number;
  failed: number;
  existing: number;
  results: Array<{
    installerId: number;
    companyName: string;
    email: string | null;
    score: number;
    verified: boolean;
    method: string;
    error?: string;
  }>;
}> {
  let enriched = 0;
  let failed = 0;
  let existing = 0;
  const results: any[] = [];

  for (let i = 0; i < installers.length; i++) {
    const installer = installers[i];
    
    console.log(`\n[Enrichment] Processing installer ${i + 1}/${installers.length}: ${installer.companyName}`);

    const result = await enrichInstallerEmail(installer, apiKey);

    results.push({
      installerId: installer.id,
      companyName: installer.companyName,
      email: result.enrichedEmail,
      score: result.score,
      verified: result.verified,
      method: result.method,
      error: result.error,
    });

    if (result.method === 'existing') {
      existing++;
    } else if (result.success) {
      enriched++;
    } else {
      failed++;
    }

    if (onProgress) {
      onProgress(i + 1, installers.length, installer, result);
    }

    // Rate limiting: wait 1 second between requests to avoid hitting Hunter.io limits
    if (i < installers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n[Enrichment] Batch complete: ${enriched} enriched, ${existing} existing, ${failed} failed`);

  return {
    enriched,
    failed,
    existing,
    results,
  };
}
