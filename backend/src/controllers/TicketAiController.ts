import { Request, Response } from "express";
import AnalyzeTicketService from "../services/AiServices/AnalyzeTicketService";

export const show = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  try {
      const analysis = await AnalyzeTicketService(Number(ticketId), companyId);
      return res.json(analysis);
  } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      return res.status(500).json({ error: message });
  }
};