import { describe, it, expect } from "vitest";
import { sendEmail } from "./emailServiceResend";

describe("Resend Email Integration", () => {
  it("should have valid Resend API key and send test email", async () => {
    // Test sending email
    const result = await sendEmail({
      to: "delivered@resend.dev", // Resend's test email address
      subject: "Test Email from SolarlyAU",
      html: "<p>This is a test email from the SolarlyAU system.</p>",
    });

    // Verify the result
    expect(result).toBe(true);
  }, 30000); // 30 second timeout for email sending
});
