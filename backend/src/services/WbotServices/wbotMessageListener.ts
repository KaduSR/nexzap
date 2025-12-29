import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import { 
  downloadMediaMessage, 
  extractMessageContent, 
  proto, 
  WASocket 
} from "@whiskeysockets/baileys";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Whatsapp from "../../models/Whatsapp";
import UserRating from "../../models/UserRating";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { getBodyMessage } from "../../helpers/GetWbotMessage";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import CreateContactService from "../ContactServices/CreateContactService";
import UnifiedAiService from "../AiServices/UnifiedAiService";
import { FlowEngineService } from "../FlowBuilderService/FlowEngineService"; 
import CheckIncidentService from "../IncidentService/CheckIncidentService";
import { logger } from "../../utils/logger";
import isOutsideBusinessHours from "../../helpers/IsOutsideBusinessHours";

type Session = WASocket & {
  id?: number;
};

const verifyContact = async (msgContact: any, wbot: Session, companyId: number): Promise<Contact> => {
  let profilePicUrl: string | undefined;
  try {
    // profilePicUrl = await wbot.profilePictureUrl(msgContact.id, "image"); 
    // Baileys often fails fetching profile pic, defaulting to undefined to prevent crashes
    profilePicUrl = undefined;
  } catch (e) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name: msgContact.name || msgContact.notify || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    whatsappId: wbot.id
  };

  const contact = await CreateContactService(contactData);
  return contact;
};

const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  wbot: Session
): Promise<void> => {
  const messageContent = extractMessageContent(msg.message);
  const type = Object.keys(messageContent || {})[0];
  const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "documentMessage", "stickerMessage"];

  if (msg.key.fromMe) return;
  if (!mediaTypes.includes(type)) return;

  try {
    const buffer = await downloadMediaMessage(
      msg,
      "buffer",
      { }
    );

    const fileName = `${new Date().getTime()}.${type === "audioMessage" ? "mp3" : "jpg"}`;
    const filePath = join((process as any).cwd(), "public", fileName);
    
    const writeFileAsync = promisify(writeFile);
    await writeFileAsync(filePath, buffer);

    const messageData = {
      id: msg.key.id!,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: fileName,
      fromMe: msg.key.fromMe || false,
      mediaType: type.replace("Message", ""),
      mediaUrl: fileName,
      read: msg.key.fromMe || false,
      quotedMsgId: null,
      ack: 1,
    };

    await CreateMessageService({ messageData, companyId: 1 });

  } catch (err) {
    logger.error(`Error handling media: ${err}`);
  }
};

const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  wbot: Session
) => {
  const body = getBodyMessage(msg);

  // NPS LOGIC
  if (ticket.status === "closed" && body) {
      const rating = parseInt(body);
      if (!isNaN(rating) && rating >= 1 && rating <= 3) {
          await (UserRating as any).create({
              ticketId: ticket.id,
              companyId: ticket.companyId,
              userId: ticket.userId,
              rate: rating
          });
          await wbot.sendMessage(msg.key.remoteJid!, { text: "Obrigado pela sua avaliação!" });
          return;
      }
  }

  const messageData = {
    id: msg.key.id!,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe || false,
    mediaType: "chat",
    read: msg.key.fromMe || false,
    quotedMsgId: null,
    ack: 1,
  };

  await CreateMessageService({ messageData, companyId: 1 });
};

export const wbotMessageListener = async (
  wbot: Session,
  messageUpsert: { messages: proto.IWebMessageInfo[]; type: "append" | "notify" }
) => {
  const messages = messageUpsert.messages;
  const companyId = 1;

  for (const msg of messages) {
    if (!msg.message) continue;
    if (msg.key.remoteJid === "status@broadcast") continue;

    try {
      if (msg.key.fromMe) continue; 

      const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;
      
      const contact = await verifyContact(
        { id: msg.key.remoteJid, name: msg.pushName }, 
        wbot, 
        companyId
      );

      // --- MASS OUTAGE / PANIC MODE CHECK ---
      if (!isGroup) {
          const activeIncident = await CheckIncidentService(contact);
          if (activeIncident) {
              await wbot.sendMessage(msg.key.remoteJid!, { 
                  text: `⚠️ *Aviso de Instabilidade: ${activeIncident.title}*\n\n${activeIncident.description}` 
              });
              return; 
          }
      }

      let ticket = await (Ticket as any).findOne({
          where: { contactId: contact.id, whatsappId: wbot.id, status: "closed" },
          order: [["updatedAt", "DESC"]]
      });

      let isNewTicket = false;
      if (!ticket) {
          ticket = await FindOrCreateTicketService(
              contact,
              wbot.id!,
              0, 
              companyId,
              isGroup ? contact : undefined
          );
          isNewTicket = true;
      }

      const body = getBodyMessage(msg);
      
      if (body) {
        await verifyMessage(msg, ticket, contact, wbot);
      } else {
        if(ticket.status === 'closed') {
             ticket = await FindOrCreateTicketService(contact, wbot.id!, 0, companyId, isGroup ? contact : undefined);
             isNewTicket = true;
        }
        await verifyMediaMessage(msg, ticket, contact, wbot);
      }
      
      await ticket.reload();
      if (ticket.status === 'closed') return;

      // --- ANATEL PROTOCOL GENERATOR ---
      if (isNewTicket && !isGroup) {
          const protocol = `${new Date().toISOString().slice(0,10).replace(/-/g, "")}${ticket.id}`;
          await wbot.sendMessage(msg.key.remoteJid!, { 
              text: `Seu número de protocolo de atendimento é: *${protocol}*` 
          });
      }

      // --- FLOWBUILDER ENGINE ---
      if (body && !isGroup && ticket.status !== 'closed') {
          const processedByFlow = await FlowEngineService(ticket, body, wbot);
          if (processedByFlow) return; 
      }

      // --- AUTO REPLIES ---
      const { count } = await (Message as any).findAndCountAll({ where: { ticketId: ticket.id } });
      if (count === 1 && !isGroup && !ticket.flowCampaignId) {
          const whatsapp = await (Whatsapp as any).findByPk(wbot.id);
          const isOutside = await isOutsideBusinessHours();
          
          let sentAutoReply = false;

          if (isOutside && whatsapp && whatsapp.outOfHoursMessage) {
              await wbot.sendMessage(msg.key.remoteJid!, { text: whatsapp.outOfHoursMessage });
              sentAutoReply = true;
          }
          else if (whatsapp && whatsapp.greetingMessage) {
              await wbot.sendMessage(msg.key.remoteJid!, { text: whatsapp.greetingMessage });
              sentAutoReply = true;
          }
          
          if(sentAutoReply && isOutside) return;
      }

      // --- AI AGENT ---
      if (!ticket.userId && !isGroup && (ticket.status === "pending" || ticket.status === "open") && body && !ticket.flowCampaignId) {
          const aiResponse = await UnifiedAiService({
              companyId: ticket.companyId || 1,
              prompt: body,
              history: "" 
          });

          if (aiResponse) {
              await wbot.sendPresenceUpdate("composing", msg.key.remoteJid!);
              await new Promise(r => setTimeout(r, 2000));
              const sentMsg = await wbot.sendMessage(msg.key.remoteJid!, { text: aiResponse });
              
              const botMsgData = {
                  id: sentMsg?.key.id || `AI_${new Date().getTime()}`,
                  ticketId: ticket.id,
                  contactId: undefined,
                  body: aiResponse,
                  fromMe: true,
                  mediaType: "chat",
                  read: true,
                  ack: 2
              };
              await CreateMessageService({ messageData: botMsgData, companyId: 1 });
              return; 
          }
      }

    } catch (err) {
      console.error(err);
      logger.error(`Error handling whatsapp message: ${err}`);
    }
  }
};