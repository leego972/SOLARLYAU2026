/**
 * Stripe Payment Processing Service
 * 
 * Handles payment processing for lead purchases
 */

import Stripe from "stripe";
import * as db from "./db";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Create or retrieve Stripe customer for installer
 */
export async function getOrCreateStripeCustomer(installerId: number): Promise<string> {
  const installer = await db.getInstallerById(installerId);
  if (!installer) {
    throw new Error("Installer not found");
  }

  // Return existing customer ID if available
  if (installer.stripeCustomerId) {
    return installer.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: installer.email,
    name: installer.companyName,
    metadata: {
      installer_id: installerId.toString(),
      company_name: installer.companyName,
      abn: installer.abn || "",
    },
  });

  // Save customer ID
  await db.updateInstaller(installerId, {
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

/**
 * Create payment intent for lead purchase
 */
export async function createLeadPaymentIntent(
  leadId: number,
  installerId: number,
  offerId: number
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const lead = await db.getLeadById(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const offer = await db.getLeadOfferById(offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }

  if (offer.status !== "accepted") {
    throw new Error("Offer must be accepted before payment");
  }

  const customerId = await getOrCreateStripeCustomer(installerId);

  // Create payment intent (amount in cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: offer.offerPrice * 100, // Convert AUD to cents
    currency: "aud",
    customer: customerId,
    metadata: {
      lead_id: leadId.toString(),
      installer_id: installerId.toString(),
      offer_id: offerId.toString(),
      customer_name: lead.customerName,
      customer_postcode: lead.postcode,
    },
    description: `Solar lead purchase - ${lead.suburb}, ${lead.state} ${lead.postcode}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Create transaction record
  await db.createTransaction({
    leadId,
    installerId,
    leadOfferId: offerId,
    amount: offer.offerPrice * 100,
    currency: "AUD",
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Create invoice for lead purchase (alternative to payment intent)
 */
export async function createLeadInvoice(
  leadId: number,
  installerId: number,
  offerId: number
): Promise<{ invoiceUrl: string; invoiceId: string }> {
  const lead = await db.getLeadById(leadId);
  if (!lead) {
    throw new Error("Lead not found");
  }

  const offer = await db.getLeadOfferById(offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }

  const customerId = await getOrCreateStripeCustomer(installerId);

  // Create invoice item
  const invoiceItem = await stripe.invoiceItems.create({
    customer: customerId,
    amount: offer.offerPrice * 100,
    currency: "aud",
    description: `Solar lead - ${lead.customerName}, ${lead.suburb} ${lead.postcode}`,
  });

  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true, // Automatically finalize and attempt payment
    collection_method: "send_invoice",
    days_until_due: 7,
    metadata: {
      lead_id: leadId.toString(),
      installer_id: installerId.toString(),
      offer_id: offerId.toString(),
    },
  });

  // Finalize invoice
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  // Create transaction record
  await db.createTransaction({
    leadId,
    installerId,
    leadOfferId: offerId,
    amount: offer.offerPrice * 100,
    currency: "AUD",
    stripeInvoiceId: invoice.id,
    status: "pending",
  });

  return {
    invoiceUrl: finalizedInvoice.hosted_invoice_url!,
    invoiceId: invoice.id,
  };
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(paymentIntentId: string): Promise<void> {
  // Find transaction by payment intent ID
  const allTransactions = await db.getAllTransactions(1000);
  const transaction = allTransactions.find(
    (t) => t.stripePaymentIntentId === paymentIntentId
  );

  if (!transaction) {
    console.error(`[Stripe] Transaction not found for payment intent ${paymentIntentId}`);
    return;
  }

  // Update transaction status
  await db.updateTransaction(transaction.id, {
    status: "succeeded",
    paidAt: new Date(),
  });

  // Update lead status to sold
  await db.updateLead(transaction.leadId, {
    status: "sold",
  });

  console.log(
    `[Stripe] Payment succeeded for lead ${transaction.leadId}, installer ${transaction.installerId}`
  );
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailed(
  paymentIntentId: string,
  failureReason: string
): Promise<void> {
  const allTransactions = await db.getAllTransactions(1000);
  const transaction = allTransactions.find(
    (t) => t.stripePaymentIntentId === paymentIntentId
  );

  if (!transaction) {
    console.error(`[Stripe] Transaction not found for payment intent ${paymentIntentId}`);
    return;
  }

  await db.updateTransaction(transaction.id, {
    status: "failed",
    metadata: JSON.stringify({ failureReason }),
  });

  // Revert offer status to pending
  await db.updateLeadOffer(transaction.leadOfferId, {
    status: "pending",
  });

  // Revert lead status to offered
  await db.updateLead(transaction.leadId, {
    status: "offered",
  });

  console.log(`[Stripe] Payment failed for lead ${transaction.leadId}: ${failureReason}`);
}

/**
 * Process refund for a transaction
 */
export async function refundTransaction(transactionId: number): Promise<void> {
  const transaction = await db.getTransactionById(transactionId);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status !== "succeeded") {
    throw new Error("Can only refund successful transactions");
  }

  if (!transaction.stripePaymentIntentId && !transaction.stripeChargeId) {
    throw new Error("No Stripe payment ID found");
  }

  // Create refund
  const refund = await stripe.refunds.create({
    payment_intent: transaction.stripePaymentIntentId || undefined,
    charge: transaction.stripeChargeId || undefined,
  });

  // Update transaction status
  await db.updateTransaction(transactionId, {
    status: "refunded",
    metadata: JSON.stringify({ refundId: refund.id }),
  });

  console.log(`[Stripe] Refund processed for transaction ${transactionId}`);
}

export { stripe };
