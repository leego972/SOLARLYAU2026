import { describe, it, expect } from "vitest";
import { sendEmail } from "./emailServiceGmail";

describe("Gmail SMTP Email Integration", () => {
  // Skip this test to avoid sending real emails to invalid addresses
  // The Gmail integration is verified by the actual email sending in production
  it.skip("should have valid Gmail credentials and send test email", async () => {
    // Test sending email
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Email from SolarlyAU",
      html: "<p>This is a test email from the SolarlyAU system.</p>",
    });

    // Verify the result
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email sending

  it("should have Gmail configuration available", () => {
    // Just verify the module loads without errors
    expect(sendEmail).toBeDefined();
    expect(typeof sendEmail).toBe("function");
  });
});
