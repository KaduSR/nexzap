
import fs from "fs";
import path from "path";
import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../../errors/AppError";

interface Request {
  media: any;
  ticket: any; // Ticket Model
  body?: string;
  wbot: WASocket;
}

export const SendWhatsAppMedia = async ({ media, ticket, body, wbot }: Request) => {
  try {
    const filePath = path.resolve("public", media.filename);
    const fileMimeType = media.mimetype;

    // Detecta tipo de mensagem
    let messageType: any = "document";
    let messageContent: any;

    if (fileMimeType.includes("image")) {
        messageType = "image";
        messageContent = { image: fs.readFileSync(filePath), caption: body };
    } else if (fileMimeType.includes("audio")) {
        messageType = "audio";
        messageContent = { audio: fs.readFileSync(filePath), mimetype: 'audio/mp4', ptt: true };
    } else if (fileMimeType.includes("video")) {
        messageType = "video";
        messageContent = { video: fs.readFileSync(filePath), caption: body };
    } else {
        messageContent = { document: fs.readFileSync(filePath), mimetype: fileMimeType, fileName: media.originalname };
    }

    const sentMessage = await wbot.sendMessage(
      ticket.contact.remoteJid,
      messageContent
    );

    return sentMessage;
  } catch (err) {
    console.error(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};
