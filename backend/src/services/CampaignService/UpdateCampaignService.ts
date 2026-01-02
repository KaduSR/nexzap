// cspell:disable
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { Campaign } from "../../database/models/Campaign.model";

interface CampaignData {
  name: string;
  start?: string;
  message1?: string;
  message2?: string;
  message3?: string;
  mediaUrl?: string;
  mediaType?: string;
  whatsappId?: number;
  scheduledAt?: string;
  status?: string;
}

interface Request {
  campaignData: CampaignData;
  campaignId: string | number;
  companyId: number;
}

const UpdateCampaignService = async ({
  campaignData,
  campaignId,
  companyId,
}: Request): Promise<Campaign> => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    message1: Yup.string(),
  });

  try {
    await schema.validate(campaignData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId },
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  // Se agendamento foi alterado, verificar status
  if (
    campaignData.scheduledAt &&
    campaignData.scheduledAt !== "" &&
    campaignData.scheduledAt !== null
  ) {
    campaignData.status = "SCHEDULED";
  } else if (campaignData.status === "PENDING" && !campaignData.scheduledAt) {
    campaignData.scheduledAt = null;
  }

  await campaign.update(campaignData);

  return campaign;
};

export default UpdateCampaignService;
