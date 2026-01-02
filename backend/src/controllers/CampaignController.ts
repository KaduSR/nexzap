// cspell:disable
import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListCampaignsService from "../services/CampaignService/ListCampaignsService";
import CreateCampaignService from "../services/CampaignService/CreateCampaignService";
import UpdateCampaignService from "../services/CampaignService/UpdateCampaignService";
import DeleteCampaignService from "../services/CampaignService/DeleteCampaignService";

import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
};

interface CampaignData {
  name: string;
  status: string;
  confirmation: boolean;
  scheduledAt: string;
  companyId: number;
  contactListId: number;
  message1?: string;
  message2?: string;
  message3?: string;
  mediaPath?: string;
  mediaName?: string;
}

export const index = async (req: any, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  // Agora o serviço aceita parâmetros e retorna objeto paginado
  const { campaigns, count, hasMore } = await ListCampaignsService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ campaigns, count, hasMore });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as CampaignData;

  const schema = Yup.object().shape({
    name: Yup.string().required(),
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const campaign = await CreateCampaignService({
    campaignData: data, // Corrigido de 'data' para 'campaignData'
    companyId,
  });

  return res.status(200).json(campaign);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const data = req.body as CampaignData;
  const { id } = req.params;

  const campaign = await UpdateCampaignService({
    campaignData: data,
    campaignId: id,
    companyId,
  });

  return res.status(200).json(campaign);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  await DeleteCampaignService({
    id,
    companyId,
  });

  return res.status(200).json({ message: "Campaign deleted" });
};
