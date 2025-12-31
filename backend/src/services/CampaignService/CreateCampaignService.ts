import { Campaign } from "../../database/models/Campaign.model";

interface Request {
  name: string;
  message1?: string;
  scheduledAt: string;
  companyId: number;
  status?: string;
}

const CreateCampaignService = async ({
  name,
  message1,
  scheduledAt,
  companyId,
  status,
}: Request): Promise<Campaign> => {
  // Assume default whatsappId 1 for simplification in calendar creation
  const campaign = await (Campaign as any).create({
    name,
    message1,
    scheduledAt,
    status: status || "SCHEDULED",
    whatsappId: 1,
  });

  return campaign;
};

export default CreateCampaignService;
