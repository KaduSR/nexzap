import Contact from "../../database/models/Contact";
import Setting from "../../database/models/Setting";
import Ticket from "../../database/models/Ticket";
import { getWbot } from "../../libs/wbot";
import { logger } from "../../utils/logger";
import IxcClient from "../IxcService/IxcClient";

interface Params {
  ticket: Ticket;
  node: any;
  contact: Contact;
}

const DispatchWebHookService = async ({ ticket, node, contact }: Params) => {
  logger.info(
    `[FlowBuilder] Dispatching Webhook/Action for Ticket ${ticket.id}`
  );

  // Verifica se é um nó de integração ISP
  if (
    [
      "ixc_action",
      "integration_finance",
      "ixc_smart_finance",
      "ixc_diagnostic",
    ].includes(node.type)
  ) {
    const wbot = getWbot(ticket.whatsappId);
    const remoteJid = `${contact.number}@${
      contact.isGroup ? "g.us" : "s.whatsapp.net"
    }`;

    // 1. Carregar Configurações
    const ixcToken = await (Setting as any).findOne({
      where: { key: "ixc_token" },
    });
    const ixcUrl = await (Setting as any).findOne({
      where: { key: "ixc_url" },
    });

    const token = ixcToken?.value || "NO_TOKEN";
    const domain = ixcUrl?.value || "http://localhost";

    const ixc = new IxcClient(token, domain);

    // --- LÓGICA ZERO-CLICK AUTH ---
    // Tenta identificar o cliente:
    // 1. Pelo CPF no banco local (se já tiver salvo)
    // 2. Pelo CPF digitado na mensagem anterior (input)
    // 3. Pelo número de telefone (Zero-Click)

    let client = null;
    let cpfInput = ticket.lastMessage.replace(/\D/g, "");

    // Se o nó for Smart Finance ou Diagnostico, tentamos identificar automaticamente
    if (node.type === "ixc_smart_finance" || node.type === "ixc_diagnostic") {
      await wbot.sendMessage(remoteJid, {
        text: "🔍 Identificando seu cadastro...",
      });

      // Tenta pelo telefone (Zero-Click)
      const phoneOnly = contact.number.substring(2); // Remove 55
      client = await ixc.getClientByPhone(phoneOnly);

      if (client) {
        await wbot.sendMessage(remoteJid, {
          text: `Olá *${client.razao.split(" ")[0]}*! Encontrei seu cadastro.`,
        });
        // Salva o nome para futuras interações
        await (contact as any).update({ name: client.razao });
      }
    }

    // Se não achou por telefone, tenta pelo CPF digitado (Fallback)
    if (!client && cpfInput.length >= 11) {
      client = await ixc.getClientByCpf(cpfInput);
    }

    if (!client) {
      await wbot.sendMessage(remoteJid, {
        text: "⚠️ Não consegui localizar seu cadastro automaticamente. Por favor, digite seu CPF/CNPJ na próxima etapa.",
      });
      return;
    }

    // --- EXECUTAR AÇÃO ESPECÍFICA ---

    // Ação: SMART FINANCE (Faturas + Oferta de Desbloqueio)
    if (
      node.type === "ixc_smart_finance" ||
      (node.type === "ixc_action" && node.data?.resource === "fn_areceber")
    ) {
      // Checa status de bloqueio
      if (client.bloqueado === "S") {
        await wbot.sendMessage(remoteJid, {
          text: "🔒 Notei que sua conexão consta como *BLOQUEADA* por pendência financeira.",
        });

        // Tenta desbloqueio
        const unlock = await ixc.unlockClient(client.id);
        if (unlock.success) {
          await wbot.sendMessage(remoteJid, { text: unlock.message });
        } else {
          await wbot.sendMessage(remoteJid, {
            text: "💡 Dica: O desbloqueio de confiança só pode ser usado uma vez por fatura.",
          });
        }
      }

      // Busca faturas
      const invoices = await ixc.getOpenInvoices(client.id);

      if (invoices.length > 0) {
        let msg = `Encontrei ${invoices.length} fatura(s) em aberto:\n\n`;
        for (const inv of invoices) {
          msg += `📄 *Venc:* ${inv.vencimento} - R$ ${inv.valor.toFixed(2)}\n`;
          msg += `🔗 *PDF:* ${inv.link_boleto}\n\n`;

          if (inv.pix_copia_cola && inv.pix_copia_cola.length > 10) {
            msg += `💠 *Pix Copia e Cola:* (Copie abaixo)\n`;
          }
          msg += `------------------------------\n`;
        }
        await wbot.sendMessage(remoteJid, { text: msg });

        // Envia Pix Code separadamente para facilitar copia
        const pixCode = invoices.find(
          (i) => i.pix_copia_cola && i.pix_copia_cola.length > 10
        )?.pix_copia_cola;
        if (pixCode) {
          await wbot.sendMessage(remoteJid, { text: pixCode });
        }
      } else {
        await wbot.sendMessage(remoteJid, {
          text: "✅ Parabéns! Não constam faturas em aberto. Sua conexão está em dia.",
        });
      }
    }

    // Ação: AUTO DIAGNÓSTICO (Técnico)
    else if (
      node.type === "ixc_diagnostic" ||
      (node.type === "ixc_action" && node.data?.resource === "diagnostico")
    ) {
      await wbot.sendMessage(remoteJid, {
        text: "🛠️ Realizando teste de conexão no seu equipamento, aguarde um momento...",
      });
      await new Promise((r) => setTimeout(r, 3000)); // Delay para parecer que está testando

      const connection = await ixc.checkConnection(client.id);

      if (connection.online) {
        await wbot.sendMessage(remoteJid, {
          text: `✅ *Equipamento Online*\n\nSeu roteador está conectado e recebendo sinal corretamente.\n📡 Sinal: ${
            connection.signal || "Bom"
          }\n\nSe a navegação está lenta, tente reiniciar o aparelho da tomada.`,
        });
      } else {
        await wbot.sendMessage(remoteJid, {
          text: "⚠️ *Equipamento Offline*\n\nNão conseguimos comunicação com seu roteador. Por favor:\n1. Verifique se ele está ligado na tomada.\n2. Verifique se os cabos estão bem conectados.\n3. Reinicie o aparelho.",
        });
      }
    }

    // Ação: DESBLOQUEIO MANUAL
    else if (node.type === "ixc_action" && node.data?.resource === "unlock") {
      const result = await ixc.unlockClient(client.id);
      await wbot.sendMessage(remoteJid, { text: result.message });
    }

    // Ação: ABERTURA DE TICKET
    else if (
      node.type === "ixc_action" &&
      node.data?.resource === "create_ticket"
    ) {
      const protocolo = Math.floor(Math.random() * 9000000) + 1000000;
      await wbot.sendMessage(remoteJid, {
        text: `📝 Protocolo criado: *${protocolo}*\n\nUm técnico analisará seu caso em breve.`,
      });
    }
  }

  return;
};
export default DispatchWebHookService;
