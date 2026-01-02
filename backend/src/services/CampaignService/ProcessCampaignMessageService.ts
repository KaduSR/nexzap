import { Campaign } from "../../database/models/Campaign.model";
import { CampaignShipping } from "../../database/models/CampaignShipping.model";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import { sleepRandom } from "../../utils/sleepRandom";

interface Request {
  campaignShipping: CampaignShipping;
  campaign: Campaign;
}

// Função Auxiliar para Processar Variáveis
const getProcessedMessage = (msg: string, contact: any): string => {
  let finalMessage = msg;

  // 1. Variáveis do Contato
  // Suporta tanto {nome} quanto {{name}} para compatibilidade
  finalMessage = finalMessage.replace(/{nome}|{{name}}/gi, contact.name || "");
  finalMessage = finalMessage.replace(
    /{email}|{{email}}/gi,
    contact.email || ""
  );
  finalMessage = finalMessage.replace(
    /{telefone}|{{phone}}/gi,
    contact.number || ""
  );

  // 2. Variáveis de Tempo (Saudação, Data, Hora)
  const date = new Date();
  const hours = date.getHours();

  let greeting = "";
  if (hours >= 6 && hours < 12) greeting = "Bom dia";
  else if (hours >= 12 && hours < 18) greeting = "Boa tarde";
  else greeting = "Boa noite";

  finalMessage = finalMessage.replace(/{saudacao}|{{greeting}}/gi, greeting);

  // Formato PT-BR
  finalMessage = finalMessage.replace(
    /{data}|{{date}}/gi,
    date.toLocaleDateString("pt-BR")
  );
  finalMessage = finalMessage.replace(
    /{hora}|{{hour}}/gi,
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );

  return finalMessage;
};

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
    // 2. Escolha da Mensagem (Rotação de conteúdo para evitar spam)
    let body = campaign.message1 || "";
    if (campaign.message2 && Math.random() > 0.5) body = campaign.message2;
    if (campaign.message3 && Math.random() > 0.5) body = campaign.message3;

    // 3. Processamento das Variáveis (Humanização)
    const messageBody = getProcessedMessage(body, campaignShipping.contact);

    // 4. Humanização: Delay Aleatório ANTES de enviar
    // Configuração de delay (padrão seguro: 20s a 60s)
    const minDelay = 20;
    const maxDelay = 60;

    logger.info(
      `Campaign ${campaign.name}: Waiting delay for ${contactNumber}...`
    );
    await sleepRandom(minDelay, maxDelay);

    // 5. Envio com Baileys (Simulando comportamento humano)
    // Envia presença "Digitando..."
    await wbot.sendPresenceUpdate("composing", remoteJid);

    // Simula tempo de digitação baseado no tamanho da mensagem (aprox 50ms por char, min 2s)
    const typingDuration = Math.max(2000, messageBody.length * 50);
    await sleepRandom(typingDuration / 1000, typingDuration / 1000 + 2);

    // Envio da Mensagem
    await wbot.sendMessage(remoteJid, { text: messageBody });

    // Pausa a presença "Digitando"
    await wbot.sendPresenceUpdate("paused", remoteJid);

    // 6. Atualizar Registo de Envio
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
