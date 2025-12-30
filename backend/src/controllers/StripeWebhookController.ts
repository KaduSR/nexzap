// cSpell: disable
import { Request, Response } from "express";
import Stripe from "stripe";
// IMPORTANTE: Usamos 'as InvoiceModel' para não conflitar com o tipo do Stripe
import Company from "../database/models/Company.model";
import { logger } from "../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let event: Stripe.Event = req.body;

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
        // Aqui 'stripeInvoice' é garantidamente do Stripe
        const stripeInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(stripeInvoice);
        break;

      case "customer.subscription.deleted":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;
        if (
          subscription.status === "canceled" ||
          (subscription.status === "unpaid" && subscription.latest_invoice)
        ) {
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
  const companyId = session.metadata?.companyId;
  const planId = session.metadata?.planId;

  if (companyId) {
    const company = await Company.findByPk(companyId);
    if (company) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      // Pega o ID da subscrição de forma segura
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      await company.update({
        stripeSubscriptionId: subId,
        stripeSubscriptionStatus: "active",
        status: true,
        planId: Number(planId),
        dueDate: nextMonth,
      });
      logger.info(`[Stripe] Company ${companyId} activated via checkout.`);
    }
  }
}

async function handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
  const customerId = stripeInvoice.customer as string;
  // O Stripe chama de 'subscription'. O TypeScript agora aceita porque a variável é stripeInvoice
  const subscriptionId = (stripeInvoice as any).subscription as string;

  const company = await Company.findOne({
    where: { stripeCustomerId: customerId },
  });

  if (company) {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    await company.update({
      status: true,
      dueDate: nextMonth,
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: "active",
    });

    // SE você quiser salvar a fatura no seu banco agora, use InvoiceModel:
    /*
    await InvoiceModel.create({
        value: stripeInvoice.amount_paid / 100,
        status: 'paid',
        stripeSubscriptionId: subscriptionId,
        companyId: company.id
        // ... outros campos
    });
    */

    logger.info(
      `[Stripe] Invoice paid for company ${company.id}. Subscription Active.`
    );
  }
}

async function handlePaymentFailed(stripeInvoice: Stripe.Invoice) {
  const customerId = stripeInvoice.customer as string;
  const company = await Company.findOne({
    where: { stripeCustomerId: customerId },
  });

  if (company) {
    await company.update({
      status: false,
      stripeSubscriptionStatus: "past_due",
    });
    logger.warn(`[Stripe] Payment failed for company ${company.id}. Blocked.`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const company = await Company.findOne({
    where: { stripeCustomerId: customerId },
  });

  if (company) {
    await company.update({
      status: false,
      stripeSubscriptionStatus: "canceled",
    });
    logger.warn(
      `[Stripe] Subscription canceled for company ${company.id}. Blocked.`
    );
  }
}
