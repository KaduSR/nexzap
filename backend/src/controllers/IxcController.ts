// cspell:disable
import { Response } from "express";
import { Invoice, Setting } from "../database/models/";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import IxcClient from "../services/IxcService/IxcClient";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const ixcToken = await Setting.findOne({
    where: { key: "ixc_token", companyId },
  });
  const ixcUrl = await Setting.findOne({
    where: { key: "ixc_url", companyId },
  });

  if (!ixcToken?.value || !ixcUrl?.value) {
    throw new AppError("IXC credentials not found", 400);
  }

  const ixc = new IxcClient(ixcToken.value, ixcUrl.value);

  try {
    const customers = await ixc.getClientByCpf((req.query.cpf as string) || "");
    return res.json(customers);
  } catch (error) {
    throw new AppError("Error fetching IXC customers");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  return res.json({ message: "Not implemented yet" });
};

export const getOsParams = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res.json({
    message: "Not implemented yet",
  });
};

export const webhookPayment = async (
  req: any,
  res: Response
): Promise<Response> => {
  const body = req.body as any;
  const { id_fatura, status, valor_pago } = body;

  console.log("⚠️ [IXC WEBHOOK] Recebido:", body);

  if (!id_fatura) {
    return res.status(400).json({ error: "Missing Invoice ID" });
  }

  const invoice = await Invoice.findOne({
    where: {
      ixcId: id_fatura,
    },
  });

  if (invoice) {
    await invoice.update({
      status: "paid",
      value: valor_pago || invoice.value,
      paidAt: new Date(),
    });

    const io = getIO();
    io.emit(`company-${invoice.companyId}-payment`, {
      action: "received",
      invoice,
    });

    return res.json({ message: "Invoice updated successfully" });
  }

  return res.json({ message: "Invoice not found locally, ignored." });
};
