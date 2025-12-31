import { Response } from "express";
import Stripe from "stripe";
import { Company } from "../database/models/Company.model";
import { Plan } from "../database/models/Plan.model";
import AppError from "../errors/AppError";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
});

export const createCheckoutSession = async (
  req: any,
  res: Response
): Promise<Response> => {
  const { planId, frontendUrl, paymentMethod } = req.body;
  const { companyId } = req.user;

  const company = await (Company as any).findByPk(companyId);
  const plan = await (Plan as any).findByPk(planId);

  if (!company) throw new AppError("Company not found", 404);
  if (!plan) throw new AppError("Plan not found", 404);

  // 1. Criar ou Recuperar Cliente Stripe
  let customerId = company.stripeCustomerId;

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
        metadata: { companyId: company.id.toString() },
      });
      customerId = customer.id;
      await company.update({ stripeCustomerId: customerId });
    } catch (e) {
      // Mock fallback para dev sem chave
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({
          url: `${frontendUrl}/subscription?status=success&mock=true`,
        });
      }
      throw new AppError("Could not create Stripe customer", 500);
    }
  }

  const priceId = plan.stripePriceId || "price_mock_id";

  try {
    // =========================================================
    // FLUXO PIX / BOLETO (Via Fatura Recorrente)
    // =========================================================
    if (paymentMethod === "pix") {
      // O Stripe Checkout para 'subscription' não suporta Pix nativamente se não for automático.
      // A solução é criar a assinatura com collection_method='send_invoice'.

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        collection_method: "send_invoice", // Chave para permitir Pix/Boleto
        days_until_due: 3, // Vence em 3 dias
        payment_behavior: "default_incomplete", // Cria a assinatura mesmo sem pagar agora
        metadata: {
          companyId: company.id.toString(),
          planId: plan.id.toString(),
          paymentType: "pix_invoice",
        },
        expand: ["latest_invoice"], // Retorna a fatura já criada
      });

      // Pegamos o link da fatura hospedada
      const invoice = subscription.latest_invoice as Stripe.Invoice;

      if (invoice && invoice.hosted_invoice_url) {
        // Redireciona o usuário para pagar a fatura
        return res.json({ url: invoice.hosted_invoice_url });
      } else {
        throw new AppError("Invoice URL not generated");
      }
    }

    // =========================================================
    // FLUXO CARTÃO DE CRÉDITO (Padrão Checkout)
    // =========================================================
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/subscription?status=success`,
      cancel_url: `${frontendUrl}/subscription?status=canceled`,
      subscription_data: {
        metadata: {
          companyId: company.id.toString(),
          planId: plan.id.toString(),
        },
      },
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        url: `${frontendUrl}/subscription?status=success&mock=true`,
      });
    }
    throw new AppError(`Stripe Error: ${err.message}`, 400);
  }
};
