import { Request, Response } from "express";
import Stripe from "stripe";
import Company from "../models/Company";
import { logger } from "../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", { apiVersion: "2025-02-24.acacia" });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
  let event: Stripe.Event = req.body;

  // Verificar Assinatura se houver Secret
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
        // FLUXO CARTÃO: Checkout completado
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          await handleSubscriptionCreated(session);
          break;
        
        // FLUXO PIX/BOLETO: Fatura paga
        case "invoice.payment_succeeded":
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(invoice);
          break;

        case "customer.subscription.deleted":
        case "customer.subscription.updated":
          const subscription = event.data.object as Stripe.Subscription;
          if (subscription.status === 'canceled' || (subscription.status === 'unpaid' && subscription.latest_invoice)) {
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
  }

  return res.json({ received: true });
};

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const companyId = session.subscription && typeof session.subscription === 'object' ? session.subscription.metadata?.companyId : session.metadata?.companyId;
  const planId = session.subscription && typeof session.subscription === 'object' ? session.subscription.metadata?.planId : session.metadata?.planId;

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
    
    // Busca empresa pelo Stripe Customer ID
    const company = await (Company as any).findOne({ where: { stripeCustomerId: customerId } });
    
    if (company) {
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        // Ativa a empresa e renova o vencimento
        await company.update({ 
            status: true,
            dueDate: nextMonth.toISOString().split('T')[0],
            stripeSubscriptionId: subscriptionId, 
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