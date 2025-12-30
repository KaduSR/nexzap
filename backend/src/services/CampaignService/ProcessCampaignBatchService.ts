import { Op } from "sequelize";
import Campaign from "../../database/models/Campaign";
import CampaignShipping from "../../database/models/CampaignShipping";
import Contact from "../../database/models/Contact";
import { logger } from "../../utils/logger";
import ProcessCampaignMessageService from "./ProcessCampaignMessageService";

export const ProcessCampaignBatchService = async (): Promise<void> => {
  // 1. Buscar Campanhas Ativas e Agendadas para AGORA ou ANTES
  const campaigns = await (Campaign as any).findAll({
    where: {
      status: "SCHEDULED", // Ou "PROCESSING"
      scheduledAt: {
        [Op.lte]: new Date(), // Agendado para agora ou passado
      },
    },
    include: [{ model: CampaignShipping, include: [Contact] }], // Incluir contactos
  });

  if (campaigns.length === 0) return;

  logger.info(`Found ${campaigns.length} campaigns to process.`);

  // 2. Processar cada campanha
  for (const campaign of campaigns) {
    // Mudar status para PROCESSANDO para não ser pega por outro worker
    if (campaign.status === "SCHEDULED") {
      await campaign.update({ status: "PROCESSING" });
    }

    // Filtrar apenas envios pendentes
    const pendingShippings = await (CampaignShipping as any).findAll({
      where: {
        campaignId: campaign.id,
        deliveredAt: null,
        confirmationRequested: false, // Supondo que false = pendente inicial
      },
      include: [Contact],
      limit: 10, // IMPORTANTE: Processar em pequenos lotes para não sobrecarregar
    });

    if (pendingShippings.length === 0) {
      // Se não há mais pendentes, finalizar campanha
      await campaign.update({ status: "FINISHED", completedAt: new Date() });
      continue;
    }

    // 3. Disparar envios (Serializado para respeitar os Delays)
    // NÃO usar Promise.all aqui, pois queremos que os delays sejam sequenciais
    for (const shipping of pendingShippings) {
      // Verifica se a campanha não foi pausada/cancelada no meio do processo
      const currentCampaignStatus = await (Campaign as any).findByPk(
        campaign.id
      );
      if (currentCampaignStatus?.status === "CANCELED") {
        logger.warn(`Campaign ${campaign.name} canceled manually.`);
        break;
      }

      await ProcessCampaignMessageService({
        campaign: campaign,
        campaignShipping: shipping,
      });
    }
  }
};
