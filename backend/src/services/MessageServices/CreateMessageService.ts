import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import { getWbot } from "../../libs/wbot";

interface MessageData {
    id: string;
    ticketId: number;
    body: string | null;
    contactId?: number;
    fromMe?: boolean;
    read?: boolean;
    mediaType?: string;
    mediaUrl?: string;
    ack?: number;
    quotedMsgId?: string | null;
    isPrivate?: boolean;
}

interface Request {
    messageData: MessageData;
    companyId: number;
}

const CreateMessageService = async ({ messageData, companyId }: Request): Promise<Message> => {
    // 1. Save Message to DB
    const message = await (Message as any).create(messageData);
    
    // 2. Update Ticket Last Message
    const ticket = await (Ticket as any).findByPk(message.ticketId, { include: ["contact"] });
    if (ticket) {
        await (ticket as any).update({ lastMessage: message.body });
    }

    // 3. SEND TO WHATSAPP (ONLY IF NOT PRIVATE)
    if (!message.isPrivate && message.fromMe && ticket) {
        try {
            const wbot = getWbot(ticket.whatsappId);
            const remoteJid = ticket.contact.number + (ticket.isGroup ? "@g.us" : "@s.whatsapp.net");
            
            // If it's a text message (media handling is usually done in controller before calling this, 
            // but here we ensure text goes through if passed)
            if (message.mediaType === 'chat' && message.body) {
                await wbot.sendMessage(remoteJid, { text: message.body });
            }
        } catch (err) {
            console.error("Error sending WhatsApp message:", err);
            // Don't throw here to allow saving the message even if send fails (e.g. disconnected)
        }
    }

    // 4. Emit Socket (Visible to Agents)
    const io = getIO();
    io.to(message.ticketId.toString()).emit("appMessage", {
        action: "create",
        message,
        ticket: ticket,
        contact: ticket ? ticket.contact : null
    });

    return message;
};

export default CreateMessageService;