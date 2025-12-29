import { Request, Response } from "express";
import GetFinancialDataService from "../services/FinancialServices/GetFinancialDataService";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = await GetFinancialDataService(companyId);
  return res.json(data);
};