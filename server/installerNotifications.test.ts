import { describe, it, expect, vi } from "vitest";

// Mock the email and SMS services
vi.mock('./emailServiceGmail', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('./smsVerification', () => ({
  sendSMS: vi.fn().mockResolvedValue({ success: true, messageId: 'test-123' }),
}));

vi.mock('./db', () => ({
  getLeadById: vi.fn().mockResolvedValue({
    id: 1,
    customerName: 'John Smith',
    customerEmail: 'john@example.com',
    customerPhone: '0412345678',
    suburb: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    address: '123 Test St',
    propertyType: 'residential',
    estimatedSystemSize: 6,
    qualityScore: 85,
  }),
  getOffersByLeadId: vi.fn().mockResolvedValue([
    {
      id: 1,
      leadId: 1,
      installerId: 1,
      offerPrice: 60,
      distance: 15,
      emailSent: false,
      smsSent: false,
    },
  ]),
  getInstallerById: vi.fn().mockResolvedValue({
    id: 1,
    companyName: 'Solar Pro QLD',
    contactName: 'Jane Doe',
    email: 'jane@solarpro.com.au',
    phone: '0498765432',
    state: 'QLD',
  }),
  updateLeadOffer: vi.fn().mockResolvedValue(undefined),
}));

describe("Installer Notifications", () => {
  it("should export notification functions", async () => {
    const { notifyInstallerOfNewLead, notifyMatchedInstallers, notifyLeadAccepted } = await import("./installerNotifications");
    
    expect(notifyInstallerOfNewLead).toBeDefined();
    expect(typeof notifyInstallerOfNewLead).toBe("function");
    
    expect(notifyMatchedInstallers).toBeDefined();
    expect(typeof notifyMatchedInstallers).toBe("function");
    
    expect(notifyLeadAccepted).toBeDefined();
    expect(typeof notifyLeadAccepted).toBe("function");
  });

  it("should send email notification to installer", async () => {
    const { notifyInstallerOfNewLead } = await import("./installerNotifications");
    const { sendEmail } = await import("./emailServiceGmail");
    
    const lead = {
      id: 1,
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '0412345678',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      address: '123 Test St',
      propertyType: 'residential' as const,
      estimatedSystemSize: 6,
      qualityScore: 85,
    } as any;
    
    const installer = {
      id: 1,
      companyName: 'Solar Pro QLD',
      contactName: 'Jane Doe',
      email: 'jane@solarpro.com.au',
      phone: '0498765432',
      state: 'QLD',
    } as any;
    
    const offer = {
      id: 1,
      leadId: 1,
      installerId: 1,
      offerPrice: 60,
      distance: 15,
      emailSent: false,
      smsSent: false,
    } as any;
    
    const result = await notifyInstallerOfNewLead(lead, installer, offer);
    
    expect(result.emailSent).toBe(true);
    expect(sendEmail).toHaveBeenCalled();
  });

  it("should send SMS notification to installer with phone", async () => {
    const { notifyInstallerOfNewLead } = await import("./installerNotifications");
    const { sendSMS } = await import("./smsVerification");
    
    const lead = {
      id: 1,
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '0412345678',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      address: '123 Test St',
      propertyType: 'residential' as const,
      estimatedSystemSize: 6,
      qualityScore: 85,
    } as any;
    
    const installer = {
      id: 1,
      companyName: 'Solar Pro QLD',
      contactName: 'Jane Doe',
      email: 'jane@solarpro.com.au',
      phone: '0498765432',
      state: 'QLD',
    } as any;
    
    const offer = {
      id: 1,
      leadId: 1,
      installerId: 1,
      offerPrice: 60,
      distance: 15,
      emailSent: false,
      smsSent: false,
    } as any;
    
    const result = await notifyInstallerOfNewLead(lead, installer, offer);
    
    expect(result.smsSent).toBe(true);
    expect(sendSMS).toHaveBeenCalled();
  });

  it("should handle installer without phone gracefully", async () => {
    const { notifyInstallerOfNewLead } = await import("./installerNotifications");
    
    const lead = {
      id: 1,
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      customerPhone: '0412345678',
      suburb: 'Brisbane',
      state: 'QLD',
      postcode: '4000',
      address: '123 Test St',
      propertyType: 'residential' as const,
      estimatedSystemSize: 6,
      qualityScore: 85,
    } as any;
    
    const installer = {
      id: 1,
      companyName: 'Solar Pro QLD',
      contactName: 'Jane Doe',
      email: 'jane@solarpro.com.au',
      phone: null, // No phone
      state: 'QLD',
    } as any;
    
    const offer = {
      id: 1,
      leadId: 1,
      installerId: 1,
      offerPrice: 60,
      distance: 15,
      emailSent: false,
      smsSent: false,
    } as any;
    
    const result = await notifyInstallerOfNewLead(lead, installer, offer);
    
    expect(result.emailSent).toBe(true);
    expect(result.smsSent).toBe(false); // Should be false since no phone
  });
});
