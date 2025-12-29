
import { Request, Response } from "express";
import { SendWhatsAppMedia } from "../services/WbotServices/SendWhatsAppMedia";
import { getWbot } from "../libs/wbot";
import Ticket from "../models/Ticket";

export const store = async (req: any, res: any) => {
  const { ticketId } = req.params;
  const { body, quotedMsg } = req.body;
  const medias = req.files as any[];

  const ticket = await (Ticket as any).findByPk(ticketId, { include: ["contact"] });
  if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
  }

  const wbot = getWbot(ticket.whatsappId);

  // 1. Enviar Arquivos
  if (medias) {
    await Promise.all(
      medias.map(async (media) => {
        await SendWhatsAppMedia({ media, ticket, body, wbot: wbot as any });
      })
    );
  }

  // 2. Enviar Texto (se houver e não for legenda da imagem apenas)
  if (body && !medias) {
      await wbot.sendMessage(ticket.contact.remoteJid, { text: body });
  }

  return res.send();
};