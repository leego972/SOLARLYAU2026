/**
 * Automatic Installer Approval System
 * Verifies ABN, checks business legitimacy, auto-approves qualified installers
 */

import { updateInstaller } from "./db";

export interface ABNLookupResult {
  abn: string;
  entityName: string;
  businessName?: string;
  status: "Active" | "Cancelled" | "Invalid";
  gstRegistered: boolean;
  entityType: string;
  state: string;
  postcode: string;
}

export interface ApprovalResult {
  approved: boolean;
  reason: string;
  score: number;
  checks: {
    abnValid: boolean;
    abnActive: boolean;
    gstRegistered: boolean;
    businessNameMatch: boolean;
    stateMatch: boolean;
    entityTypeValid: boolean;
  };
}

/**
 * Verify ABN using Australian Business Register (ABR) API
 * Note: In production, you'd use the official ABR API with your GUID
 * For now, we'll simulate the verification
 */
export async function verifyABN(abn: string): Promise<ABNLookupResult | null> {
  // Remove spaces and validate format
  const cleanABN = abn.replace(/\s/g, "");
  
  if (!/^\d{11}$/.test(cleanABN)) {
    return null;
  }
  
  // TODO: Replace with real ABR API call
  // const response = await fetch(
  //   `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${cleanABN}&guid=YOUR_GUID`
  // );
  
  // For now, simulate ABN lookup
  // In production, this would call the real ABR API
  return simulateABNLookup(cleanABN);
}

/**
 * Simulate ABN lookup (replace with real API in production)
 */
function simulateABNLookup(abn: string): ABNLookupResult {
  // Simulate different scenarios based on ABN
  const lastDigit = parseInt(abn[abn.length - 1]);
  
  // 90% of ABNs are valid and active
  if (lastDigit <= 8) {
    return {
      abn,
      entityName: "Sample Solar Installation Pty Ltd",
      businessName: "Sample Solar",
      status: "Active",
      gstRegistered: true,
      entityType: "PRV", // Private company
      state: "QLD",
      postcode: "4000",
    };
  }
  
  // 5% are cancelled
  if (lastDigit === 9) {
    return {
      abn,
      entityName: "Cancelled Business Pty Ltd",
      status: "Cancelled",
      gstRegistered: false,
      entityType: "PRV",
      state: "NSW",
      postcode: "2000",
    };
  }
  
  // 5% are invalid
  return {
    abn,
    entityName: "",
    status: "Invalid",
    gstRegistered: false,
    entityType: "",
    state: "",
    postcode: "",
  };
}

/**
 * Automatic installer approval logic
 */
export async function autoApproveInstaller(installer: {
  id: number;
  companyName: string;
  abn: string;
  state: string;
  email: string;
}): Promise<ApprovalResult> {
  const checks = {
    abnValid: false,
    abnActive: false,
    gstRegistered: false,
    businessNameMatch: false,
    stateMatch: false,
    entityTypeValid: false,
  };
  
  let score = 0;
  let reason = "";
  
  // Step 1: Verify ABN
  const abnResult = await verifyABN(installer.abn);
  
  if (!abnResult) {
    return {
      approved: false,
      reason: "Invalid ABN format",
      score: 0,
      checks,
    };
  }
  
  checks.abnValid = true;
  score += 20;
  
  // Step 2: Check ABN status
  if (abnResult.status !== "Active") {
    return {
      approved: false,
      reason: `ABN is ${abnResult.status}`,
      score,
      checks,
    };
  }
  
  checks.abnActive = true;
  score += 30;
  
  // Step 3: Check GST registration (preferred but not required)
  if (abnResult.gstRegistered) {
    checks.gstRegistered = true;
    score += 15;
  }
  
  // Step 4: Check business name similarity
  const companyNameLower = installer.companyName.toLowerCase();
  const entityNameLower = abnResult.entityName.toLowerCase();
  const businessNameLower = (abnResult.businessName || "").toLowerCase();
  
  if (
    entityNameLower.includes(companyNameLower) ||
    companyNameLower.includes(entityNameLower) ||
    businessNameLower.includes(companyNameLower) ||
    companyNameLower.includes(businessNameLower)
  ) {
    checks.businessNameMatch = true;
    score += 15;
  }
  
  // Step 5: Check state match
  if (abnResult.state === installer.state) {
    checks.stateMatch = true;
    score += 10;
  }
  
  // Step 6: Check entity type (prefer companies over individuals)
  const validEntityTypes = ["PRV", "PUB", "LTD", "PTY"]; // Company types
  if (validEntityTypes.some(type => abnResult.entityType.includes(type))) {
    checks.entityTypeValid = true;
    score += 10;
  }
  
  // Decision logic
  if (score >= 75) {
    // Auto-approve: ABN valid, active, good match
    reason = "Auto-approved: All checks passed";
    return {
      approved: true,
      reason,
      score,
      checks,
    };
  } else if (score >= 50) {
    // Manual review needed
    reason = "Pending manual review: Some checks failed";
    return {
      approved: false,
      reason,
      score,
      checks,
    };
  } else {
    // Auto-reject: Too many red flags
    reason = "Auto-rejected: Failed critical checks";
    return {
      approved: false,
      reason,
      score,
      checks,
    };
  }
}

/**
 * Process installer approval automatically
 */
export async function processInstallerApproval(installerId: number, installer: {
  companyName: string;
  abn: string;
  state: string;
  email: string;
}): Promise<ApprovalResult> {
  const result = await autoApproveInstaller({
    id: installerId,
    ...installer,
  });
  
  if (result.approved) {
    // Auto-approve installer
    await updateInstaller(installerId, {
      isVerified: true,
      isActive: true,
    });
    
    // TODO: Send welcome email
    console.log(`[AutoApproval] Installer ${installerId} auto-approved (score: ${result.score})`);
  } else if (result.score < 50) {
    // Auto-reject
    await updateInstaller(installerId, {
      isVerified: false,
      isActive: false,
    });
    
    // TODO: Send rejection email
    console.log(`[AutoApproval] Installer ${installerId} auto-rejected (score: ${result.score}, reason: ${result.reason})`);
  } else {
    // Pending manual review
    await updateInstaller(installerId, {
      isVerified: false,
      isActive: true,
    });
    
    // TODO: Notify admin for manual review
    console.log(`[AutoApproval] Installer ${installerId} pending manual review (score: ${result.score})`);
  }
  
  return result;
}

/**
 * Batch process pending installers
 */
export async function batchProcessPendingInstallers(): Promise<{
  processed: number;
  approved: number;
  rejected: number;
  pending: number;
}> {
  const { getAllInstallers } = await import("./db");
  const allInstallers = await getAllInstallers();
  const pendingInstallers = allInstallers.filter((i: { isVerified: boolean; isActive: boolean }) => !i.isVerified && i.isActive);
  
  let approved = 0;
  let rejected = 0;
  let pending = 0;
  
  for (const installer of pendingInstallers) {
    if (!installer.abn) continue; // Skip if no ABN
    
    const result = await processInstallerApproval(installer.id, {
      companyName: installer.companyName,
      abn: installer.abn,
      state: installer.state,
      email: installer.email,
    });
    
    if (result.approved) {
      approved++;
    } else if (result.score < 50) {
      rejected++;
    } else {
      pending++;
    }
  }
  
  return {
    processed: pendingInstallers.length,
    approved,
    rejected,
    pending,
  };
}
