// cspell:disable
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import { Campaign } from "../../database/models/Campaign.model";

interface CampaignData {
  name: string;
  status?: string;
  confirmation?: boolean;
  scheduledAt?: string;
  companyId: number;
  contactListId?: number;
  message1?: string;
  message2?: string;
  message3?: string;
  mediaPath?: string;
  mediaName?: string;
}

interface Request {
  campaignData: CampaignData;
  companyId: number;
}

const CreateCampaignService = async ({
  campaignData,
  companyId,
}: Request): Promise<Campaign> => {
  const { name } = campaignData;

  const campaignSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "ERR_CAMPAIGN_NAME_INVALID")
      .required("ERR_CAMPAIGN_NAME_REQUIRED"),
  });

  try {
    await campaignSchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verifica status agendado
  if (campaignData.scheduledAt) {
    campaignData.status = "SCHEDULED";
  }

  const campaign = await Campaign.create({
    ...campaignData,
    companyId,
  });

  return campaign;
};

export default CreateCampaignService;
