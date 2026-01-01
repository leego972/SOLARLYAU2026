/**
 * Installer Training & Certification Platform
 * Strategy #5: Additional revenue stream
 * 
 * Pricing:
 * - One-time certification: $299
 * - Monthly training subscription: $99/month
 * - Bundle (cert + 6 months): $799 (save $95)
 * 
 * Revenue potential: $299 × 50 installers = $14,950 one-time
 *                   + $99 × 30 active = $2,970/month = $35,640/year
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
// Training enrollments will be tracked in existing tables

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  topics: string[];
  videoUrl?: string;
  materials?: string[];
}

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: "solar-basics",
    title: "Solar Panel Installation Basics",
    description: "Fundamentals of solar panel systems and installation",
    duration: 45,
    topics: [
      "Solar panel types and efficiency",
      "Inverter selection and sizing",
      "Australian Standards AS/NZS 5033",
      "Safety requirements and PPE",
    ],
  },
  {
    id: "sales-techniques",
    title: "Solar Sales Mastery",
    description: "Proven techniques to close more solar deals",
    duration: 60,
    topics: [
      "Objection handling",
      "ROI calculations and presentations",
      "Financing options",
      "Follow-up strategies",
    ],
  },
  {
    id: "lead-conversion",
    title: "Lead Conversion Optimization",
    description: "Turn leads into paying customers",
    duration: 30,
    topics: [
      "First contact best practices",
      "Site assessment techniques",
      "Proposal creation",
      "Closing strategies",
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service Excellence",
    description: "Build reputation and get referrals",
    duration: 40,
    topics: [
      "Managing customer expectations",
      "Post-installation support",
      "Handling complaints",
      "Generating referrals",
    ],
  },
  {
    id: "compliance",
    title: "Australian Solar Compliance",
    description: "Legal and regulatory requirements",
    duration: 50,
    topics: [
      "CEC accreditation",
      "STCs and rebates",
      "Grid connection requirements",
      "Warranty obligations",
    ],
  },
];

export interface CertificationRequirements {
  modulesCompleted: number;
  quizzesPassed: number;
  practicalAssessment: boolean;
  minimumScore: number;
}

export const CERTIFICATION_REQUIREMENTS: CertificationRequirements = {
  modulesCompleted: 5, // All modules
  quizzesPassed: 5, // All quizzes
  practicalAssessment: true,
  minimumScore: 80, // 80% minimum
};

/**
 * Enroll installer in training program
 */
export async function enrollInTraining(
  installerId: number,
  planType: "certification" | "monthly" | "bundle"
): Promise<{ success: boolean; enrollmentId?: number }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    const pricing = {
      certification: 299,
      monthly: 99,
      bundle: 799,
    };

    // In production, this would insert into trainingEnrollments table
    // For now, return success with simulated enrollment
    console.log(`[Training] Installer ${installerId} enrolled in ${planType} plan - $${pricing[planType]}`);

    return {
      success: true,
      enrollmentId: installerId,
    };
  } catch (error) {
    console.error("[Training] Enrollment error:", error);
    return { success: false };
  }
}

/**
 * Check if installer has active training access
 */
export async function hasTrainingAccess(installerId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // In production, query trainingEnrollments table
    // For now, simulate access check
    const enrollments: any[] = [];

    const now = new Date();

    return enrollments.some((enrollment) => {
      if (enrollment.status !== "active") return false;
      if (!enrollment.expiresAt) return true; // Lifetime access (certification)
      return enrollment.expiresAt > now;
    });
  } catch (error) {
    console.error("[Training] Access check error:", error);
    return false;
  }
}

/**
 * Calculate training revenue
 */
export async function calculateTrainingRevenue(): Promise<{
  oneTime: number;
  monthly: number;
  total: number;
}> {
  const db = await getDb();
  if (!db) return { oneTime: 0, monthly: 0, total: 0 };

  try {
    // In production, query trainingEnrollments table
    const enrollments: any[] = [];

    let oneTime = 0;
    let monthly = 0;

    for (const enrollment of enrollments) {
      if (enrollment.planType === "certification" || enrollment.planType === "bundle") {
        oneTime += enrollment.price;
      }
      if (enrollment.planType === "monthly" && enrollment.status === "active") {
        monthly += enrollment.price;
      }
    }

    return {
      oneTime,
      monthly,
      total: oneTime + monthly,
    };
  } catch (error) {
    console.error("[Training] Revenue calculation error:", error);
    return { oneTime: 0, monthly: 0, total: 0 };
  }
}
