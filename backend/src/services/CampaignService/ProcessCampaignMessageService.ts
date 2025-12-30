import Campaign from "../../database/models/Campaign";
import CampaignShipping from "../../database/models/CampaignShipping";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import { sleepRandom } from "../../utils/sleepRandom";

interface Request {
  campaignShipping: CampaignShipping;
  campaign: Campaign;
}

const ProcessCampaignMessageService = async ({
  campaignShipping,
  campaign,
}: Request): Promise<void> => {
  // 1. Verificar se o contacto e o número são válidos
  if (!campaignShipping.contact) {
    await (campaignShipping as any).update({
      deliveredAt: new Date(),
      confirmationRequested: true,
    }); // Marca como erro/ignorado
    return;
  }

  const wbot = getWbot(campaign.whatsappId);
  const contactNumber = campaignShipping.contact.number;

  // Formatar para o padrão do Baileys (jid)
  const remoteJid = `${contactNumber}@${
    contactNumber.length > 13 ? "g.us" : "s.whatsapp.net"
  }`;

  try {
    // 2. Humanização: Substituição de Variáveis (Evita Hash de Spam)
    // Ex: "Olá {{name}}, tudo bem?" vira "Olá Kadu, tudo bem?"
    let body = campaign.message1 || "";
    if (campaign.message2 && Math.random() > 0.5) body = campaign.message2; // Alterna mensagens se houver
    if (campaign.message3 && Math.random() > 0.5) body = campaign.message3;

    const messageBody = body.replace(
      /{{\s*name\s*}}/gi,
      campaignShipping.contact.name || "Cliente"
    );

    // 3. Humanização: Delay Aleatório ANTES de enviar
    // Lê as configurações da campanha ou usa padrão seguro (20s a 60s)
    const minDelay = 20;
    const maxDelay = 60;

    logger.info(
      `Campaign ${campaign.name}: Waiting delay for ${contactNumber}...`
    );
    await sleepRandom(minDelay, maxDelay);

    // 4. Envio com Baileys (Com suporte a presença "composing")
    // Note: presenceSubscribe is sometimes optional depending on baileys version, but good practice
    // await wbot.presenceSubscribe(remoteJid);
    await wbot.sendPresenceUpdate("composing", remoteJid); // Aparece "Digitando..."

    // Simula tempo de digitação baseado no tamanho da mensagem (aprox 50ms por char)
    await sleepRandom(1, 3);

    // Envio da Mensagem
    await wbot.sendMessage(remoteJid, { text: messageBody });

    await wbot.sendPresenceUpdate("paused", remoteJid);

    // 5. Atualizar Registo de Envio
    await (campaignShipping as any).update({
      deliveredAt: new Date(),
      confirmationRequested: false, // Indica sucesso
    });

    logger.info(`Campaign sent to: ${contactNumber}`);
  } catch (err) {
    logger.error(`Error sending campaign message to ${contactNumber}: ${err}`);

    // Atualizar erro no banco
    await (campaignShipping as any).update({
      deliveredAt: null as any, // Não entregue
      confirmationRequested: true, // Flag de erro
    });
  }
};

export default ProcessCampaignMessageService;
