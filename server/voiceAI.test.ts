import { describe, expect, it } from "vitest";
import {
  callInstallerForRecruitment,
  callInstallerAboutLead,
  callInstallerFollowUp,
  batchCallInstallers
} from "./voiceAI";

describe("Voice AI System", () => {
  it("generates recruitment call script and simulates call", async () => {
    const result = await callInstallerForRecruitment(
      "John Smith",
      "+61412345678"
    );

    expect(result.success).toBe(true);
    expect(result.outcome).toBe("answered");
    expect(result.duration).toBeGreaterThan(0);
    expect(result.transcript).toContain("solar");
    expect(result.nextAction).toBeDefined();
  }, 30000); // 30 second timeout for LLM call

  it("generates lead notification call script", async () => {
    const result = await callInstallerAboutLead(
      1,
      "Sarah Johnson",
      "+61423456789",
      {
        address: "45 Sunshine Boulevard",
        suburb: "Brisbane",
        state: "QLD",
        systemSize: "6.6kW",
        estimatedValue: 8500
      }
    );

    expect(result.success).toBe(true);
    expect(result.transcript).toContain("Brisbane");
    expect(result.transcript).toContain("6.6kW");
  }, 30000);

  it("generates follow-up call script", async () => {
    const result = await callInstallerFollowUp(
      1,
      "Mike Williams",
      "+61434567890"
    );

    expect(result.success).toBe(true);
    expect(result.transcript).toContain("feedback");
  }, 30000);

  it("handles batch calling multiple installers", async () => {
    const installers = [
      { name: "Installer A", phone: "+61445678901" },
      { name: "Installer B", phone: "+61456789012" }
    ];

    const results = await batchCallInstallers(installers, "recruitment");

    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
  }, 60000); // 60 second timeout for batch calls
});
