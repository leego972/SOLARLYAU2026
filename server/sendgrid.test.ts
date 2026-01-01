import { describe, expect, it } from "vitest";
import { sendEmailWithGuide } from "./emailService";

describe("SendGrid Email Integration", () => {
  it("should send email with PDF guide successfully", async () => {
    const testEmail = "test@example.com";
    const testName = "Test User";

    // This will test the actual SendGrid integration
    const result = await sendEmailWithGuide(testEmail, testName);

    // Verify the result structure
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  }, 30000); // 30 second timeout for email sending
});
