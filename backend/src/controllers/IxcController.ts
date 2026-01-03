// cspell: disable
import { Invoice } from "../database/models/Invoice.model";
import { Setting } from "../database/models/Setting.model";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import IxcClient from "../services/IxcService/IxcClient";
import { Request, Response } from "express";

// Observe o uso de 'Request' e 'Response'
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = (req as any).user;

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
    const cpf = (req.query.cpf as string) || "";
    const customers = await ixc.getClientByCpf(cpf);
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
  return res.json({ subjects: [], technicians: [] });
};

export const createOs = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = (req as any).user;
  const data = req.body;

  return res.json({ message: "OS Created (Mock)", data });
};

export const webhookPayment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const body = req.body;
  const { id_fatura, valor_pago } = body;

  console.log("⚠️ [IXC WEBHOOK] Recebido:", body);

  if (!id_fatura) {
    return res.status(400).json({ error: "Missing Invoice ID" });
  }

  const invoice = await Invoice.findOne({ where: { ixcId: id_fatura } });

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
