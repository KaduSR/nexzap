// cspell:disable
import { Campaign } from "../../database/models/Campaign.model";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const DeleteCampaignService = async ({
  id,
  companyId,
}: Request): Promise<void> => {
  const campaign = await Campaign.findOne({
    where: { id, companyId },
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  // Opcional: Impedir deletar se estiver em processamento
  if (campaign.status === "PROCESSING") {
    throw new AppError("Cannot delete campaign while processing", 400);
  }

  await campaign.destroy();
};

export default DeleteCampaignService;
