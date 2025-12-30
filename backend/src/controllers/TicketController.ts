import Ticket from "../database/models/Ticket.model";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import CreateTicketService from "../services/TicketServices/CreateTicketService";
import ListTicketsServiceKanban from "../services/TicketServices/ListTicketsServiceKanban";

export const indexKanban = async (req: any, res: any) => {
  const { date, showAll } = req.query;

  const tickets = await ListTicketsServiceKanban({
    date: date as string,
    showAll: showAll as string,
  });

  return res.json(tickets);
};

export const store = async (req: any, res: any) => {
  const { contactId, status, userId, queueId, whatsappId } = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    queueId,
    whatsappId,
  });

  return res.status(200).json(ticket);
};

export const update = async (req: any, res: any) => {
  const { ticketId } = req.params;
  const ticketData = req.body;
  const { companyId } = req.user;

  const ticket = await (Ticket as any).findByPk(ticketId, {
    include: ["contact"],
  });

  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  const oldStatus = ticket.status;

  // Update Ticket
  await ticket.update(ticketData);

  // NPS Logic: If ticket was open/pending and is now closed
  if (oldStatus !== "closed" && ticketData.status === "closed") {
    // In production check Settings "userRating" === "enabled"
    const npsEnabled = true;

    if (npsEnabled) {
      const body = `Atendimento encerrado. Por favor, avalie nosso atendimento:\n\nDigite de 1 a 3:\n1️⃣ - Insatisfeito\n2️⃣ - Satisfeito\n3️⃣ - Muito Satisfeito`;

      const messageData = {
        id: `nps_${Date.now()}`,
        ticketId: ticket.id,
        body: body,
        fromMe: true,
        read: true,
        mediaType: "chat",
        ack: 1,
      };

      await CreateMessageService({ messageData, companyId });
    }
  }

  return res.status(200).json(ticket);
};
