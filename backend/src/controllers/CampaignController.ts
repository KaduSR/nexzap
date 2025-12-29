import { Request, Response } from "express";
import ListCampaignsService from "../services/CampaignService/ListCampaignsService";
import CreateCampaignService from "../services/CampaignService/CreateCampaignService";

export const index = async (req: any, res: Response): Promise<Response> => {
  const campaigns = await ListCampaignsService();
  return res.json(campaigns);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { name, message1, scheduledAt, status } = req.body;
  const { companyId } = req.user;

  const campaign = await CreateCampaignService({
    name,
    message1,
    scheduledAt,
    companyId,
    status
  });

  return res.status(200).json(campaign);
};