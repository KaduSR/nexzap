import { Request, Response } from "express";
import * as IxcService from "../services/IxcService";
import Invoice from "../models/Invoice";
import { getIO } from "../libs/socket";

export const index = async (req: any, res: any) => {
  const { status } = req.query; // active, blocked, or all

  try {
    const customers = await IxcService.getCustomers(status as any);
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar clientes no IXC." });
  }
};

export const show = async (req: any, res: any) => {
  const { cpf } = req.params;
  
  try {
     const customer = await IxcService.getCustomerByCpf(cpf);
     return res.json(customer);
  } catch (err) {
     return res.status(500).json({ error: "Erro ao buscar cliente." });
  }
};

export const getOsParams = async (req: any, res: any) => {
    try {
        const subjects = await IxcService.getOsSubjects();
        const departments = await IxcService.getOsDepartments();
        return res.json({ subjects, departments });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao buscar parâmetros do IXC." });
    }
};

export const createOs = async (req: any, res: any) => {
    const { subjectId, departmentId, priority, description, contractId, shift, address } = req.body;

    try {
        const result = await IxcService.createServiceOrder({
            subjectId,
            departmentId,
            priority,
            description,
            contractId,
            shift,
            address
        });
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: "Erro ao criar O.S. no IXC." });
    }
};

export const webhookPayment = async (req: any, res: Response) => {
    const { id_fatura, status, valor_pago } = req.body;
    const companyId = 1; // Fixed for demo

    console.log("[Webhook] Received Payment Notification:", req.body);

    if (status === "Recebido" || status === "Pago") {
        const invoice = await (Invoice as any).findOne({ where: { id: id_fatura } });

        if (invoice) {
            await invoice.update({
                status: "paid",
                value: valor_pago,
                paidAt: new Date()
            });

            // Notify Frontend
            getIO().emit(`company-${companyId}-payment`, {
                action: "received",
                invoice
            });
        }
    }

    return res.status(200).send("OK");
};