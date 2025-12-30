import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg,
}: Request): Promise<any> => {
  try {
    const wbot = getWbot(ticket.whatsappId);
    const remoteJid =
      ticket.contact.number + (ticket.isGroup ? "@g.us" : "@s.whatsapp.net");

    // Envio nativo do Baileys
    const sentMessage = await wbot.sendMessage(remoteJid, {
      text: body,
    });

    await (ticket as any).update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.error(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
