import { Request, Response } from "express";
import Stripe from "stripe";
import AppError from "../errors/AppError";
import Company from "../models/Company";
import Plan from "../models/Plan";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2023-10-16",
});

export const createCheckoutSession = async (req: any, res: Response): Promise<Response> => {
  const { planId, frontendUrl, paymentMethod } = req.body;
  const { companyId } = req.user;

  const company = await (Company as any).findByPk(companyId);
  const plan = await (Plan as any).findByPk(planId);

  if (!company) throw new AppError("Company not found", 404);
  if (!plan) throw new AppError("Plan not found", 404);
  
  // 1. Create or Retrieve Stripe Customer
  let customerId = company.stripeCustomerId;

  if (!customerId) {
    try {
        const customer = await stripe.customers.create({
            email: company.email,
            name: company.name,
            metadata: { companyId: company.id.toString() }
        });
        customerId = customer.id;
        await company.update({ stripeCustomerId: customerId });
    } catch (e) {
        // Mock fallback for dev without stripe key
        if (!process.env.STRIPE_SECRET_KEY) {
             return res.json({ url: `${frontendUrl}/subscription?status=success&mock=true` });
        }
        throw new AppError("Could not create Stripe customer", 500);
    }
  }

  const priceId = plan.stripePriceId || "price_mock_id";

  try {
      // ---------------------------------------------------------
      // FLUXO PIX / BOLETO (Recurring Invoice)
      // ---------------------------------------------------------
      if (paymentMethod === "pix") {
          // Creates a subscription that emails the invoice. 
          // We also fetch the first invoice immediately to redirect the user to pay it.
          const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: priceId }],
              collection_method: 'send_invoice', // Key for Pix/Boleto support in recurring
              days_until_due: 3, // Due in 3 days
              payment_behavior: 'default_incomplete', // Create even if not paid yet
              metadata: { 
                  companyId: company.id.toString(), 
                  planId: plan.id.toString(),
                  paymentType: "pix_invoice"
              },
              expand: ['latest_invoice']
          });

          // Get the hosted invoice URL to redirect the user
          const invoice = subscription.latest_invoice as Stripe.Invoice;
          
          if (invoice && invoice.hosted_invoice_url) {
              return res.json({ url: invoice.hosted_invoice_url });
          } else {
              throw new AppError("Invoice URL not generated");
          }
      } 

      // ---------------------------------------------------------
      // FLUXO CARTÃO DE CRÉDITO (Checkout Session)
      // ---------------------------------------------------------
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer: customerId,
        line_items: [{ 
            price: priceId, 
            quantity: 1 
        }],
        success_url: `${frontendUrl}/subscription?status=success`,
        cancel_url: `${frontendUrl}/subscription?status=canceled`,
        subscription_data: {
          metadata: { 
              companyId: company.id.toString(), 
              planId: plan.id.toString() 
          }
        }
      });

      return res.json({ url: session.url });

  } catch (err: any) {
      console.error(err);
      if (!process.env.STRIPE_SECRET_KEY) {
          return res.json({ url: `${frontendUrl}/subscription?status=success&mock=true` });
      }
      throw new AppError(`Stripe Error: ${err.message}`, 400);
  }
};