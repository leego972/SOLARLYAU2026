import { describe, expect, it } from "vitest";

/**
 * ClickSend API Credential Validation Tests
 * 
 * These tests verify that the ClickSend credentials are valid by calling
 * a lightweight API endpoint (account details).
 */

describe("ClickSend API Credentials", () => {
  const username = process.env.CLICKSEND_USERNAME;
  const apiKey = process.env.CLICKSEND_API_KEY;

  it("should have ClickSend credentials configured", () => {
    expect(username).toBeDefined();
    expect(username).not.toBe("");
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
  });

  it("should authenticate with ClickSend API", async () => {
    if (!username || !apiKey) {
      console.log("Skipping API test - credentials not configured");
      return;
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${username}:${apiKey}`).toString('base64');

    // Call the account details endpoint (lightweight, doesn't cost credits)
    const response = await fetch('https://rest.clicksend.com/v3/account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    // Check for successful authentication
    expect(result.response_code).toBe("SUCCESS");
    expect(result.http_code).toBe(200);
    
    // Log account info for debugging
    if (result.data) {
      console.log(`ClickSend Account: ${result.data.user_email}`);
      console.log(`Account Balance: ${result.data.balance}`);
    }
  });

  it("should have SMS sending capability", async () => {
    if (!username || !apiKey) {
      console.log("Skipping SMS capability test - credentials not configured");
      return;
    }

    const auth = Buffer.from(`${username}:${apiKey}`).toString('base64');

    // Check SMS price endpoint (doesn't send actual SMS)
    const response = await fetch('https://rest.clicksend.com/v3/sms/price', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            source: 'nodejs',
            body: 'Test message for price check',
            to: '+61400000000', // Test number
          },
        ],
      }),
    });

    const result = await response.json();

    // Should be able to calculate price (even if number is invalid)
    expect(result.response_code).toBe("SUCCESS");
    console.log(`SMS Price Check: ${result.response_msg}`);
  });
});
