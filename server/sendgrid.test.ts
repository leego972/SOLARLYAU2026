import { describe, expect, it } from "vitest";
import { sendEmail } from "./emailService";

describe("SendGrid Email Integration", () => {
  it("should have valid SendGrid API key and send test email", async () => {
    const testEmail = "test@example.com";
    
    // Test sending a simple email
    const result = await sendEmail({
      to: testEmail,
      subject: "SendGrid API Test",
      html: "<p>This is a test email to validate SendGrid configuration.</p>",
    });

    // Verify the result
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email sending
});
