import { Request, Response } from "express";
import Stripe from "stripe";
import Company from "../models/Company";
import { logger } from "../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", { apiVersion: "2023-10-16" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
  let event: Stripe.Event = req.body;

  // Verify Signature if Secret is provided
  if (endpointSecret) {
      const sig = req.headers["stripe-signature"] as string;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        logger.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  }

  try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          await handleSubscriptionCreated(session);
          break;
        
        case "invoice.payment_succeeded":
          // Subscription renewed OR First payment via Invoice (Pix flow)
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(invoice);
          break;

        case "customer.subscription.deleted":
        case "customer.subscription.updated":
          const subscription = event.data.object as Stripe.Subscription;
          // If canceled or unpaid (and not incomplete which is the starting state for Pix)
          if (subscription.status === 'canceled' || (subscription.status === 'unpaid')) {
              await handleSubscriptionDeleted(subscription);
          }
          break;

        case "invoice.payment_failed":
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handlePaymentFailed(failedInvoice);
          break;
      }
  } catch (err) {
      logger.error(`Error processing webhook: ${err}`);
      // Don't return 500 to Stripe, or it will retry endlessly
  }

  return res.json({ received: true });
};

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const companyId = session.subscription_data?.metadata?.companyId || session.metadata?.companyId;
  const planId = session.subscription_data?.metadata?.planId || session.metadata?.planId;

  if (companyId && session.subscription) {
     const company = await (Company as any).findByPk(companyId);
     const nextMonth = new Date();
     nextMonth.setDate(nextMonth.getDate() + 30);

     await company?.update({
         stripeSubscriptionId: session.subscription as string,
         stripeSubscriptionStatus: 'active',
         status: true,
         planId: Number(planId),
         dueDate: nextMonth.toISOString().split('T')[0]
     });
     logger.info(`[Stripe] Company ${companyId} activated via checkout.`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const subscriptionId = invoice.subscription as string;
    
    // Find company by Stripe Customer ID
    const company = await (Company as any).findOne({ where: { stripeCustomerId: customerId } });
    
    if (company) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        await company.update({ 
            status: true,
            dueDate: nextMonth.toISOString().split('T')[0],
            stripeSubscriptionId: subscriptionId, // Ensure subscription ID is linked (important for Pix flow)
            stripeSubscriptionStatus: 'active'
        });
        logger.info(`[Stripe] Invoice paid for company ${company.id}. Subscription Active.`);
    } else {
        logger.warn(`[Stripe] Invoice paid but Company not found for Customer ${customerId}`);
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const company = await (Company as any).findOne({ where: { stripeCustomerId: customerId } });
    
    if(company) {
        await company.update({ status: false, stripeSubscriptionStatus: 'past_due' });
        logger.warn(`[Stripe] Payment failed for company ${company.id}. Blocked.`);
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const company = await (Company as any).findOne({ where: { stripeCustomerId: customerId } });
    
    if(company) {
        await company.update({ status: false, stripeSubscriptionStatus: 'canceled' });
        logger.warn(`[Stripe] Subscription canceled for company ${company.id}. Blocked.`);
    }
}