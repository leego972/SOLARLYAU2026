/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for payment tracking
 */

import { Express, Request, Response } from "express";
import express from "express";
import { stripe, handlePaymentSuccess, handlePaymentFailed } from "./stripe";

/**
 * Register Stripe webhook endpoint
 * MUST be called before express.json() middleware
 */
export function registerStripeWebhook(app: Express) {
  // Webhook endpoint with raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        console.error("[Webhook] No signature provided");
        return res.status(400).send("No signature");
      }

      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).send("Webhook secret not configured");
      }

      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({
          verified: true,
        });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      try {
        // Handle different event types
        switch (event.type) {
          case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent.id);
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const failureMessage =
              paymentIntent.last_payment_error?.message || "Unknown error";
            await handlePaymentFailed(paymentIntent.id, failureMessage);
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as any;
            if (invoice.payment_intent && typeof invoice.payment_intent === "string") {
              await handlePaymentSuccess(invoice.payment_intent);
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as any;
            if (invoice.payment_intent && typeof invoice.payment_intent === "string") {
              await handlePaymentFailed(
                invoice.payment_intent,
                "Invoice payment failed"
              );
            }
            break;
          }

          case "customer.created": {
            const customer = event.data.object;
            console.log(`[Webhook] Customer created: ${customer.id}`);
            break;
          }

          case "charge.succeeded": {
            const charge = event.data.object;
            console.log(`[Webhook] Charge succeeded: ${charge.id}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error) {
        console.error(`[Webhook] Error processing event ${event.type}:`, error);
        res.status(500).send("Webhook processing failed");
      }
    }
  );

  console.log("[Webhook] Stripe webhook endpoint registered at /api/stripe/webhook");
}
